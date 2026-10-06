/**
 * AgriSmart Admin - Season Service
 * Chỉ đọc dữ liệu mùa vụ dành cho Admin.
 * Không thay đổi API mùa vụ hiện tại của người dùng.
 */

(function () {
  "use strict";

  const API_BASE =
    window.APP_CONFIG?.API_BASE_URL ||
    window.API_BASE_URL ||
    "http://localhost:8080";

  async function request(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      let message = "Không thể tải dữ liệu mùa vụ.";

      try {
        const data = await response.json();

        if (data?.message) {
          message = data.message;
        }
      } catch (_) {
        // Giữ thông báo mặc định nếu response không phải JSON.
      }

      const error = new Error(message);
      error.status = response.status;

      throw error;
    }

    return response.json();
  }

  /**
   * Lấy toàn bộ mùa vụ của tất cả người dùng.
   * GET /api/admin/seasons
   */
  async function getAll() {
  return request(`${API_BASE}/admin/seasons`);
}

  /**
   * Lấy một mùa vụ theo ID.
   * GET /api/admin/seasons/{id}
   */
  async function getById(id) {
    if (id === null || id === undefined || String(id).trim() === "") {
      throw new Error("ID mùa vụ không hợp lệ.");
    }

    return request(
  `${API_BASE}/admin/seasons/${encodeURIComponent(id)}`
);
  }

  window.AdminSeasonService = {
    getAll,
    getById
  };
})();