/**
 * AgriSmart - Notification Service
 * Kết nối Notification API thật của Backend.
 */

(function (global) {
  "use strict";

  const CONFIG_BASE =
  global.APP_CONFIG?.API_BASE_URL ||
  global.API_BASE_URL ||
  "http://localhost:8080";

const API_BASE = CONFIG_BASE.replace(/\/+$/, "").replace(/\/api$/, "");

  const SESSION_KEY = "agrismart_session";

  // =========================
  // SESSION
  // =========================

  function getSession() {
    const raw =
      global.localStorage.getItem(SESSION_KEY) ||
      global.sessionStorage.getItem(SESSION_KEY);

    if (!raw) {
      throw new Error("Không tìm thấy phiên đăng nhập.");
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error("Phiên đăng nhập không hợp lệ.");
    }
  }

  function getUserId() {
    const session = getSession();
    const userId = session?.userId;

    if (
      userId === undefined ||
      userId === null ||
      String(userId).trim() === ""
    ) {
      throw new Error("Không tìm thấy userId trong phiên đăng nhập.");
    }

    return userId;
  }

  // =========================
  // REQUEST
  // =========================

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      let message = `Notification API lỗi ${response.status}`;

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

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();

    return text ? JSON.parse(text) : null;
  }

  // =========================
  // NORMALIZE
  // =========================

  function normalizeNotification(raw) {
    const source = raw || {};

    return {
      id: source.id,
      userId: source.userId,

      title:
        source.title ||
        "Thông báo",

      message:
        source.message ||
        "",

      type: String(
        source.type || "SYSTEM"
      ).toUpperCase(),

      read:
        source.isRead === true ||
        source.read === true,

      createdAt:
        source.createdAt ||
        source.created_at ||
        null
    };
  }

  // =========================
  // GET ALL
  // GET /api/notifications/user/{userId}
  // =========================

  async function getNotifications() {
    const userId = getUserId();

    const data = await request(
      `${API_BASE}/api/notifications/user/${encodeURIComponent(userId)}`
    );

    const list = Array.isArray(data)
      ? data
      : data?.data ||
        data?.notifications ||
        data?.content ||
        [];

    return list.map(normalizeNotification);
  }

  // =========================
  // GET UNREAD
  // GET /api/notifications/user/{userId}/unread
  // =========================

  async function getUnreadNotifications() {
    const userId = getUserId();

    const data = await request(
      `${API_BASE}/api/notifications/user/${encodeURIComponent(userId)}/unread`
    );

    const list = Array.isArray(data)
      ? data
      : data?.data ||
        data?.notifications ||
        data?.content ||
        [];

    return list.map(normalizeNotification);
  }

  // =========================
  // UNREAD COUNT
  // GET /api/notifications/user/{userId}/unread-count
  // =========================

  async function getUnreadCount() {
    const userId = getUserId();

    const data = await request(
      `${API_BASE}/api/notifications/user/${encodeURIComponent(userId)}/unread-count`
    );

    if (typeof data === "number") {
      return data;
    }

    return Number(data?.count || 0);
  }

  // =========================
  // MARK AS READ
  // PUT /api/notifications/{id}/read
  // =========================

  async function markAsRead(notificationId) {
    if (
      notificationId === undefined ||
      notificationId === null ||
      String(notificationId).trim() === ""
    ) {
      throw new Error("ID thông báo không hợp lệ.");
    }

    const data = await request(
      `${API_BASE}/api/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: "PUT"
      }
    );

    return data
      ? normalizeNotification(data)
      : null;
  }

  // =========================
  // DELETE
  // Backend hiện chưa có DELETE.
  // =========================

  async function deleteNotification() {
    throw new Error(
      "Backend hiện chưa hỗ trợ xóa thông báo."
    );
  }

  // Không còn dùng mock.
  function isMock() {
    return false;
  }

  function resetMockData() {
    // Không làm gì vì đã dùng API thật.
  }

  // =========================
  // PUBLIC
  // =========================

  global.NotificationService = {
    getNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markAsRead,
    deleteNotification,
    isMock,
    resetMockData
  };

})(window);