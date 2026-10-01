/**
 * nhatky-app.js — Module "Nhật ký canh tác"
 *
 * Kết nối Backend thật:
 *   Base URL: http://localhost:8080/api
 *
 * Flow:
 *   agrismart_session.userId
 *       -> farmerId
 *       -> GET /seasons?farmerId={farmerId}
 *       -> user chọn season.id
 *       -> GET /seasons/{seasonId}/diaries?farmerId={farmerId}
 *
 * Diary API:
 *   GET    /seasons/{seasonId}/diaries?farmerId={farmerId}
 *   GET    /seasons/{seasonId}/diaries/{diaryId}?farmerId={farmerId}
 *   POST   /seasons/{seasonId}/diaries?farmerId={farmerId}
 *   PUT    /seasons/{seasonId}/diaries/{diaryId}?farmerId={farmerId}
 *   DELETE /seasons/{seasonId}/diaries/{diaryId}?farmerId={farmerId}
 *
 * POST/PUT body:
 *   activityDate, activityType, content,
 *   waterAmount, fertilizerAmount, pesticideAmount, notes
 *
 * Không dùng JWT/Bearer cho API Diary hiện tại.
 */

const API_BASE_URL = 'http://localhost:8080/api';

const ApiError = class extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
};

function getSession() {
  const raw =
    localStorage.getItem('agrismart_session') ||
    sessionStorage.getItem('agrismart_session');

  if (!raw) {
    throw new Error('Không tìm thấy phiên đăng nhập agrismart_session.');
  }

  try {
    const session = JSON.parse(raw);
    const userId = session?.userId;

    if (userId === undefined || userId === null || userId === '') {
      throw new Error('agrismart_session không có userId.');
    }

    return session;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('agrismart_session không đúng định dạng JSON.');
    }
    throw error;
  }
}

function getFarmerId() {
  return getSession().userId;
}

function buildQuery(params) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

function buildUrl(path, params = {}) {
  return `${API_BASE_URL}${path}${buildQuery(params)}`;
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(status, body) {
  if (body && typeof body === 'object') {
    if (body.errors && typeof body.errors === 'object') {
      const validationMessages = Object.entries(body.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(' | ');

      if (validationMessages) {
        return validationMessages;
      }
    }

    if (body.message) {
      return body.message;
    }
  }

  switch (status) {
    case 400:
      return 'Dữ liệu gửi lên không hợp lệ.';
    case 403:
      return 'Bạn không có quyền truy cập mùa vụ này.';
    case 404:
      return 'Không tìm thấy mùa vụ hoặc nhật ký.';
    case 500:
      return 'Backend đang xảy ra lỗi máy chủ.';
    default:
      return `API trả về lỗi HTTP ${status}.`;
  }
}

async function apiFetch(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers || {})
    },
    body: options.body
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(response.status, body),
      response.status,
      body
    );
  }

  return body;
}

const SeasonService = {
  async getAllSeasons(farmerId) {
    return apiFetch('/seasons', {
      method: 'GET',
      // apiFetch nhận path/query riêng nên gọi trực tiếp ở dưới.
    }).catch(async (error) => {
      // Không dùng catch để nuốt lỗi; nhánh này chỉ để giữ interface.
      throw error;
    });
  }
};

// API helper riêng vì apiFetch ở trên nhận path, còn query phải được nối vào URL.
async function request(path, options = {}, query = {}) {
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers || {})
    },
    body: options.body
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(response.status, body),
      response.status,
      body
    );
  }

  return body;
}

const DiaryService = {
  async getSeasons(farmerId) {
    return request('/seasons', {}, { farmerId });
  },

  async getAllDiaries(seasonId, farmerId) {
    return request(
      `/seasons/${encodeURIComponent(seasonId)}/diaries`,
      {},
      { farmerId }
    );
  },

  async getDiary(seasonId, diaryId, farmerId) {
    return request(
      `/seasons/${encodeURIComponent(seasonId)}/diaries/${encodeURIComponent(diaryId)}`,
      {},
      { farmerId }
    );
  },

  async createDiary(seasonId, farmerId, data) {
    return request(
      `/seasons/${encodeURIComponent(seasonId)}/diaries`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      { farmerId }
    );
  },

  async updateDiary(seasonId, diaryId, farmerId, data) {
    return request(
      `/seasons/${encodeURIComponent(seasonId)}/diaries/${encodeURIComponent(diaryId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      { farmerId }
    );
  },

  async deleteDiary(seasonId, diaryId, farmerId) {
    return request(
      `/seasons/${encodeURIComponent(seasonId)}/diaries/${encodeURIComponent(diaryId)}`,
      {
        method: 'DELETE'
      },
      { farmerId }
    );
  }
};

(function () {
  let farmerId = null;
  let seasons = [];
  let logs = [];
  let selectedSeasonId = null;
  let deleteTargetId = null;

  const $timeline = document.getElementById('logTimeline');
  const $filterSeason = document.getElementById('logFilterSeason');
  const $seasonSummary = document.getElementById('seasonSummary');
  const $logSeason = document.getElementById('logSeason');
  const $logForm = document.getElementById('logForm');
  const $logModalTitle = document.getElementById('logModalTitle');
  const $btnOpenAdd = document.getElementById('btnOpenAdd');
  const $btnSaveLog = document.getElementById('btnSaveLog');

  const logModal = new bootstrap.Modal(document.getElementById('logModal'));
  const confirmModal = new bootstrap.Modal(
    document.getElementById('confirmDeleteModal')
  );

  const toastEl = document.getElementById('appToast');
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });

  function showToast(message, isError = false) {
    const body = document.getElementById('appToastBody');
    const icon = document.getElementById('appToastIcon');

    body.textContent = message;

    icon.className =
      'bi ' +
      (isError
        ? 'bi-exclamation-triangle-fill'
        : 'bi-check-circle-fill') +
      ' me-2';

    toastEl.classList.toggle('text-bg-danger', isError);
    toastEl.classList.toggle('text-bg-success', !isError);

    toast.show();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function formatNumber(value) {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return escapeHtml(value);
    }

    return number.toLocaleString('vi-VN', {
      maximumFractionDigits: 2
    });
  }

  function formatAmountLine(label, value) {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    return `<span class="me-3"><strong>${label}:</strong> ${formatNumber(value)}</span>`;
  }

  function typeMeta(type) {
    switch (type) {
      case 'Tưới nước':
        return { cls: 'type-tuoi', icon: 'bi-droplet-fill' };
      case 'Bón phân':
        return { cls: 'type-bon', icon: 'bi-flower1' };
      case 'Phun thuốc':
        return { cls: 'type-phun', icon: 'bi-bug-fill' };
      case 'Làm cỏ':
        return { cls: 'type-co', icon: 'bi-scissors' };
      default:
        return { cls: 'type-khac', icon: 'bi-three-dots' };
    }
  }

  function seasonName(seasonId) {
    const season = seasons.find(
      (item) => String(item.id) === String(seasonId)
    );

    if (!season) {
      return `Mùa vụ #${seasonId}`;
    }

    return season.name || `Mùa vụ #${season.id}`;
  }

  function seasonLabel(season) {
    const parts = [season.name];

    if (season.crop) {
      parts.push(season.crop);
    }

    if (season.status) {
      parts.push(season.status);
    }

    return parts.filter(Boolean).join(' · ');
  }

  function loadingState(message = 'Đang tải dữ liệu...') {
    return `
      <div class="empty-state">
        <div class="spinner-border text-success mb-2" role="status"></div>
        <div>${escapeHtml(message)}</div>
      </div>
    `;
  }

  function emptyState(message) {
    return `
      <div class="empty-state">
        <i class="bi bi-inbox d-block mb-2"></i>
        ${escapeHtml(message)}
      </div>
    `;
  }

  function errorState(message) {
    return `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle d-block mb-2 text-danger"></i>
        ${escapeHtml(message)}
      </div>
    `;
  }

  function renderSeasonOptions() {
    if (!seasons.length) {
      const empty = '<option value="">Không có mùa vụ</option>';
      $filterSeason.innerHTML = empty;
      $logSeason.innerHTML = empty;
      return;
    }

    const options = seasons
      .map(
        (season) =>
          `<option value="${escapeHtml(season.id)}">${escapeHtml(
            seasonLabel(season)
          )}</option>`
      )
      .join('');

    $filterSeason.innerHTML =
      '<option value="">-- Chọn mùa vụ --</option>' + options;

    $logSeason.innerHTML = options;
  }

  function syncSelectedSeasonUI() {
    const selected = seasons.find(
      (season) => String(season.id) === String(selectedSeasonId)
    );

    $filterSeason.value =
      selectedSeasonId === null || selectedSeasonId === undefined
        ? ''
        : String(selectedSeasonId);

    $logSeason.value =
      selectedSeasonId === null || selectedSeasonId === undefined
        ? ''
        : String(selectedSeasonId);

    $btnOpenAdd.disabled = !selectedSeasonId;

    if (selected) {
      $seasonSummary.textContent = `${selected.name || 'Mùa vụ'}${
        selected.crop ? ` · ${selected.crop}` : ''
      }`;
    } else {
      $seasonSummary.textContent = '';
    }
  }

  function getFilteredLogs() {
    return logs
      .slice()
      .sort((a, b) => {
        const dateCompare = String(b.activityDate).localeCompare(
          String(a.activityDate)
        );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return Number(b.id) - Number(a.id);
      });
  }

  function renderItem(log) {
    const meta = typeMeta(log.activityType);

    const amounts = [
      formatAmountLine('Nước', log.waterAmount),
      formatAmountLine('Phân', log.fertilizerAmount),
      formatAmountLine('Thuốc', log.pesticideAmount)
    ]
      .filter(Boolean)
      .join('');

    return `
      <div class="timeline-item ${meta.cls}">
        <div class="ti-head">
          <div>
            <span class="ti-title">
              <i class="bi ${meta.icon}"></i>
              ${escapeHtml(log.activityType)}
            </span>
            <span class="ti-field">
              · ${escapeHtml(seasonName(log.seasonId))}
            </span>
          </div>

          <div class="ti-date">
            <i class="bi bi-calendar-event me-1"></i>
            ${escapeHtml(log.activityDate)}
          </div>
        </div>

        <div class="ti-content">
          ${escapeHtml(log.content)}
        </div>

        ${
          amounts
            ? `
          <div class="ti-quantity">
            <i class="bi bi-droplet-half me-1"></i>
            ${amounts}
          </div>
        `
            : ''
        }

        ${
          log.notes
            ? `
          <div class="ti-note">
            <i class="bi bi-pencil-square me-1"></i>
            ${escapeHtml(log.notes)}
          </div>
        `
            : ''
        }

        <div class="ti-actions">
          <button
            class="btn btn-sm btn-outline-secondary btn-edit"
            data-id="${escapeHtml(log.id)}">
            <i class="bi bi-pencil me-1"></i>Sửa
          </button>

          <button
            class="btn btn-sm btn-outline-danger btn-delete"
            data-id="${escapeHtml(log.id)}"
            data-name="${escapeHtml(
              `${log.activityType} - ${log.activityDate}`
            )}">
            <i class="bi bi-trash me-1"></i>Xoá
          </button>
        </div>
      </div>
    `;
  }

  function paint() {
    if (!selectedSeasonId) {
      $timeline.innerHTML = emptyState(
        'Vui lòng chọn một mùa vụ để xem nhật ký canh tác.'
      );
      return;
    }

    const list = getFilteredLogs();

    $timeline.innerHTML =
      list.map(renderItem).join('') ||
      emptyState(
        'Mùa vụ này chưa có nhật ký nào. Nhấn "Ghi nhật ký mới" để bắt đầu.'
      );
  }

  async function loadSeasons() {
    $timeline.innerHTML = loadingState('Đang tải danh sách mùa vụ...');

    try {
      farmerId = getFarmerId();

      seasons = await DiaryService.getSeasons(farmerId);

      if (!Array.isArray(seasons)) {
        throw new Error('API mùa vụ không trả về một mảng dữ liệu.');
      }

      renderSeasonOptions();

      if (seasons.length === 0) {
        selectedSeasonId = null;
        syncSelectedSeasonUI();
        $timeline.innerHTML = emptyState(
          'Chưa có mùa vụ nào. Hãy tạo mùa vụ trước khi ghi nhật ký.'
        );
        return;
      }

      selectedSeasonId = seasons[0].id;
      syncSelectedSeasonUI();

      await loadDiaries();
    } catch (error) {
      console.error('Lỗi loadSeasons:', error);

      const message =
        error instanceof ApiError
          ? error.message
          : error.message || 'Không tải được danh sách mùa vụ.';

      $timeline.innerHTML = errorState(message);
      showToast(message, true);
    }
  }

  async function loadDiaries() {
    if (!selectedSeasonId) {
      logs = [];
      paint();
      return;
    }

    $timeline.innerHTML = loadingState(
      `Đang tải nhật ký của ${seasonName(selectedSeasonId)}...`
    );

    try {
      logs = await DiaryService.getAllDiaries(
        selectedSeasonId,
        farmerId
      );

      if (!Array.isArray(logs)) {
        throw new Error('API nhật ký không trả về một mảng dữ liệu.');
      }

      paint();
    } catch (error) {
      console.error('Lỗi loadDiaries:', error);

      const message =
        error instanceof ApiError
          ? error.message
          : error.message || 'Không tải được nhật ký canh tác.';

      $timeline.innerHTML = errorState(message);
      showToast(message, true);
    }
  }

  function resetForm() {
    $logForm.reset();
    $logForm.classList.remove('was-validated');

    document.getElementById('logId').value = '';
    document.getElementById('logDate').value =
      new Date().toISOString().slice(0, 10);

    document.getElementById('logWaterAmount').value = '';
    document.getElementById('logFertilizerAmount').value = '';
    document.getElementById('logPesticideAmount').value = '';

    $logSeason.value =
      selectedSeasonId !== null && selectedSeasonId !== undefined
        ? String(selectedSeasonId)
        : '';
  }

  function openAddModal() {
    if (!selectedSeasonId) {
      showToast('Vui lòng chọn mùa vụ trước.', true);
      return;
    }

    resetForm();

    $logModalTitle.innerHTML =
      '<i class="bi bi-journal-plus me-2"></i>Ghi nhật ký mới';

    logModal.show();
  }

  function openEditModal(id) {
    const log = logs.find((item) => String(item.id) === String(id));

    if (!log) {
      showToast('Không tìm thấy nhật ký cần sửa.', true);
      return;
    }

    $logForm.classList.remove('was-validated');

    document.getElementById('logId').value = log.id;
    document.getElementById('logSeason').value = String(log.seasonId);
    document.getElementById('logDate').value = log.activityDate || '';
    document.getElementById('logType').value = log.activityType || '';
    document.getElementById('logContent').value = log.content || '';
    document.getElementById('logWaterAmount').value =
      log.waterAmount ?? '';
    document.getElementById('logFertilizerAmount').value =
      log.fertilizerAmount ?? '';
    document.getElementById('logPesticideAmount').value =
      log.pesticideAmount ?? '';
    document.getElementById('logNote').value = log.notes || '';

    $logModalTitle.innerHTML =
      '<i class="bi bi-pencil-square me-2"></i>Chỉnh sửa nhật ký';

    logModal.show();
  }

  function nullableNumber(elementId) {
    const value = document.getElementById(elementId).value.trim();

    if (value === '') {
      return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
      throw new Error('Các trường số lượng phải là số từ 0 trở lên.');
    }

    return number;
  }

  function buildDiaryPayload() {
    const activityDate = document.getElementById('logDate').value;
    const activityType = document.getElementById('logType').value.trim();
    const content = document.getElementById('logContent').value.trim();
    const notes = document.getElementById('logNote').value.trim();

    if (!activityDate || !activityType || !content) {
      throw new Error(
        'Vui lòng nhập đầy đủ ngày thực hiện, loại hoạt động và nội dung.'
      );
    }

    if (activityType.length > 100) {
      throw new Error('Loại hoạt động không được vượt quá 100 ký tự.');
    }

    return {
      activityDate,
      activityType,
      content,
      waterAmount: nullableNumber('logWaterAmount'),
      fertilizerAmount: nullableNumber('logFertilizerAmount'),
      pesticideAmount: nullableNumber('logPesticideAmount'),
      notes
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!$logForm.checkValidity()) {
      $logForm.classList.add('was-validated');
      return;
    }

    let payload;

    try {
      payload = buildDiaryPayload();
    } catch (error) {
      showToast(error.message, true);
      return;
    }

    const diaryId = document.getElementById('logId').value;
    const seasonId = document.getElementById('logSeason').value;

    if (!seasonId) {
      showToast('Vui lòng chọn mùa vụ.', true);
      return;
    }

    $btnSaveLog.disabled = true;

    const oldLabel = $btnSaveLog.innerHTML;
    $btnSaveLog.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1"></span>Đang lưu...';

    try {
      if (diaryId) {
        await DiaryService.updateDiary(
          seasonId,
          diaryId,
          farmerId,
          payload
        );

        selectedSeasonId = Number.isNaN(Number(seasonId))
          ? seasonId
          : Number(seasonId);

        showToast('Đã cập nhật nhật ký thành công.');
      } else {
        await DiaryService.createDiary(
          seasonId,
          farmerId,
          payload
        );

        selectedSeasonId = Number.isNaN(Number(seasonId))
          ? seasonId
          : Number(seasonId);

        showToast('Đã ghi nhật ký mới thành công.');
      }

      syncSelectedSeasonUI();
      logModal.hide();
      await loadDiaries();
    } catch (error) {
      console.error('Lỗi lưu diary:', error);

      const message =
        error instanceof ApiError
          ? error.message
          : error.message || 'Không thể lưu nhật ký.';

      showToast(message, true);
    } finally {
      $btnSaveLog.disabled = false;
      $btnSaveLog.innerHTML = oldLabel;
    }
  }

  function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteTargetName').textContent = name || 'này';
    confirmModal.show();
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId || !selectedSeasonId) {
      return;
    }

    const $btn = document.getElementById('btnConfirmDelete');
    const oldLabel = $btn.innerHTML;

    $btn.disabled = true;
    $btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1"></span>Đang xoá...';

    try {
      await DiaryService.deleteDiary(
        selectedSeasonId,
        deleteTargetId,
        farmerId
      );

      confirmModal.hide();
      showToast('Đã xoá nhật ký.');

      await loadDiaries();
    } catch (error) {
      console.error('Lỗi xoá diary:', error);

      const message =
        error instanceof ApiError
          ? error.message
          : error.message || 'Không xoá được nhật ký.';

      showToast(message, true);
    } finally {
      deleteTargetId = null;
      $btn.disabled = false;
      $btn.innerHTML = oldLabel;
    }
  }

  function handleSeasonChange(event) {
    const value = event.target.value;

    if (!value) {
      selectedSeasonId = null;
      logs = [];
      syncSelectedSeasonUI();
      paint();
      return;
    }

    const season = seasons.find(
      (item) => String(item.id) === String(value)
    );

    if (!season) {
      showToast('Mùa vụ được chọn không tồn tại.', true);
      return;
    }

    selectedSeasonId = season.id;
    syncSelectedSeasonUI();
    loadDiaries();
  }

  function handleModalSeasonChange() {
    const value = $logSeason.value;

    if (!value) {
      return;
    }

    const season = seasons.find(
      (item) => String(item.id) === String(value)
    );

    if (season && !document.getElementById('logId').value) {
      selectedSeasonId = season.id;
      syncSelectedSeasonUI();
      loadDiaries();
    }
  }

  function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const next = !current
      ? prefersDark
        ? 'light'
        : 'dark'
      : current === 'dark'
        ? 'light'
        : 'dark';

    root.setAttribute('data-theme', next);

    document.getElementById('themeIcon').className =
      next === 'dark'
        ? 'bi bi-sun'
        : 'bi bi-moon-stars';
  }

  function handleLogout() {
    // Không tự xoá session ở đây vì cấu trúc đăng nhập của project
    // chưa được xác định trong module Nhật ký.
    showToast('Hãy sử dụng chức năng đăng xuất của hệ thống.');
  }

  function bindEvents() {
    $btnOpenAdd.addEventListener('click', openAddModal);

    document
      .getElementById('btnToggleTheme')
      .addEventListener('click', toggleTheme);

    document
      .getElementById('btnToggleSidebar')
      .addEventListener('click', () => {
        document
          .getElementById('sidebar')
          .classList.toggle('open');
      });

    document
      .getElementById('btnLogout')
      .addEventListener('click', handleLogout);

    $filterSeason.addEventListener('change', handleSeasonChange);
    $logSeason.addEventListener('change', handleModalSeasonChange);

    $logForm.addEventListener('submit', handleSubmit);

    document
      .getElementById('btnConfirmDelete')
      .addEventListener('click', handleConfirmDelete);

    document.addEventListener('click', (event) => {
      const editButton = event.target.closest('.btn-edit');

      if (editButton) {
        openEditModal(editButton.dataset.id);
        return;
      }

      const deleteButton = event.target.closest('.btn-delete');

      if (deleteButton) {
        openDeleteModal(
          deleteButton.dataset.id,
          deleteButton.dataset.name
        );
      }
    });
  }

  async function init() {
    bindEvents();

    try {
      await loadSeasons();
    } catch (error) {
      console.error('Lỗi khởi tạo module Nhật ký:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
