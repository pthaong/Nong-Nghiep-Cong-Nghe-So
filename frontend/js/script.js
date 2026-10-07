/* =====================================================================
   Admin Ruộng — kết nối API quản lý nông dân
   ---------------------------------------------------------------------
   API Backend bàn giao:
     POST /api/auth/login
     GET  /api/admin/users/farmers
     GET  /api/admin/users/farmers/search?keyword=Nguyen

   Module này chỉ ĐỌC dữ liệu, không có thêm / sửa / xóa ruộng.
   Token được đọc từ localStorage sau khi Admin đăng nhập.
   ===================================================================== */
const AdminFarmerService = (() => {
  const API_BASE_URL = 'http://localhost:8080';

  function getToken() {
    // Hỗ trợ cả 2 key để khớp các module đăng nhập khác nhau của project.
    return localStorage.getItem('agrismart_admin_token')
      || localStorage.getItem('agrismart_token')
      || '';
  }

  function authHeaders() {
    const token = getToken();
    return {
      Accept: 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    };
  }

  async function request(path) {
    const response = await fetch(API_BASE_URL + path, {
      method: 'GET',
      headers: authHeaders()
    });

    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập Admin.');
      }
      if (response.status === 403) {
        throw new Error('Tài khoản hiện tại không có quyền ADMIN.');
      }
      const message = body && typeof body === 'object' && body.message
        ? body.message
        : `API trả về lỗi HTTP ${response.status}.`;
      throw new Error(message);
    }

    return body;
  }

  return {
    getAllFarmers() {
      return request('/api/admin/users/farmers');
    },
    searchFarmers(keyword) {
      return request('/api/admin/users/farmers/search?keyword=' + encodeURIComponent(keyword));
    }
  };
})();

let farmers = [];

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function loadingHTML() {
  return `<div class="empty-state w-100">
    <div class="spinner-border text-success mb-2"></div>
    <div>Đang tải danh sách nông dân từ Backend...</div>
  </div>`;
}

function errorHTML(message) {
  return `<div class="empty-state w-100">
    <i class="bi bi-exclamation-triangle d-block mb-2 text-danger"></i>
    <div>${escapeHTML(message)}</div>
    <button class="btn btn-sm btn-forest mt-3" onclick="loadFarmers()">
      <i class="bi bi-arrow-clockwise me-1"></i>Thử lại
    </button>
  </div>`;
}

function emptyHTML(message = 'Không có nông dân nào.') {
  return `<div class="empty-state w-100">
    <i class="bi bi-inbox d-block mb-2"></i>${escapeHTML(message)}
  </div>`;
}

function farmerCardHTML(farmer) {
  const status = farmer.status || 'UNKNOWN';
  const statusText = status === 'ACTIVE' ? 'Đang hoạt động' : status;
  const statusClass = status === 'ACTIVE' ? 'chip-ok' : 'chip-warn';

  return `<div class="col-md-6">
    <div class="field-card h-100">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${escapeHTML(farmer.fullName || farmer.username || 'Chưa có tên')}</div>
          <div class="small text-muted2">@${escapeHTML(farmer.username || '')}</div>
        </div>
        <span class="chip ${statusClass}">${escapeHTML(statusText)}</span>
      </div>
      <div class="small text-muted2 mt-3">
        <div><i class="bi bi-envelope me-2"></i>${escapeHTML(farmer.email || 'Chưa có email')}</div>
        <div class="mt-1"><i class="bi bi-telephone me-2"></i>${escapeHTML(farmer.phone || 'Chưa có số điện thoại')}</div>
        <div class="mt-1"><i class="bi bi-person-badge me-2"></i>ID: ${escapeHTML(farmer.id)}</div>
      </div>
    </div>
  </div>`;
}

function paintFarmers() {
  const list = document.getElementById('cropsList');
  if (!list) return;

  list.innerHTML = farmers.length
    ? farmers.map(farmerCardHTML).join('')
    : emptyHTML('Backend không trả về nông dân nào.');
}

function hideCRUDUI() {
  // BE chưa bàn giao API thêm/sửa/xóa ruộng, nên ẩn các UI CRUD của bản mock.
  document.querySelectorAll('[data-bs-target="#fieldModal"]').forEach(el => el.remove());
  const modal = document.getElementById('fieldModal');
  if (modal) modal.remove();
}

async function loadFarmers() {
  const list = document.getElementById('cropsList');
  if (list) list.innerHTML = loadingHTML();

  try {
    const data = await AdminFarmerService.getAllFarmers();
    farmers = Array.isArray(data) ? data : [];
    paintFarmers();
  } catch (error) {
    console.error('Lỗi tải danh sách nông dân:', error);
    if (list) list.innerHTML = errorHTML(error.message || 'Không tải được dữ liệu từ Backend.');
  }
}

async function searchFarmers(keyword) {
  const value = String(keyword || '').trim();
  if (!value) return loadFarmers();

  const list = document.getElementById('cropsList');
  if (list) list.innerHTML = loadingHTML();

  try {
    const data = await AdminFarmerService.searchFarmers(value);
    farmers = Array.isArray(data) ? data : [];
    paintFarmers();
  } catch (error) {
    console.error('Lỗi tìm kiếm nông dân:', error);
    if (list) list.innerHTML = errorHTML(error.message || 'Không tìm kiếm được dữ liệu.');
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const next = !cur ? (prefersDark ? 'light' : 'dark') : (cur === 'dark' ? 'light' : 'dark');
  root.setAttribute('data-theme', next);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = next === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
}

// Giữ lại tên hàm cũ để HTML không bị lỗi nếu còn tham chiếu.
function loadCrops() { return loadFarmers(); }
function openFieldModal() { return false; }
function editField() { return false; }
function deleteField() { return false; }
function saveField() { return false; }

window.AdminFarmerService = AdminFarmerService;
window.loadFarmers = loadFarmers;
window.searchFarmers = searchFarmers;
window.loadCrops = loadCrops;
window.toggleTheme = toggleTheme;

window.addEventListener('DOMContentLoaded', () => {
  hideCRUDUI();
  loadFarmers();
});