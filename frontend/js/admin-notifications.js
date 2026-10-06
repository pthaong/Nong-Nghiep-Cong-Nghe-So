/**
 * AgriSmart Admin - Notification Management
 * Kết nối giao diện Admin với Notification API.
 */

(function () {
    "use strict";

    const service = window.AdminNotificationService;

    let notifications = [];

    const elements = {
        loading: document.getElementById("stateLoading"),
        error: document.getElementById("stateError"),
        errorDesc: document.getElementById("errorDesc"),
        empty: document.getElementById("stateEmpty"),
        tableCard: document.getElementById("tableCard"),
        tableBody: document.getElementById("notificationTableBody"),

        btnCreate: document.getElementById("btnCreate"),
        btnCreateEmpty: document.getElementById("btnCreateEmpty"),
        btnRefresh: document.getElementById("btnRefresh"),
        btnRetry: document.getElementById("btnRetry"),
        btnLogout: document.getElementById("btnLogout"),

        createModal: document.getElementById("createNotificationModal"),
        createForm: document.getElementById("createNotificationForm"),
        createError: document.getElementById("createError"),
        btnSubmitCreate: document.getElementById("btnSubmitCreate"),

        detailModal: document.getElementById("notificationDetailModal"),
        detailId: document.getElementById("detailId"),
        detailUserId: document.getElementById("detailUserId"),
        detailTitle: document.getElementById("detailTitle"),
        detailType: document.getElementById("detailType"),
        detailMessage: document.getElementById("detailMessage"),
        detailRead: document.getElementById("detailRead"),
        detailCreatedAt: document.getElementById("detailCreatedAt"),

        adminName: document.getElementById("adminName")
    };

    const TYPE_LABEL = {
        SYSTEM: "Hệ thống",
        WEATHER: "Thời tiết",
        DISEASE: "Sâu bệnh",
        SEASON: "Mùa vụ",
        DIARY: "Nhật ký",
        AI: "AI chẩn đoán"
    };


    // =====================================================
    // STATE
    // =====================================================

    function showState(state) {

        if (elements.loading) {
            elements.loading.hidden = state !== "loading";
        }

        if (elements.error) {
            elements.error.hidden = state !== "error";
        }

        if (elements.empty) {
            elements.empty.hidden = state !== "empty";
        }

        if (elements.tableCard) {
            elements.tableCard.hidden = state !== "table";
        }
    }


    function showError(message) {

        if (elements.errorDesc) {
            elements.errorDesc.textContent =
                message || "Không thể tải danh sách thông báo.";
        }

        showState("error");
    }


    // =====================================================
    // FORMAT
    // =====================================================

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString("vi-VN");
    }


    function getTypeLabel(type) {

        const key = String(type || "SYSTEM").toUpperCase();

        return TYPE_LABEL[key] || key;
    }


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // =====================================================
    // RENDER TABLE
    // =====================================================

    function renderTable(list) {

        if (!elements.tableBody) {
            return;
        }

        elements.tableBody.replaceChildren();

        if (!Array.isArray(list) || list.length === 0) {
            showState("empty");
            return;
        }

        list.forEach(function (item) {

            const row = document.createElement("tr");

            const status = item.isRead
                ? '<span class="badge bg-success">Đã đọc</span>'
                : '<span class="badge bg-warning text-dark">Chưa đọc</span>';

            row.innerHTML = `
                <td>${escapeHtml(item.id)}</td>

                <td>${escapeHtml(item.userId)}</td>

                <td>
                    <strong>${escapeHtml(item.title)}</strong>
                </td>

                <td>
                    ${escapeHtml(item.message)}
                </td>

                <td>
                    ${escapeHtml(getTypeLabel(item.type))}
                </td>

                <td>
                    ${status}
                </td>

                <td>
                    ${escapeHtml(formatDate(item.createdAt))}
                </td>

                <td>
                    <div class="d-flex gap-1">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            data-action="detail"
                            data-id="${escapeHtml(item.id)}"
                            title="Xem chi tiết">

                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-action="delete"
                            data-id="${escapeHtml(item.id)}"
                            title="Xóa">

                            <i class="bi bi-trash"></i>
                        </button>

                    </div>
                </td>
            `;

            elements.tableBody.appendChild(row);
        });

        showState("table");
    }


    // =====================================================
    // LOAD
    // =====================================================

    async function loadNotifications() {

        showState("loading");

        try {

            if (!service) {
                throw new Error(
                    "Không tìm thấy AdminNotificationService."
                );
            }

            notifications = await service.getAll();

            console.log(
                "Admin notifications:",
                notifications
            );

            if (
                !Array.isArray(notifications) ||
                notifications.length === 0
            ) {
                showState("empty");
                return;
            }

            renderTable(notifications);

        } catch (error) {

            console.error(
                "Không thể tải danh sách thông báo:",
                error
            );

            showError(
                error.message ||
                "Không thể tải danh sách thông báo."
            );
        }
    }


    // =====================================================
    // DETAIL
    // =====================================================

    async function showDetail(id) {

        try {

            const item = await service.getById(id);

            elements.detailId.textContent =
                item.id ?? "-";

            elements.detailUserId.textContent =
                item.userId ?? "-";

            elements.detailTitle.textContent =
                item.title || "-";

            elements.detailType.textContent =
                getTypeLabel(item.type);

            elements.detailMessage.textContent =
                item.message || "-";

            elements.detailRead.textContent =
                item.isRead ? "Đã đọc" : "Chưa đọc";

            elements.detailCreatedAt.textContent =
                formatDate(item.createdAt);

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    elements.detailModal
                );

            modal.show();

        } catch (error) {

            alert(
                error.message ||
                "Không thể tải chi tiết thông báo."
            );
        }
    }


    // =====================================================
    // DELETE
    // =====================================================

    async function deleteNotification(id) {

        const confirmed = confirm(
            "Bạn có chắc muốn xóa thông báo #" + id + "?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await service.remove(id);

            await loadNotifications();

        } catch (error) {

            console.error(
                "Không thể xóa thông báo:",
                error
            );

            alert(
                error.message ||
                "Không thể xóa thông báo."
            );
        }
    }


    // =====================================================
    // CREATE
    // =====================================================

    function openCreateModal() {

        if (elements.createForm) {
            elements.createForm.reset();
        }

        if (elements.createError) {
            elements.createError.classList.add("d-none");
            elements.createError.textContent = "";
        }

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                elements.createModal
            );

        modal.show();
    }


    async function createNotification(event) {

        event.preventDefault();

        if (elements.createError) {
            elements.createError.classList.add("d-none");
            elements.createError.textContent = "";
        }

        const userId =
            document.getElementById(
                "notificationUserId"
            ).value;

        const title =
            document.getElementById(
                "notificationTitle"
            ).value;

        const type =
            document.getElementById(
                "notificationType"
            ).value;

        const message =
            document.getElementById(
                "notificationMessage"
            ).value;


        try {

            elements.btnSubmitCreate.disabled = true;

            await service.create({
                userId,
                title,
                type,
                message
            });

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    elements.createModal
                );

            modal.hide();

            await loadNotifications();

        } catch (error) {

            console.error(
                "Không thể tạo thông báo:",
                error
            );

            if (elements.createError) {
                elements.createError.textContent =
                    error.message ||
                    "Không thể tạo thông báo.";

                elements.createError.classList.remove(
                    "d-none"
                );
            }

        } finally {

            elements.btnSubmitCreate.disabled = false;
        }
    }


    // =====================================================
    // EVENTS
    // =====================================================

    function bindEvents() {

        if (elements.btnCreate) {
            elements.btnCreate.addEventListener(
                "click",
                openCreateModal
            );
        }

        if (elements.btnCreateEmpty) {
            elements.btnCreateEmpty.addEventListener(
                "click",
                openCreateModal
            );
        }

        if (elements.btnRefresh) {
            elements.btnRefresh.addEventListener(
                "click",
                loadNotifications
            );
        }

        if (elements.btnRetry) {
            elements.btnRetry.addEventListener(
                "click",
                loadNotifications
            );
        }

        if (elements.createForm) {
            elements.createForm.addEventListener(
                "submit",
                createNotification
            );
        }

        if (elements.tableBody) {

            elements.tableBody.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "button[data-action]"
                        );

                    if (!button) {
                        return;
                    }

                    const id =
                        button.dataset.id;

                    const action =
                        button.dataset.action;

                    if (action === "detail") {
                        showDetail(id);
                    }

                    if (action === "delete") {
                        deleteNotification(id);
                    }
                }
            );
        }

        if (elements.btnLogout) {

            elements.btnLogout.addEventListener(
                "click",
                function () {

                    localStorage.removeItem(
                        "agrismart_session"
                    );

                    sessionStorage.removeItem(
                        "agrismart_session"
                    );

                    window.location.href =
                        "admin-login.html";
                }
            );
        }
    }


    // =====================================================
    // INIT
    // =====================================================

    function init() {

        console.log(
            "Admin Notification page initialized."
        );

        bindEvents();

        loadNotifications();
    }


    document.addEventListener(
        "DOMContentLoaded",
        init
    );

})();