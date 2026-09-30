/* =========================================================
   AGRISMART - NOTIFICATION PAGE
   Chỉ xử lý giao diện. Dữ liệu lấy qua NotificationService.
   ========================================================= */

(function () {

    "use strict";

    const service = window.NotificationService;

    const elements = {
        loading: document.getElementById("stateLoading"),
        error: document.getElementById("stateError"),
        empty: document.getElementById("stateEmpty"),
        list: document.getElementById("notificationList"),
        retry: document.getElementById("retryButton"),
        resetMock: document.getElementById("resetMockButton"),
        badge: document.getElementById("unreadBadge"),
        summary: document.getElementById("unreadSummary"),
        actionError: document.getElementById("actionError")
    };

    const TYPE_META = {
        WEATHER: { label: "Thời tiết", icon: "bi-cloud-rain" },
        DISEASE: { label: "Sâu bệnh", icon: "bi-bug" },
        SEASON: { label: "Mùa vụ", icon: "bi-flower1" },
        DIARY: { label: "Nhật ký", icon: "bi-journal-text" },
        AI: { label: "AI chẩn đoán", icon: "bi-cpu" },
        SYSTEM: { label: "Hệ thống", icon: "bi-info-circle" }
    };

    const DEFAULT_META = { label: "Thông báo", icon: "bi-bell" };

    let notifications = [];


    /* -----------------------------------------------------
       HELPERS
       ----------------------------------------------------- */

    function createElement(tag, className, text) {

        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        if (text !== undefined) {
            node.textContent = text;
        }

        return node;
    }

    function formatTime(value) {

        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "";
        }

        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

        if (minutes < 1) {
            return "Vừa xong";
        }

        if (minutes < 60) {
            return minutes + " phút trước";
        }

        if (minutes < 60 * 24) {
            return Math.floor(minutes / 60) + " giờ trước";
        }

        if (minutes < 60 * 24 * 7) {
            return Math.floor(minutes / (60 * 24)) + " ngày trước";
        }

        return date.toLocaleDateString("vi-VN");
    }

    function sortByNewest(list) {

        return list.slice().sort(function (a, b) {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }


    /* -----------------------------------------------------
       VIEW STATE
       ----------------------------------------------------- */

    function showOnly(name) {

        elements.loading.hidden = name !== "loading";
        elements.error.hidden = name !== "error";
        elements.empty.hidden = name !== "empty";
        elements.list.hidden = name !== "list";
    }

    function showActionError(message) {

        elements.actionError.textContent = message;
        elements.actionError.hidden = false;
    }

    function clearActionError() {

        elements.actionError.hidden = true;
        elements.actionError.textContent = "";
    }

    function updateSummary() {

        const unread = notifications.filter(function (item) {
            return !item.read;
        }).length;

        if (unread > 0) {
            elements.badge.textContent = unread > 99 ? "99+" : String(unread);
            elements.badge.hidden = false;
            elements.summary.textContent =
                "Bạn có " + unread + " thông báo chưa đọc";
        } else {
            elements.badge.hidden = true;
            elements.summary.textContent = notifications.length > 0
                ? "Bạn đã đọc tất cả thông báo"
                : "Cập nhật mới nhất từ AgriSmart";
        }
    }


    /* -----------------------------------------------------
       RENDER
       ----------------------------------------------------- */

    function buildItem(item) {

        const meta = TYPE_META[item.type] || DEFAULT_META;

        const row = createElement(
            "li",
            "notif-item " + (item.read ? "is-read" : "is-unread")
        );

        const icon = createElement("div", "notif-icon type-" + item.type.toLowerCase());
        icon.appendChild(createElement("i", "bi " + meta.icon));

        const body = createElement("div", "notif-body");

        const titleRow = createElement("div", "notif-title-row");
        titleRow.appendChild(createElement("h2", "notif-title", item.title));

        if (!item.read) {
            titleRow.appendChild(createElement("span", "notif-status", "Chưa đọc"));
        }

        const metaRow = createElement("div", "notif-meta");
        metaRow.appendChild(createElement("span", "notif-type", meta.label));

        const time = formatTime(item.createdAt);

        if (time) {
            metaRow.appendChild(createElement("time", "notif-time", time));
        }

        body.appendChild(titleRow);
        body.appendChild(createElement("p", "notif-message", item.message));
        body.appendChild(metaRow);

        const actions = createElement("div", "notif-actions");

        if (!item.read) {

            const readButton = createElement("button", "notif-btn");
            readButton.type = "button";
            readButton.dataset.action = "read";
            readButton.dataset.id = item.id;
            readButton.appendChild(createElement("i", "bi bi-check2"));
            readButton.appendChild(document.createTextNode(" Đánh dấu đã đọc"));

            actions.appendChild(readButton);
        }

        const deleteButton = createElement("button", "notif-btn danger");
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = item.id;
        deleteButton.setAttribute("aria-label", "Xóa thông báo: " + item.title);
        deleteButton.appendChild(createElement("i", "bi bi-trash"));

        actions.appendChild(deleteButton);

        row.appendChild(icon);
        row.appendChild(body);
        row.appendChild(actions);

        return row;
    }

    function render() {

        updateSummary();

        if (notifications.length === 0) {
            elements.resetMock.hidden = !service.isMock();
            showOnly("empty");
            return;
        }

        elements.list.replaceChildren();

        sortByNewest(notifications).forEach(function (item) {
            elements.list.appendChild(buildItem(item));
        });

        showOnly("list");
    }


    /* -----------------------------------------------------
       ACTIONS
       ----------------------------------------------------- */

    async function loadNotifications() {

        clearActionError();
        showOnly("loading");

        try {

            notifications = await service.getNotifications();
            render();

        } catch (error) {

            console.error("Không thể tải thông báo:", error);
            notifications = [];
            updateSummary();
            showOnly("error");
        }
    }

    async function handleAction(button) {

        const id = button.dataset.id;
        const action = button.dataset.action;
        const row = button.closest(".notif-item");

        clearActionError();

        row.querySelectorAll("button").forEach(function (node) {
            node.disabled = true;
        });

        try {

            if (action === "read") {

                await service.markAsRead(id);

                notifications.forEach(function (item) {
                    if (String(item.id) === String(id)) {
                        item.read = true;
                    }
                });

            } else {

                await service.deleteNotification(id);

                notifications = notifications.filter(function (item) {
                    return String(item.id) !== String(id);
                });
            }

            render();

        } catch (error) {

            console.error("Thao tác thông báo thất bại:", error);

            row.querySelectorAll("button").forEach(function (node) {
                node.disabled = false;
            });

            showActionError("Không thể thực hiện thao tác. Vui lòng thử lại.");
        }
    }


    /* -----------------------------------------------------
       INITIALIZE
       ----------------------------------------------------- */

    function init() {

        if (!service) {
            console.error("Thiếu NotificationService.");
            showOnly("error");
            return;
        }

        elements.list.addEventListener("click", function (event) {

            const button = event.target.closest("button[data-action]");

            if (button && !button.disabled) {
                handleAction(button);
            }
        });

        elements.retry.addEventListener("click", loadNotifications);

        elements.resetMock.addEventListener("click", function () {
            service.resetMockData();
            loadNotifications();
        });

        loadNotifications();
    }

    document.addEventListener("DOMContentLoaded", init);

})();
