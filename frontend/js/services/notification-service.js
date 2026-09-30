/* =========================================================
   AGRISMART - NOTIFICATION SERVICE

   Tầng duy nhất làm việc với dữ liệu thông báo.
   UI (home.js, notification.js) chỉ gọi các hàm public ở cuối file:

     getNotifications()
     getUnreadCount()
     markAsRead(id)
     deleteNotification(id)

   Hiện BE1 chưa bàn giao Notification API nên USE_MOCK_DATA = true.

   KHI BE1 BÀN GIAO API:
     1. Đặt USE_MOCK_DATA = false.
     2. Điền method + path vào API_ROUTES theo contract chính thức.
     3. Chỉnh normalizeNotification() / extractList() cho khớp JSON thật.
   UI không phải sửa.
   ========================================================= */

(function (global) {

    "use strict";

    /* -----------------------------------------------------
       CONFIG
       ----------------------------------------------------- */

    const USE_MOCK_DATA = true;

    /*
     * Chưa có contract từ BE1 nên để null, không đoán URL.
     * Ví dụ khi đã có:
     *   list: { method: "GET", path: "/notifications" }
     *   markAsRead: { method: "PUT", path: (id) => `/notifications/${id}/read` }
     *   remove: { method: "DELETE", path: (id) => `/notifications/${id}` }
     */
    const API_ROUTES = {
        list: null,
        markAsRead: null,
        remove: null
    };

    const MOCK_STORAGE_KEY = "agrismart_mock_notifications";
    const MOCK_DELAY_MS = 500;


    /* -----------------------------------------------------
       ADAPTER (API JSON -> object dùng trong UI)
       Sửa ở đây khi biết response thật của BE1.
       ----------------------------------------------------- */

    function extractList(payload) {

        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === "object") {
            return payload.data ||
                payload.content ||
                payload.notifications ||
                [];
        }

        return [];
    }

    function normalizeNotification(raw) {

        const source = raw || {};

        const readValue =
            source.read !== undefined ? source.read :
            source.isRead !== undefined ? source.isRead :
            source.is_read;

        return {
            id: source.id !== undefined ? source.id : source.notificationId,
            title: source.title || "Thông báo",
            message: source.message || source.content || "",
            type: String(source.type || "SYSTEM").toUpperCase(),
            read: Boolean(readValue),
            createdAt: source.createdAt || source.created_at || null
        };
    }


    /* -----------------------------------------------------
       MOCK DATA (chỉ dùng khi USE_MOCK_DATA = true)
       ----------------------------------------------------- */

    function minutesAgo(minutes) {
        return new Date(Date.now() - minutes * 60000).toISOString();
    }

    function createMockSeed() {

        return [
            {
                id: 1,
                title: "Cảnh báo thời tiết",
                message: "Dự kiến có mưa lớn trong khu vực trong 2 ngày tới. Nên hoãn bón phân và kiểm tra hệ thống thoát nước.",
                type: "WEATHER",
                read: false,
                createdAt: minutesAgo(30)
            },
            {
                id: 2,
                title: "Nguy cơ nấm bệnh trên cà chua",
                message: "Độ ẩm cao kèm mưa liên tục có thể gây sương mai. Nên phun phòng trong 2 ngày tới.",
                type: "DISEASE",
                read: false,
                createdAt: minutesAgo(180)
            },
            {
                id: 3,
                title: "Sắp đến giai đoạn thu hoạch",
                message: "Vụ Đông Xuân 2026 sắp bước vào giai đoạn thu hoạch. Hãy kiểm tra lịch mùa vụ của bạn.",
                type: "SEASON",
                read: false,
                createdAt: minutesAgo(60 * 26)
            },
            {
                id: 4,
                title: "Nhắc cập nhật nhật ký canh tác",
                message: "Bạn chưa ghi nhật ký canh tác trong 3 ngày gần đây.",
                type: "DIARY",
                read: true,
                createdAt: minutesAgo(60 * 50)
            },
            {
                id: 5,
                title: "Kết quả chẩn đoán từ AI",
                message: "AI đã hoàn tất chẩn đoán ảnh lá cây bạn gửi. Xem chi tiết trong mục AI chẩn đoán.",
                type: "AI",
                read: true,
                createdAt: minutesAgo(60 * 24 * 4)
            },
            {
                id: 6,
                title: "Chào mừng đến với AgriSmart",
                message: "Cảm ơn bạn đã sử dụng AgriSmart. Hãy hoàn thiện hồ sơ để nhận gợi ý phù hợp hơn.",
                type: "SYSTEM",
                read: true,
                createdAt: minutesAgo(60 * 24 * 6)
            }
        ];
    }

    function readMockStore() {

        try {

            const raw = global.localStorage.getItem(MOCK_STORAGE_KEY);

            if (raw !== null) {
                return JSON.parse(raw);
            }

        } catch (error) {
            console.warn("Không đọc được dữ liệu thông báo mẫu:", error);
        }

        return createMockSeed();
    }

    function writeMockStore(list) {

        try {
            global.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(list));
        } catch (error) {
            console.warn("Không lưu được dữ liệu thông báo mẫu:", error);
        }
    }

    function wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    /*
     * Chỉ để kiểm thử UI ở chế độ mock:
     *   notification.html?simulate=error   -> hiện trạng thái lỗi
     *   notification.html?simulate=empty   -> hiện trạng thái rỗng
     */
    function getSimulateMode() {

        try {
            return new URLSearchParams(global.location.search).get("simulate");
        } catch (error) {
            return null;
        }
    }

    async function mockGetNotifications() {

        await wait(MOCK_DELAY_MS);

        const mode = getSimulateMode();

        if (mode === "error") {
            throw new Error("Mô phỏng lỗi tải thông báo.");
        }

        if (mode === "empty") {
            return [];
        }

        return readMockStore();
    }

    async function mockMarkAsRead(id) {

        await wait(200);

        const list = readMockStore().map(function (item) {
            return String(item.id) === String(id)
                ? Object.assign({}, item, { read: true })
                : item;
        });

        writeMockStore(list);
    }

    async function mockDelete(id) {

        await wait(200);

        const list = readMockStore().filter(function (item) {
            return String(item.id) !== String(id);
        });

        writeMockStore(list);
    }


    /* -----------------------------------------------------
       REAL API
       ----------------------------------------------------- */

    function resolveRoute(route, id) {

        if (!route) {
            throw new Error(
                "Notification API chưa được cấu hình (chờ BE1 bàn giao)."
            );
        }

        const path = typeof route.path === "function"
            ? route.path(id)
            : route.path;

        const baseUrl = global.APP_CONFIG && global.APP_CONFIG.API_BASE_URL;

        if (!baseUrl) {
            throw new Error("Thiếu APP_CONFIG.API_BASE_URL.");
        }

        return { method: route.method || "GET", url: baseUrl + path };
    }

    async function request(route, id) {

        const target = resolveRoute(route, id);

        const response = await fetch(target.url, {
            method: target.method,
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Notification API lỗi " + response.status);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }


    /* -----------------------------------------------------
       PUBLIC API
       ----------------------------------------------------- */

    async function getNotifications() {

        const rawList = USE_MOCK_DATA
            ? await mockGetNotifications()
            : extractList(await request(API_ROUTES.list));

        return rawList.map(normalizeNotification);
    }

    async function getUnreadCount() {

        const list = await getNotifications();

        return list.filter(function (item) {
            return !item.read;
        }).length;
    }

    async function markAsRead(notificationId) {

        if (USE_MOCK_DATA) {
            return mockMarkAsRead(notificationId);
        }

        await request(API_ROUTES.markAsRead, notificationId);
    }

    async function deleteNotification(notificationId) {

        if (USE_MOCK_DATA) {
            return mockDelete(notificationId);
        }

        await request(API_ROUTES.remove, notificationId);
    }

    function isMock() {
        return USE_MOCK_DATA;
    }

    /* Chỉ có tác dụng ở chế độ mock: khôi phục dữ liệu mẫu ban đầu. */
    function resetMockData() {

        if (!USE_MOCK_DATA) {
            return;
        }

        try {
            global.localStorage.removeItem(MOCK_STORAGE_KEY);
        } catch (error) {
            console.warn("Không khôi phục được dữ liệu thông báo mẫu:", error);
        }
    }

    global.NotificationService = {
        getNotifications: getNotifications,
        getUnreadCount: getUnreadCount,
        markAsRead: markAsRead,
        deleteNotification: deleteNotification,
        isMock: isMock,
        resetMockData: resetMockData
    };

})(window);
