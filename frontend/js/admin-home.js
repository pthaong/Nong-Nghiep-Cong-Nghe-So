(function () {

    "use strict";


    // =====================================================
    // API CONFIG
    // =====================================================

    const CONFIG_BASE =
        window.APP_CONFIG?.API_BASE_URL ||
        window.API_BASE_URL ||
        "http://localhost:8080";

    const API_BASE = CONFIG_BASE
        .replace(/\/+$/, "")
        .replace(/\/api$/, "");


    // =====================================================
    // ELEMENTS
    // =====================================================

    const elements = {

        loading:
            document.getElementById("dashboardLoading"),

        content:
            document.getElementById("dashboardContent"),

        error:
            document.getElementById("dashboardError"),


        // MAIN CARDS
        users:
            document.getElementById("totalUsers"),

        seasons:
            document.getElementById("totalSeasons"),

        diagnoses:
            document.getElementById("totalDiagnoses"),

        diaries:
            document.getElementById("totalDiaries"),


        // SYSTEM OVERVIEW
        overviewUsers:
            document.getElementById("overviewUsers"),

        overviewSeasons:
            document.getElementById("overviewSeasons"),

        overviewDiagnoses:
            document.getElementById("overviewDiagnoses"),

        overviewDiaries:
            document.getElementById("overviewDiaries"),


        // PROGRESS BARS
        barUsers:
            document.getElementById("barUsers"),

        barSeasons:
            document.getElementById("barSeasons"),

        barDiagnoses:
            document.getElementById("barDiagnoses"),

        barDiaries:
            document.getElementById("barDiaries"),


        // DATE
        date:
            document.getElementById("dashboardDate"),


        // NOTIFICATIONS
        notifications:
            document.getElementById("latestNotifications"),


        // LOGOUT
        logout:
            document.getElementById("btnLogout")

    };


    // =====================================================
    // REQUEST
    // =====================================================

    async function request(url) {

        const response = await fetch(url, {

            headers: {
                Accept: "application/json"
            }

        });


        if (!response.ok) {

            throw new Error(
                "API lỗi " + response.status
            );

        }


        return response.json();

    }


    // =====================================================
    // DATE
    // =====================================================

    function renderCurrentDate() {

        if (!elements.date) {
            return;
        }


        const now = new Date();


        elements.date.textContent =
            now.toLocaleDateString(
                "vi-VN",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

    }


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    async function loadDashboard() {

        try {

            const results =
                await Promise.all([

                    request(
                        `${API_BASE}/api/admin/users/farmers`
                    ),

                    request(
                        `${API_BASE}/api/admin/seasons`
                    ),

                    request(
                        `${API_BASE}/api/admin/diagnoses`
                    ),

                    request(
                        `${API_BASE}/api/admin/diaries`
                    ),

                    request(
                        `${API_BASE}/api/admin/notifications`
                    )

                ]);


            const users =
                Array.isArray(results[0])
                    ? results[0]
                    : [];

            const seasons =
                Array.isArray(results[1])
                    ? results[1]
                    : [];

            const diagnoses =
                Array.isArray(results[2])
                    ? results[2]
                    : [];

            const diaries =
                Array.isArray(results[3])
                    ? results[3]
                    : [];

            const notifications =
                Array.isArray(results[4])
                    ? results[4]
                    : [];


            // =================================================
            // COUNTS
            // =================================================

            const counts = {

                users: users.length,

                seasons: seasons.length,

                diagnoses: diagnoses.length,

                diaries: diaries.length

            };


            // =================================================
            // MAIN CARDS
            // =================================================

            setText(
                elements.users,
                counts.users
            );

            setText(
                elements.seasons,
                counts.seasons
            );

            setText(
                elements.diagnoses,
                counts.diagnoses
            );

            setText(
                elements.diaries,
                counts.diaries
            );


            // =================================================
            // SYSTEM OVERVIEW NUMBERS
            // =================================================

            setText(
                elements.overviewUsers,
                counts.users
            );

            setText(
                elements.overviewSeasons,
                counts.seasons
            );

            setText(
                elements.overviewDiagnoses,
                counts.diagnoses
            );

            setText(
                elements.overviewDiaries,
                counts.diaries
            );


            // =================================================
            // PROGRESS BARS
            // =================================================

            renderProgressBars(counts);


            // =================================================
            // NOTIFICATIONS
            // =================================================

            renderNotifications(
                notifications
            );


            // =================================================
            // SHOW CONTENT
            // =================================================

            if (elements.loading) {
                elements.loading.hidden = true;
            }

            if (elements.error) {
                elements.error.hidden = true;
            }

            if (elements.content) {
                elements.content.hidden = false;
            }


            console.log(
                "Admin Dashboard loaded:",
                {
                    users: counts.users,
                    seasons: counts.seasons,
                    diagnoses: counts.diagnoses,
                    diaries: counts.diaries,
                    notifications:
                        notifications.length
                }
            );


        } catch (error) {

            console.error(
                "Dashboard API error:",
                error
            );


            if (elements.loading) {
                elements.loading.hidden = true;
            }

            if (elements.content) {
                elements.content.hidden = true;
            }

            if (elements.error) {
                elements.error.hidden = false;
            }

        }

    }


    // =====================================================
    // SET TEXT
    // =====================================================

    function setText(element, value) {

        if (!element) {
            return;
        }

        element.textContent = value;

    }


    // =====================================================
    // PROGRESS BARS
    // =====================================================

    function renderProgressBars(counts) {

        const values = [

            counts.users,

            counts.seasons,

            counts.diagnoses,

            counts.diaries

        ];


        /*
         * Lấy giá trị lớn nhất làm mốc 100%.
         *
         * Ví dụ dữ liệu hiện tại:
         *
         * users       = 4
         * seasons     = 3
         * diagnoses   = 7
         * diaries     = 1
         *
         * diagnoses = 7 sẽ có thanh dài nhất.
         */

        const maxValue =
            Math.max(
                ...values,
                1
            );


        setProgress(
            elements.barUsers,
            counts.users,
            maxValue
        );

        setProgress(
            elements.barSeasons,
            counts.seasons,
            maxValue
        );

        setProgress(
            elements.barDiagnoses,
            counts.diagnoses,
            maxValue
        );

        setProgress(
            elements.barDiaries,
            counts.diaries,
            maxValue
        );

    }


    function setProgress(
        element,
        value,
        maxValue
    ) {

        if (!element) {
            return;
        }


        let percent =
            (value / maxValue) * 100;


        /*
         * Nếu có dữ liệu thì đảm bảo thanh
         * vẫn đủ dài để nhìn thấy.
         */

        if (
            value > 0 &&
            percent < 8
        ) {

            percent = 8;

        }


        percent =
            Math.min(
                percent,
                100
            );


        /*
         * Delay nhẹ để CSS transition chạy,
         * tạo hiệu ứng thanh tăng khi Dashboard load.
         */

        requestAnimationFrame(
            function () {

                element.style.width =
                    percent + "%";

            }
        );

    }


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    function renderNotifications(
        notifications
    ) {

        if (!elements.notifications) {
            return;
        }


        if (
            !Array.isArray(notifications) ||
            notifications.length === 0
        ) {

            elements.notifications.innerHTML = `

                <div class="p-4 text-center text-muted">

                    <i
                        class="bi bi-bell-slash d-block mb-2"
                        style="font-size: 24px;"
                    ></i>

                    Chưa có thông báo.

                </div>

            `;

            return;

        }


        const sorted =
            notifications
                .slice()
                .sort(function (a, b) {

                    return new Date(
                        b.createdAt || 0
                    ) - new Date(
                        a.createdAt || 0
                    );

                })
                .slice(0, 5);


        elements.notifications.innerHTML =
            sorted
                .map(function (item) {

                    const date =
                        formatDateTime(
                            item.createdAt
                        );


                    return `

                        <div class="notification-row">

                            <strong>
                                ${escapeHtml(
                                    item.title ||
                                    "Thông báo"
                                )}
                            </strong>

                            <p>
                                ${escapeHtml(
                                    item.message ||
                                    ""
                                )}
                            </p>

                            <span class="notification-time">

                                <i class="bi bi-person"></i>

                                User:
                                ${escapeHtml(
                                    item.userId ??
                                    "-"
                                )}

                                &nbsp; • &nbsp;

                                <i class="bi bi-clock"></i>

                                ${escapeHtml(date)}

                            </span>

                        </div>

                    `;

                })
                .join("");

    }


    // =====================================================
    // FORMAT DATE TIME
    // =====================================================

    function formatDateTime(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date.toLocaleString(
            "vi-VN",
            {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function logout() {

        localStorage.removeItem(
            "agrismart_session"
        );

        sessionStorage.removeItem(
            "agrismart_session"
        );

        localStorage.removeItem(
            "agrismart_token"
        );

        sessionStorage.removeItem(
            "agrismart_token"
        );


        window.location.href =
            "admin-login.html";

    }


    // =====================================================
    // INIT
    // =====================================================

    function init() {

        // Hiển thị ngày hiện tại
        renderCurrentDate();


        // Logout
        if (elements.logout) {

            elements.logout.addEventListener(
                "click",
                logout
            );

        }


        // Load dữ liệu thật
        loadDashboard();

    }


    document.addEventListener(
        "DOMContentLoaded",
        init
    );

})();