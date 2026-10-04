/* AgriSmart Admin - Quản lý tài khoản nông dân
   Mọi dữ liệu Farmer đến từ Backend qua window.adminUserService.
   Không có mock, không lưu danh sách ở localStorage.

   Kiểm tra role ADMIN ở đây là kiểm soát phía frontend theo cơ chế session
   hiện tại; Backend vẫn phải tự phân quyền cho các API /api/admin/**.
*/
(function (global) {
  'use strict';

  const SESSION_KEY = 'agrismart_session';
  const LOGIN_PAGE = 'admin-login.html';
  const SEARCH_DEBOUNCE_MS = 350;

  const service = global.adminUserService;
  const byId = function (id) { return document.getElementById(id); };

  /* =====================================================
     SESSION GUARD
     ===================================================== */
  function readSession() {
    try {
      const raw =
        global.localStorage.getItem(SESSION_KEY) ||
        global.sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function isAdmin(session) {
    return !!session && String(session.role || '').toUpperCase() === 'ADMIN';
  }

  function logout() {
    try {
      global.localStorage.removeItem(SESSION_KEY);
      global.sessionStorage.removeItem(SESSION_KEY);
    } catch (_) { /* bỏ qua */ }
    global.location.replace(LOGIN_PAGE);
  }

  const session = readSession();

  if (!isAdmin(session)) {
    global.location.replace(LOGIN_PAGE);
    return;
  }

  /* =====================================================
     STATE
     ===================================================== */
  let users = [];
  let keyword = '';
  let loadSeq = 0;            // bỏ qua response của request cũ
  let searchTimer = null;
  const busyIds = new Set();  // các Farmer đang có thao tác chạy

  /* =====================================================
     HELPERS
     ===================================================== */
  function statusKind(status) {
    const value = String(status || '').trim().toUpperCase();
    if (value === 'ACTIVE') return 'active';
    if (value === 'LOCKED') return 'locked';
    return 'other';
  }

  function statusLabel(status) {
    const kind = statusKind(status);
    if (kind === 'active') return 'Đang hoạt động';
    if (kind === 'locked') return 'Đã khóa';
    return status ? String(status) : 'Không xác định';
  }

  function messageOf(error, fallback) {
    if (!error) return fallback;
    if (error.code === 'NETWORK') {
      return 'Không kết nối được tới Backend. Hãy kiểm tra Backend đang chạy và thử lại.';
    }
    return error.message || fallback;
  }

  function show(id, visible) {
    byId(id).hidden = !visible;
  }

  function showOnly(stateId) {
    ['stateLoading', 'stateError', 'stateEmpty', 'stateNoMatch', 'tableCard']
      .forEach(function (id) { show(id, id === stateId); });
  }

  function setActionAlert(message, type) {
    const el = byId('actionAlert');
    el.textContent = '';
    if (!message) {
      el.hidden = true;
      return;
    }
    const text = document.createElement('span');
    text.textContent = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Đóng thông báo');
    close.innerHTML = '&times;';
    close.addEventListener('click', function () { setActionAlert(''); });
    el.append(text, close);
    el.className = 'action-alert ' + (type === 'success' ? 'is-success' : 'is-error');
    el.hidden = false;
  }

  /* =====================================================
     RENDER
     ===================================================== */
  function cell(label, className) {
    const td = document.createElement('td');
    td.dataset.label = label;
    if (className) td.className = className;
    return td;
  }

  function actionButton(action, user, busy) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.action = action;
    btn.dataset.id = String(user.id);
    btn.disabled = busy;

    let icon = 'bi-lock';
    let label = 'Khóa';
    let cls = 'btn-outline-secondary';

    if (action === 'unlock') {
      icon = 'bi-unlock';
      label = 'Mở khóa';
    } else if (action === 'delete') {
      icon = 'bi-trash';
      label = 'Xóa';
      cls = 'btn-outline-danger';
    }

    btn.className = 'btn btn-sm ' + cls;
    btn.setAttribute('aria-label', label + ' tài khoản ' + (user.name || user.email || user.id));
    btn.innerHTML = '<i class="bi ' + icon + '"></i>';
    btn.append(document.createTextNode(label));
    return btn;
  }

  function buildRow(user, index) {
    const tr = document.createElement('tr');
    const busy = busyIds.has(String(user.id));

    const stt = cell('STT');
    stt.textContent = String(index + 1);

    const name = cell('Họ tên', 'cell-name');
    name.textContent = user.name || '—';

    const email = cell('Email', 'cell-muted');
    email.textContent = user.email || '—';

    const phone = cell('Số điện thoại', 'cell-muted');
    phone.textContent = user.phone || '—';

    const status = cell('Trạng thái');
    const badge = document.createElement('span');
    badge.className = 'status-badge status-' + statusKind(user.status);
    badge.textContent = statusLabel(user.status);
    status.appendChild(badge);

    const actions = cell('Thao tác', 'cell-actions');
    const wrap = document.createElement('div');
    wrap.className = 'row-actions';

    const toggleAction = statusKind(user.status) === 'locked' ? 'unlock' : 'lock';
    const toggleBtn = actionButton(toggleAction, user, busy);
    const deleteBtn = actionButton('delete', user, busy);

    if (busy) {
      const spinner = document.createElement('span');
      spinner.className = 'spinner-border';
      spinner.setAttribute('role', 'status');
      spinner.setAttribute('aria-label', 'Đang xử lý');
      wrap.append(toggleBtn, deleteBtn, spinner);
    } else {
      wrap.append(toggleBtn, deleteBtn);
    }
    actions.appendChild(wrap);

    tr.append(stt, name, email, phone, status, actions);
    return tr;
  }

  function renderTable() {
    const body = byId('userTableBody');
    body.textContent = '';
    users.forEach(function (user, index) {
      body.appendChild(buildRow(user, index));
    });
  }

  function renderList() {
    const summary = byId('summaryCount');

    if (!users.length) {
      summary.hidden = true;
      showOnly(keyword ? 'stateNoMatch' : 'stateEmpty');
      return;
    }

    summary.textContent = users.length + ' tài khoản';
    summary.hidden = false;
    renderTable();
    showOnly('tableCard');
  }

  /* =====================================================
     LOAD / SEARCH
     ===================================================== */
  async function load(options) {
    const opts = options || {};
    const seq = ++loadSeq;

    if (!opts.keepTable) {
      byId('loadingText').textContent = keyword
        ? 'Đang tìm kiếm...'
        : 'Đang tải danh sách người dùng...';
      byId('summaryCount').hidden = true;
      showOnly('stateLoading');
    } else {
      byId('tableCard').classList.add('is-busy');
    }

    try {
      const data = keyword
        ? await service.searchFarmers(keyword)
        : await service.getFarmers();

      if (seq !== loadSeq) return; // đã có request mới hơn
      users = data;
      renderList();
    } catch (error) {
      if (seq !== loadSeq) return;
      users = [];
      byId('summaryCount').hidden = true;
      byId('errorTitle').textContent = keyword
        ? 'Không thể tìm kiếm người dùng.'
        : 'Không thể tải danh sách người dùng.';
      byId('errorDesc').textContent = messageOf(error, 'Vui lòng thử lại sau.');
      showOnly('stateError');
    } finally {
      if (seq === loadSeq) byId('tableCard').classList.remove('is-busy');
    }
  }

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      const next = byId('searchInput').value.trim();
      if (next === keyword) return;
      keyword = next;
      setActionAlert('');
      load();
    }, SEARCH_DEBOUNCE_MS);
  }

  /* =====================================================
     CONFIRM MODAL
     ===================================================== */
  function confirmAction(opts) {
    const modalEl = byId('confirmModal');

    // CDN Bootstrap không tải được: dùng confirm() của trình duyệt.
    if (!global.bootstrap || !global.bootstrap.Modal) {
      return Promise.resolve(global.confirm(opts.message));
    }

    byId('confirmTitle').textContent = opts.title;
    byId('confirmBody').textContent = opts.message;

    const ok = byId('confirmOk');
    ok.textContent = opts.okText;
    ok.className = 'btn ' + (opts.danger ? 'btn-danger-solid' : 'btn-forest');

    const modal = global.bootstrap.Modal.getOrCreateInstance(modalEl);

    return new Promise(function (resolve) {
      let confirmed = false;

      function onOk() {
        confirmed = true;
        modal.hide();
      }
      function onHidden() {
        ok.removeEventListener('click', onOk);
        resolve(confirmed);
      }

      ok.addEventListener('click', onOk);
      modalEl.addEventListener('hidden.bs.modal', onHidden, { once: true });
      modal.show();
    });
  }

  /* =====================================================
     ROW ACTIONS: LOCK / UNLOCK / DELETE
     ===================================================== */
  function findUser(id) {
    return users.find(function (u) { return String(u.id) === String(id); });
  }

  async function runAction(action, user) {
    const key = String(user.id);
    const display = user.name || user.email || ('#' + user.id);

    const plan = {
      lock: {
        title: 'Khóa tài khoản',
        message: 'Khóa tài khoản "' + display + '"? Người dùng sẽ không thể đăng nhập.',
        okText: 'Khóa',
        danger: false,
        call: service.lockUser,
        done: 'Đã khóa tài khoản "' + display + '".',
        fail: 'Không thể khóa tài khoản.'
      },
      unlock: {
        title: 'Mở khóa tài khoản',
        message: 'Mở khóa tài khoản "' + display + '"?',
        okText: 'Mở khóa',
        danger: false,
        call: service.unlockUser,
        done: 'Đã mở khóa tài khoản "' + display + '".',
        fail: 'Không thể mở khóa tài khoản.'
      },
      delete: {
        title: 'Xóa tài khoản',
        message: 'Xóa vĩnh viễn tài khoản "' + display + '"? Thao tác này không thể hoàn tác.',
        okText: 'Xóa',
        danger: true,
        call: service.deleteUser,
        done: 'Đã xóa tài khoản "' + display + '".',
        fail: 'Không thể xóa tài khoản.'
      }
    }[action];

    if (!plan || busyIds.has(key)) return;

    const confirmed = await confirmAction(plan);
    if (!confirmed || busyIds.has(key)) return;

    setActionAlert('');
    busyIds.add(key);
    renderTable();

    try {
      await plan.call(user.id);
      busyIds.delete(key);
      setActionAlert(plan.done, 'success');
      // Tải lại từ Backend để UI luôn khớp dữ liệu thật.
      await load({ keepTable: true });
    } catch (error) {
      busyIds.delete(key);
      setActionAlert(plan.fail + ' ' + messageOf(error, ''), 'error');
      renderTable(); // dữ liệu giữ nguyên như Backend đang có
    }
  }

  function onTableClick(event) {
    const btn = event.target.closest('button[data-action]');
    if (!btn || btn.disabled) return;

    const user = findUser(btn.dataset.id);
    if (user) runAction(btn.dataset.action, user);
  }

  /* =====================================================
     INIT
     ===================================================== */
  function init() {
    byId('adminName').innerHTML = '<i class="bi bi-person-circle me-1"></i>';
    byId('adminName').append(document.createTextNode(session.name || session.email || 'Admin'));

    byId('btnLogout').addEventListener('click', logout);
    byId('btnRefresh').addEventListener('click', function () { load(); });
    byId('btnRetry').addEventListener('click', function () { load(); });
    byId('userTableBody').addEventListener('click', onTableClick);

    const search = byId('searchInput');
    search.addEventListener('input', onSearchInput);
    search.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      clearTimeout(searchTimer);
      keyword = search.value.trim();
      load();
    });

    byId('adminApp').classList.add('ready');
    load();
  }

  init();
})(window);
