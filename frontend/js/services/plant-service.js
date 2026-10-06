(function (global) {
    "use strict";

    const CONFIG_BASE =
        global.APP_CONFIG?.API_BASE_URL ||
        global.API_BASE_URL ||
        "http://localhost:8080";

    const API_BASE = CONFIG_BASE
        .replace(/\/+$/, "")
        .replace(/\/api$/, "");

    function getFarmerId() {
        const raw =
            localStorage.getItem("agrismart_session") ||
            sessionStorage.getItem("agrismart_session");

        if (!raw) {
            throw new Error("Không tìm thấy phiên đăng nhập.");
        }

        const session = JSON.parse(raw);
        const farmerId = Number(session.userId);

        if (!Number.isInteger(farmerId) || farmerId <= 0) {
            throw new Error("Không xác định được tài khoản nông dân.");
        }

        return farmerId;
    }

    async function request(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            let message = "Không thể thực hiện yêu cầu.";

            try {
                const error = await response.json();
                message =
                    error.message ||
                    error.error ||
                    message;
            } catch (_) {}

            throw new Error(message);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    const PlantService = {
        getFarmerId,

        getAll() {
            const farmerId = getFarmerId();

            return request(
                `${API_BASE}/api/plants?farmerId=${encodeURIComponent(farmerId)}`
            );
        },

        getById(plantId) {
            const farmerId = getFarmerId();

            return request(
                `${API_BASE}/api/plants/${plantId}?farmerId=${encodeURIComponent(farmerId)}`
            );
        },

        create(data) {
            const farmerId = getFarmerId();

            return request(
                `${API_BASE}/api/plants?farmerId=${encodeURIComponent(farmerId)}`,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );
        },

        update(plantId, data) {
            const farmerId = getFarmerId();

            return request(
                `${API_BASE}/api/plants/${plantId}?farmerId=${encodeURIComponent(farmerId)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );
        },

        remove(plantId) {
            const farmerId = getFarmerId();

            return request(
                `${API_BASE}/api/plants/${plantId}?farmerId=${encodeURIComponent(farmerId)}`,
                {
                    method: "DELETE"
                }
            );
        }
    };

    global.PlantService = PlantService;

})(window);