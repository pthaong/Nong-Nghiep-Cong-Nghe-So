/**
 * AgriSmart Admin - Diagnosis History Service
 * Admin chỉ đọc dữ liệu lịch sử chẩn đoán.
 */

(function () {
  "use strict";

  const CONFIG_BASE =
    window.APP_CONFIG?.API_BASE_URL ||
    window.API_BASE_URL ||
    "http://localhost:8080";

  // Tránh lỗi /api/api/... nếu config.js đã có /api
  const API_BASE = String(CONFIG_BASE).replace(/\/api\/?$/, "");

  async function request(url) {

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {

      let message = "Không thể tải lịch sử chẩn đoán bệnh.";

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


  // GET /api/admin/diagnoses
  async function getAll() {
    return request(
      `${API_BASE}/api/admin/diagnoses`
    );
  }


  // GET /api/admin/diagnoses/{id}
  async function getById(id) {

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {
      throw new Error("ID chẩn đoán không hợp lệ.");
    }

    return request(
      `${API_BASE}/api/admin/diagnoses/${encodeURIComponent(id)}`
    );
  }


  window.AdminDiagnosisService = {
    getAll,
    getById
  };

})();