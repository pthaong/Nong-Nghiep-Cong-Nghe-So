/**
 * app.js — Module "Mùa vụ"
 * ------------------------------------------------------------------
 * SeasonService: lớp trung gian thao tác dữ liệu Mùa vụ.
 * ĐANG CHẠY Ở CHẾ ĐỘ MOCK (USE_MOCK_DATA = true): dữ liệu lưu tạm ở
 * localStorage để demo giao diện mà không cần Backend.
 *
 * KHI BACKEND (JAVA) SẴN SÀNG:
 *   1) Đổi USE_MOCK_DATA = false
 *   2) Sửa API_BASE_URL cho đúng địa chỉ Backend thực tế
 *   3) Nếu API cần xác thực, thêm header Authorization trong authHeaders()
 * -> Phần giao diện (render, modal, sự kiện) KHÔNG cần sửa gì thêm.
 *
 * Hợp đồng dữ liệu:
 *   Season { id, name, crop, start:"YYYY-MM-DD", end:"YYYY-MM-DD", status }
 *   Field  { id, seasonId }   // chỉ dùng để đếm "Số ruộng" theo mùa vụ
 *
 * Endpoint gợi ý:
 *   GET    /api/seasons        -> getAllSeasons()
 *   GET    /api/fields         -> getAllFields()  (đếm số ruộng)
 *   POST   /api/seasons        -> createSeason(data)
 *   PUT    /api/seasons/{id}   -> updateSeason(id, data)
 *   DELETE /api/seasons/{id}   -> deleteSeason(id)
 * ------------------------------------------------------------------
 */
const SeasonService = (function () {
  const USE_MOCK_DATA = true;                       // TODO: đổi false khi có Backend thật
  const API_BASE_URL = 'https://api.agrismart.vn';   // TODO: đổi thành địa chỉ Backend thật

  const SEASONS_KEY = 'agrismart_seasons_v1';
  const FIELDS_KEY = 'agrismart_fields_v1';

  const MOCK_SEASONS = [
    { id: 's1', name: 'Vụ Đông Xuân 2026', crop: 'Lúa OM5451', start: '2026-01-10', end: '2026-04-20', status: 'Đang canh tác' },
    { id: 's2', name: 'Vụ Hè Thu 2026', crop: 'Cà chua', start: '2026-08-01', end: '2026-10-30', status: 'Đang canh tác' },
    { id: 's3', name: 'Vụ Thu Đông 2026', crop: 'Lúa OM18', start: '2026-09-01', end: '2026-12-15', status: 'Lên kế hoạch' }
  ];
  const MOCK_FIELDS = [
    { id: 'f1', seasonId: 's1' },
    { id: 'f2', seasonId: 's2' },
    { id: 'f3', seasonId: null },
    { id: 'f4', seasonId: 's3' }
  ];

  function authHeaders() {
    const token = localStorage.getItem('agrismart_token'); // TODO: lấy token đăng nhập thật
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) };
  }

  async function apiFetch(path, options) {
    const res = await fetch(API_BASE_URL + path, Object.assign({ headers: authHeaders() }, options));
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error('API lỗi ' + res.status + (msg ? (': ' + msg) : ''));
    }
    if (res.status === 204) return null;
    return res.json();
  }

  function loadMock(key, seed) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(key, JSON.stringify(seed));
      return JSON.parse(JSON.stringify(seed));
    } catch (e) {
      console.error('Lỗi đọc dữ liệu mock:', e);
      return JSON.parse(JSON.stringify(seed));
    }
  }
  function saveMock(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); }
    catch (e) { console.error('Lỗi lưu dữ liệu mock:', e); }
  }
  function genId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

  return {
    async getAllSeasons() {
      if (!USE_MOCK_DATA) return apiFetch('/api/seasons', { method: 'GET' });
      await delay(200);
      return loadMock(SEASONS_KEY, MOCK_SEASONS);
    },
    async getAllFields() {
      if (!USE_MOCK_DATA) return apiFetch('/api/fields', { method: 'GET' });
      await delay(120);
      return loadMock(FIELDS_KEY, MOCK_FIELDS);
    },
    async createSeason(data) {
      if (!USE_MOCK_DATA) return apiFetch('/api/seasons', { method: 'POST', body: JSON.stringify(data) });
      await delay(150);
      const list = loadMock(SEASONS_KEY, MOCK_SEASONS);
      const s = Object.assign({ id: genId() }, data);
      list.push(s);
      saveMock(SEASONS_KEY, list);
      return s;
    },
    async updateSeason(id, data) {
      if (!USE_MOCK_DATA) return apiFetch('/api/seasons/' + id, { method: 'PUT', body: JSON.stringify(data) });
      await delay(150);
      const list = loadMock(SEASONS_KEY, MOCK_SEASONS);
      const idx = list.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Không tìm thấy mùa vụ để cập nhật');
      list[idx] = Object.assign({}, list[idx], data, { id });
      saveMock(SEASONS_KEY, list);
      return list[idx];
    },
    async deleteSeason(id) {
      if (!USE_MOCK_DATA) { await apiFetch('/api/seasons/' + id, { method: 'DELETE' }); return true; }
      await delay(150);
      let list = loadMock(SEASONS_KEY, MOCK_SEASONS);
      list = list.filter((s) => s.id !== id);
      saveMock(SEASONS_KEY, list);
      return true;
    }
  };
})();

/* =====================================================================
   Giao diện — gọi dữ liệu qua SeasonService
   ===================================================================== */
(function () {
  let seasons = [];
  let fields = [];
  let deleteTargetId = null;

  const $tableBody = document.getElementById('seasonsTable');
  const seasonModal = new bootstrap.Modal(document.getElementById('seasonModal'));
  const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
  const toastEl = document.getElementById('appToast');
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  const $seasonForm = document.getElementById('seasonForm');
  const $seasonModalTitle = document.getElementById('seasonModalTitle');

  function showToast(msg, isError) {
    document.getElementById('appToastBody').textContent = msg;
    document.getElementById('appToastIcon').className = 'bi ' + (isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill') + ' me-2';
    toastEl.classList.toggle('text-bg-danger', !!isError);
    toast.show();
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ---- Icon + màu theo trạng thái mùa vụ ----
  function statusMeta(status) {
    if (status === 'Đang canh tác') return { cls: 'chip-ok', icon: 'bi-play-circle-fill' };
    if (status === 'Lên kế hoạch') return { cls: 'chip-info', icon: 'bi-hourglass-split' };
    return { cls: 'chip-warn', icon: 'bi-check-circle-fill' }; // Đã kết thúc
  }

  function loadingRow() {
    return `<tr><td colspan="7"><div class="empty-state"><div class="spinner-border text-success mb-2" role="status"></div><div>Đang tải danh sách mùa vụ...</div></div></td></tr>`;
  }
  function emptyRow(msg) {
    return `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-inbox d-block mb-2"></i>${msg}</div></td></tr>`;
  }
  function errorRow(msg) {
    return `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-exclamation-triangle d-block mb-2 text-danger"></i>${msg}</div></td></tr>`;
  }

  function renderRow(s) {
    const cnt = fields.filter((f) => f.seasonId === s.id).length;
    const meta = statusMeta(s.status);
    return `<tr>
      <td class="fw-semibold"><i class="bi bi-calendar3-range me-1 text-muted2"></i>${escapeHtml(s.name)}</td>
      <td><i class="bi bi-flower2 me-1 text-muted2"></i>${escapeHtml(s.crop)}</td>
      <td>${s.start}</td>
      <td>${s.end}</td>
      <td><span class="chip ${meta.cls}"><i class="bi ${meta.icon}"></i>${escapeHtml(s.status)}</span></td>
      <td><i class="bi bi-map me-1 text-muted2"></i>${cnt}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary me-1 btn-edit" data-id="${s.id}" title="Sửa"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${s.id}" data-name="${escapeHtml(s.name)}" title="Xoá"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }

  function paintSeasons() {
    $tableBody.innerHTML = seasons.map(renderRow).join('') || emptyRow('Chưa có mùa vụ nào. Nhấn "Thêm mùa vụ" để bắt đầu.');
  }

  async function loadSeasons() {
    $tableBody.innerHTML = loadingRow();
    try {
      [seasons, fields] = await Promise.all([SeasonService.getAllSeasons(), SeasonService.getAllFields()]);
      paintSeasons();
    } catch (err) {
      console.error(err);
      $tableBody.innerHTML = errorRow('Không tải được danh sách mùa vụ. Vui lòng thử lại sau.');
      showToast('Không tải được danh sách mùa vụ.', true);
    }
  }

  // ---- Modal Thêm / Sửa ----
  function openAddModal() {
    $seasonForm.reset();
    $seasonForm.classList.remove('was-validated');
    document.getElementById('seasonId').value = '';
    document.getElementById('seasonStatus').value = 'Lên kế hoạch';
    $seasonModalTitle.innerHTML = '<i class="bi bi-calendar-plus me-2"></i>Thêm mùa vụ';
    seasonModal.show();
  }

  function openEditModal(id) {
    const s = seasons.find((x) => x.id === id);
    if (!s) return;
    $seasonForm.classList.remove('was-validated');
    document.getElementById('seasonId').value = s.id;
    document.getElementById('seasonName').value = s.name;
    document.getElementById('seasonCrop').value = s.crop;
    document.getElementById('seasonStart').value = s.start;
    document.getElementById('seasonEnd').value = s.end;
    document.getElementById('seasonStatus').value = s.status;
    $seasonModalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Chỉnh sửa mùa vụ';
    seasonModal.show();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!$seasonForm.checkValidity()) { $seasonForm.classList.add('was-validated'); return; }

    const id = document.getElementById('seasonId').value;
    const data = {
      name: document.getElementById('seasonName').value.trim(),
      crop: document.getElementById('seasonCrop').value.trim(),
      start: document.getElementById('seasonStart').value,
      end: document.getElementById('seasonEnd').value,
      status: document.getElementById('seasonStatus').value
    };

    const $btn = document.getElementById('btnSaveSeason');
    const oldLabel = $btn.innerHTML;
    $btn.disabled = true;
    $btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Đang lưu...';
    try {
      if (id) { await SeasonService.updateSeason(id, data); showToast('Đã cập nhật mùa vụ thành công.'); }
      else { await SeasonService.createSeason(data); showToast('Đã thêm mùa vụ mới thành công.'); }
      seasonModal.hide();
      await loadSeasons();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra, vui lòng thử lại.', true);
    } finally {
      $btn.disabled = false;
      $btn.innerHTML = oldLabel;
    }
  }

  // ---- Xoá ----
  function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteTargetName').textContent = name || 'mùa vụ này';
    confirmModal.show();
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    const $btn = document.getElementById('btnConfirmDelete');
    const oldLabel = $btn.innerHTML;
    $btn.disabled = true;
    $btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Đang xoá...';
    try {
      await SeasonService.deleteSeason(deleteTargetId);
      showToast('Đã xoá mùa vụ khỏi danh sách.');
      confirmModal.hide();
      await loadSeasons();
    } catch (err) {
      console.error(err);
      showToast('Không xoá được, vui lòng thử lại.', true);
    } finally {
      deleteTargetId = null;
      $btn.disabled = false;
      $btn.innerHTML = oldLabel;
    }
  }

  // ---- Theme toggle ----
  function toggleTheme() {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = !cur ? (prefersDark ? 'light' : 'dark') : (cur === 'dark' ? 'light' : 'dark');
    root.setAttribute('data-theme', next);
    document.getElementById('themeIcon').className = next === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  }

  // ---- Khôi phục dữ liệu mẫu ----
  function resetMockData() {
    if (!confirm('Xoá toàn bộ dữ liệu đã thử và nạp lại 3 mùa vụ mẫu ban đầu?')) return;
    try {
      localStorage.removeItem('agrismart_seasons_v1');
      localStorage.removeItem('agrismart_fields_v1');
      showToast('Đã khôi phục dữ liệu mẫu ban đầu.');
      loadSeasons();
    } catch (e) {
      console.error(e);
      showToast('Không khôi phục được dữ liệu mẫu.', true);
    }
  }

  // ---- Gắn sự kiện ----
  function bindEvents() {
    document.getElementById('btnOpenAdd').addEventListener('click', openAddModal);
    document.getElementById('btnResetMock').addEventListener('click', resetMockData);
    document.getElementById('btnToggleTheme').addEventListener('click', toggleTheme);
    document.getElementById('btnToggleSidebar').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
    $seasonForm.addEventListener('submit', handleSubmit);
    document.getElementById('btnConfirmDelete').addEventListener('click', handleConfirmDelete);

    document.addEventListener('click', function (e) {
      const editBtn = e.target.closest('.btn-edit');
      if (editBtn) { openEditModal(editBtn.dataset.id); return; }
      const delBtn = e.target.closest('.btn-delete');
      if (delBtn) { openDeleteModal(delBtn.dataset.id, delBtn.dataset.name); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    loadSeasons();
  });
})();
