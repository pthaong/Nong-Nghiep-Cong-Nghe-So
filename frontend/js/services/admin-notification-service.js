/**
 * AgriSmart Admin - Notification Service
 * Admin quản lý thông báo người dùng.
 */

(function (global) {
    "use strict";

    // =========================
    // API BASE
    // =========================

    const CONFIG_BASE =
        global.APP_CONFIG?.API_BASE_URL ||
        global.API_BASE_URL ||
        "http://localhost:8080";

    // Chuẩn hóa URL:
    // http://localhost:8080
    // http://localhost:8080/
    // http://localhost:8080/api
    // http://localhost:8080/api/
    // đều trở thành http://localhost:8080

    const API_BASE = CONFIG_BASE
        .replace(/\/+$/, "")
        .replace(/\/api$/, "");

    // =========================
    // REQUEST
    // =========================

    async function request(url, options = {}) {

        const response = await fetch(url, {
            ...options,

            headers: {
                Accept: "application/json",

                ...(options.body
                    ? {
                        "Content-Type": "application/json"
                    }
                    : {}),

                ...(options.headers || {})
            }
        });

        if (!response.ok) {

            let message =
                `Admin Notification API lỗi ${response.status}`;

            try {

                const data = await response.json();

                if (data?.message) {
                    message = data.message;
                }

            } catch (_) {
                // Giữ message mặc định.
            }

            const error = new Error(message);
            error.status = response.status;

            throw error;
        }

        if (response.status === 204) {
            return null;
        }

        const text = await response.text();

        return text
            ? JSON.parse(text)
            : null;
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

            type:
                String(
                    source.type || "SYSTEM"
                ).toUpperCase(),

            isRead:
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
    // GET /api/admin/notifications
    // =========================

    async function getAll() {

        const data = await request(
            `${API_BASE}/api/admin/notifications`
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
    // GET BY ID
    // GET /api/admin/notifications/{id}
    // =========================

    async function getById(id) {

        if (
            id === null ||
            id === undefined ||
            String(id).trim() === ""
        ) {
            throw new Error(
                "ID thông báo không hợp lệ."
            );
        }

        const data = await request(
            `${API_BASE}/api/admin/notifications/${encodeURIComponent(id)}`
        );

        return normalizeNotification(data);
    }


    // =========================
    // CREATE
    // POST /api/admin/notifications
    // =========================

    async function create(data) {

        if (!data) {
            throw new Error(
                "Dữ liệu thông báo không hợp lệ."
            );
        }

        const payload = {
            userId: Number(data.userId),
            title: String(data.title || "").trim(),
            message: String(data.message || "").trim(),
            type: String(data.type || "SYSTEM").toUpperCase()
        };

        if (!payload.userId) {
            throw new Error(
                "User ID không hợp lệ."
            );
        }

        if (!payload.title) {
            throw new Error(
                "Tiêu đề không được để trống."
            );
        }

        if (!payload.message) {
            throw new Error(
                "Nội dung không được để trống."
            );
        }

        const result = await request(
            `${API_BASE}/api/admin/notifications`,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );

        return normalizeNotification(result);
    }


    // =========================
    // DELETE
    // DELETE /api/admin/notifications/{id}
    // =========================

    async function remove(id) {

        if (
            id === null ||
            id === undefined ||
            String(id).trim() === ""
        ) {
            throw new Error(
                "ID thông báo không hợp lệ."
            );
        }

        await request(
            `${API_BASE}/api/admin/notifications/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        return true;
    }


    // =========================
    // PUBLIC
    // =========================

    global.AdminNotificationService = {

        getAll,

        getById,

        create,

        remove

    };

})(window);