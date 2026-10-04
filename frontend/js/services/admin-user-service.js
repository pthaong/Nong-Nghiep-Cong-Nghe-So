/* AgriSmart Admin User Service
   Backend API integration (AdminUserController):
   GET    /api/admin/users/farmers                  -> List<AdminUserResponse>
   GET    /api/admin/users/farmers/search?keyword=  -> List<AdminUserResponse>
   PUT    /api/admin/users/{id}/lock                -> AdminUserResponse
   PUT    /api/admin/users/{id}/unlock              -> AdminUserResponse
   DELETE /api/admin/users/{id}                     -> 204 No Content

   AdminUserResponse: { id, name, email, phone, role, status }

   Service chỉ gọi API, kiểm tra HTTP status, parse JSON và ném lỗi có
   message rõ ràng. Không có dữ liệu mock trong file này.
*/

(function (global) {
  'use strict';

  const REQUEST_TIMEOUT_MS = 15000;

  function getBaseUrl() {
    const base =
      (global.APP_CONFIG && global.APP_CONFIG.API_BASE_URL) ||
      'http://localhost:8080/api';

    return String(base).replace(/\/+$/, '');
  }

  function createError(code, message, extra) {
    const error = new Error(message);
    error.code = code;
    return Object.assign(error, extra || {});
  }

  // Đọc message lỗi từ body của Backend ({success, message, errors}).
  function extractMessage(data, status) {
    if (data && typeof data === 'object') {
      if (data.errors && typeof data.errors === 'object') {
        const details = Object.values(data.errors)
          .filter(function (v) { return typeof v === 'string' && v; });
        if (details.length) return details.join(' ');
      }
      if (typeof data.message === 'string' && data.message) {
        return data.message;
      }
    }
    return 'Backend trả về lỗi HTTP ' + status + '.';
  }

  async function request(path, options) {
    const opts = options || {};
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

    let response;

    try {
      response = await fetch(getBaseUrl() + path, {
        method: opts.method || 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
    } catch (cause) {
      const timedOut = cause && cause.name === 'AbortError';
      throw createError(
        timedOut ? 'TIMEOUT' : 'NETWORK',
        timedOut
          ? 'Backend phản hồi quá lâu. Vui lòng thử lại.'
          : 'Không kết nối được tới Backend.',
        { cause: cause }
      );
    } finally {
      clearTimeout(timer);
    }

    let data = null;

    // 204 No Content không có body.
    if (response.status !== 204) {
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }
    }

    if (!response.ok) {
      throw createError('HTTP', extractMessage(data, response.status), {
        status: response.status
      });
    }

    return data;
  }

  function ensureList(data) {
    if (!Array.isArray(data)) {
      throw createError('INVALID_DATA', 'Dữ liệu Backend trả về không hợp lệ.');
    }
    return data;
  }

  function ensureId(id) {
    if (id === null || id === undefined || id === '') {
      throw createError('INVALID_ID', 'Thiếu mã người dùng.');
    }
    return encodeURIComponent(String(id));
  }

  async function getFarmers() {
    return ensureList(await request('/admin/users/farmers'));
  }

  async function searchFarmers(keyword) {
    return ensureList(await request(
      '/admin/users/farmers/search?keyword=' +
      encodeURIComponent(String(keyword || '').trim())
    ));
  }

  function lockUser(id) {
    return request('/admin/users/' + ensureId(id) + '/lock', { method: 'PUT' });
  }

  function unlockUser(id) {
    return request('/admin/users/' + ensureId(id) + '/unlock', { method: 'PUT' });
  }

  async function deleteUser(id) {
    await request('/admin/users/' + ensureId(id), { method: 'DELETE' });
    return true;
  }

  global.adminUserService = {
    getFarmers,
    searchFarmers,
    lockUser,
    unlockUser,
    deleteUser
  };

})(window);
