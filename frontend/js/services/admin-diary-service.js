/**
 * AgriSmart Admin - Farming Diary Service
 * Admin chỉ đọc dữ liệu nhật ký canh tác.
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

      let message = "Không thể tải dữ liệu nhật ký canh tác.";

      try {

        const data = await response.json();

        if (data?.message) {
          message = data.message;
        }

      } catch (_) {
        // Giữ thông báo mặc định.
      }

      const error = new Error(message);
      error.status = response.status;

      throw error;
    }

    return response.json();
  }


  /**
   * GET /api/admin/diaries
   */
  async function getAll() {
  return request(
    `${API_BASE}/admin/diaries`
  );
}


  /**
   * GET /api/admin/diaries/{id}
   */
  async function getById(id) {

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {
      throw new Error("ID nhật ký không hợp lệ.");
    }

    return request(
  `${API_BASE}/admin/diaries/${encodeURIComponent(id)}`
);
  }


  window.AdminDiaryService = {
    getAll,
    getById
  };

})();