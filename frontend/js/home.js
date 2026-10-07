/**
 * =========================================================
 * AgriSmart - Farmer Home
 * =========================================================
 *
 * Trang chủ hiện tại:
 *
 * - Sử dụng mock data cho Weather
 * - Sử dụng mock data cho cây trồng
 * - Sử dụng mock data cho cảnh báo
 * - Sử dụng mock data cho giá nông sản
 * - Sử dụng mock data cho khuyến nghị AI
 *
 * Chưa kết nối Weather API theo yêu cầu của nhóm.
 *
 * Dữ liệu người dùng sẽ được lấy từ session hiện tại.
 * Profile/API thật sẽ được xử lý ở module Hồ sơ.
 * =========================================================
 */


(function () {

    "use strict";


    /* =====================================================
       MOCK DATA
       ===================================================== */

    const HOME_MOCK_DATA = {
        statistics: {

            managedFields: 3,

            totalArea: 2.3,

            monthlyDiary: 4,

            aiQuestions: 4
        },


        crops: [

            {
                name: "Ruộng số 1 - Ấp Bình An",
                type: "Lúa OM5451",
                area: "1.2 ha",
                stage: "Đẻ nhánh",
                plantingDate: "2026-01-10",
                season: "Vụ Đông Xuân 2026",
                progress: 72
            },

            {
                name: "Vườn cà chua sau nhà",
                type: "Cà chua",
                area: "0.3 ha",
                stage: "Ra hoa",
                plantingDate: "2026-08-15",
                season: "Vụ Hè Thu 2026",
                progress: 90
            },

            {
                name: "Ruộng số 2 - Kênh 3",
                type: "Lúa OM18",
                area: "0.8 ha",
                stage: "Mạ non / cây con",
                plantingDate: "2026-07-01",
                season: "",
                progress: 28
            }

        ],


        prices: [

            {
                name: "Lúa OM5451",
                price: "7.800đ",
                unit: "đ/kg",
                change: "↑ 2.3%",
                direction: "up"
            },

            {
                name: "Cà chua",
                price: "12.500đ",
                unit: "đ/kg",
                change: "↓ 4.1%",
                direction: "down"
            },

            {
                name: "Xoài cát Hòa Lộc",
                price: "32.000đ",
                unit: "đ/kg",
                change: "↑ 1%",
                direction: "up"
            },

            {
                name: "Rau muống",
                price: "9.000đ",
                unit: "đ/kg",
                change: "− 0%",
                direction: "neutral"
            },

            {
                name: "Thanh long",
                price: "18.500đ",
                unit: "đ/kg",
                change: "↓ 2.7%",
                direction: "down"
            }

        ]

    };


    /* =====================================================
       SESSION
       ===================================================== */

    function getSession() {

        try {

           const rawSession =
    localStorage.getItem("agrismart_session") ||
    sessionStorage.getItem("agrismart_session");

            if (!rawSession) {

                return null;

            }

            return JSON.parse(rawSession);

        } catch (error) {

            console.warn(
                "Không thể đọc session AgriSmart:",
                error
            );

            return null;

        }

    }


    /* =====================================================
       USER GREETING
       ===================================================== */

    function getUserName() {

        const session =
            getSession();

        if (!session) {

            return "Nông dân";

        }


        return (

            session.name ||

            session.fullName ||

            session.userName ||

            session.username ||

            session.user?.name ||

            session.user?.fullName ||

            "Nông dân"

        );

    }


    /* =====================================================
       WEATHER
       ===================================================== */

  async function renderWeather() {

    const location =
        document.getElementById("weatherLocation");

    const temperature =
        document.getElementById("weatherTemperature");

    const description =
        document.getElementById("weatherDescription");

    const humidity =
        document.getElementById("humidityValue");

    const rain =
        document.getElementById("rainValue");

    const wind =
        document.getElementById("windValue");


    function displayWeather(weather) {

        if (
            !weather ||
            !weather.current ||
            typeof weather.current.temp !== "number"
        ) {
            throw new Error(
                "Dữ liệu thời tiết không hợp lệ."
            );
        }

        if (location) {
            location.textContent =
                weather.region || "Cần Thơ";
        }

        if (temperature) {
            temperature.textContent =
                Math.round(weather.current.temp) + "°C";
        }

        if (description) {
            description.textContent =
                weather.current.condition ||
                "Chưa có dữ liệu trạng thái";
        }

        if (humidity) {
            humidity.textContent =
                weather.current.humidity !== null &&
                weather.current.humidity !== undefined
                    ? Math.round(weather.current.humidity) + "%"
                    : "--";
        }

        if (rain) {
            rain.textContent =
                weather.current.rain !== null &&
                weather.current.rain !== undefined
                    ? Math.round(weather.current.rain) + "%"
                    : "--";
        }

        if (wind) {
            wind.textContent =
                weather.current.wind !== null &&
                weather.current.wind !== undefined
                    ? Math.round(weather.current.wind) + " km/h"
                    : "--";
        }
    const warningTitle =
    document.getElementById("weatherWarningTitle");

const warningText =
    document.getElementById("weatherWarningText");

if (warningTitle && warningText) {

    const rainChance =
        weather.current.rain;

    if (
        typeof rainChance === "number" &&
        Number.isFinite(rainChance)
    ) {

        if (rainChance >= 60) {

            warningTitle.textContent =
                "Khả năng mưa cao";

            warningText.textContent =
                "Khả năng mưa hiện tại khoảng " +
                Math.round(rainChance) +
                "%. Nên theo dõi thời tiết trước khi tưới, " +
                "bón phân hoặc phun thuốc.";

        } else if (rainChance >= 30) {

            warningTitle.textContent =
                "Có khả năng mưa";

            warningText.textContent =
                "Khả năng mưa hiện tại khoảng " +
                Math.round(rainChance) +
                "%. Nên theo dõi thời tiết trước các hoạt động ngoài đồng.";

        } else {

            warningTitle.textContent =
                "Khả năng mưa thấp";

            warningText.textContent =
                "Khả năng mưa hiện tại khoảng " +
                Math.round(rainChance) +
                "%. Điều kiện thời tiết hiện chưa có cảnh báo mưa đáng chú ý.";

        }

    } else {

        warningTitle.textContent =
            "Theo dõi thời tiết";

        warningText.textContent =
            "Chưa có đủ dữ liệu để đưa ra cảnh báo về mưa.";

    }
}
}

    try {

        /*
         * Ưu tiên dữ liệu Weather FE3 đã tải thành công.
         */
        const cached =
            localStorage.getItem("agrismart_weather");

        if (cached) {

            try {

                const weather =
                    JSON.parse(cached);

                displayWeather(weather);

                console.log(
                    "Home weather loaded from cache:",
                    weather
                );

                return;

            } catch (cacheError) {

                console.warn(
                    "Weather cache không hợp lệ:",
                    cacheError
                );

                localStorage.removeItem(
                    "agrismart_weather"
                );
            }
        }


        /*
         * Chưa từng mở FE3 hoặc chưa có cache:
         * Home tự lấy dữ liệu qua cùng weather-service của FE3.
         *
         * Cần Thơ là DEFAULT_LOCATION của FE3.
         */
        if (!window.AgriWeather) {
            throw new Error(
                "AgriWeather service chưa được tải."
            );
        }


        const weather =
            await window.AgriWeather.loadWeather({
                name: "Cần Thơ"
            });


        displayWeather(weather);


        /*
         * Lưu cùng key với FE3 để Home và Weather
         * dùng chung dữ liệu.
         */
        localStorage.setItem(
            "agrismart_weather",
            JSON.stringify(weather)
        );


        console.log(
            "Home weather loaded from Backend:",
            weather
        );


    } catch (error) {

        console.error(
            "Không tải được thời tiết cho Home:",
            error
        );

        if (location) {
            location.textContent = "--";
        }

        if (temperature) {
            temperature.textContent = "--°C";
        }

        if (description) {
            description.textContent =
                "Không tải được dữ liệu thời tiết";
        }

        if (humidity) {
            humidity.textContent = "--";
        }

        if (rain) {
            rain.textContent = "--";
        }

        if (wind) {
            wind.textContent = "--";
        }
    }
}
    /* =====================================================
       STATISTICS
       ===================================================== */

    function renderStatistics() {

        const data =
            HOME_MOCK_DATA.statistics;

        const values =
            document.querySelectorAll(
                ".stat-value"
            );

        if (values.length < 4) {
            return;
        }

        values[0].textContent =
            data.managedFields;

        values[1].textContent =
            data.totalArea;

        values[2].textContent =
            data.monthlyDiary;

        values[3].textContent =
            data.aiQuestions;
    }
    /* =====================================================
       CROP INTERACTIONS
       ===================================================== */

   /* =====================================================
   PLANTS - REAL API
   ===================================================== */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPlantDate(value) {
    if (!value) {
        return "Chưa có";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Chưa có";
    }

    return date.toLocaleDateString("vi-VN");
}

async function loadPlants() {
    const container = document.querySelector(".crop-grid");

    if (!container) {
        return;
    }

    if (!window.PlantService) {
        console.error("PlantService chưa được tải.");
        return;
    }

    container.innerHTML = `
        <div class="crop-loading">
            Đang tải cây trồng...
        </div>
    `;

    try {
        const plants = await window.PlantService.getAll();

        if (!Array.isArray(plants) || plants.length === 0) {
            container.innerHTML = `
                <div class="crop-empty">
                    <i class="bi bi-flower2"></i>
                    <p>Bạn chưa có cây trồng nào.</p>
                </div>
            `;

            updatePlantCount(0);
            return;
        }

        updatePlantCount(plants.length);

        container.innerHTML = plants
            .slice(0, 4)
            .map(function (plant) {
                return `
                    <div class="crop-card" data-plant-id="${plant.id}">

                        <div class="crop-top">

                            <div>
                                <h3>${escapeHtml(plant.name)}</h3>

                                <p>
                                    ${escapeHtml(plant.plantType)}
                                    ${
                                        plant.variety
                                            ? " · " + escapeHtml(plant.variety)
                                            : ""
                                    }
                                </p>
                            </div>

                            <span class="crop-badge">
                                ${escapeHtml(
                                    plant.growthStage ||
                                    "Chưa cập nhật"
                                )}
                            </span>

                        </div>

                        <div class="crop-info">

                            <span>
                                <i class="bi bi-calendar3"></i>
                                Ngày tạo:
                                ${formatPlantDate(plant.createdAt)}
                            </span>

                        </div>

                        ${
                            plant.description
                                ? `
                                    <div class="crop-description">
                                        ${escapeHtml(plant.description)}
                                    </div>
                                  `
                                : ""
                        }

                        <div class="crop-actions">

                            <button
                                type="button"
                                class="crop-action edit"
                                data-action="edit"
                                data-id="${plant.id}"
                                title="Chỉnh sửa"
                            >
                                <i class="bi bi-pencil"></i>
                            </button>

                            <button
                                type="button"
                                class="crop-action delete"
                                data-action="delete"
                                data-id="${plant.id}"
                                title="Xóa"
                            >
                                <i class="bi bi-trash"></i>
                            </button>

                        </div>

                    </div>
                `;
            })
            .join("");

        setupPlantActions();

        console.log(
            "Home plants loaded from Backend:",
            plants
        );

    } catch (error) {
        console.error(
            "Không tải được danh sách cây trồng:",
            error
        );

        container.innerHTML = `
            <div class="crop-empty">
                <i class="bi bi-exclamation-circle"></i>
                <p>Không tải được dữ liệu cây trồng.</p>
            </div>
        `;
    }
}

function updatePlantCount(count) {
    const values = document.querySelectorAll(".stat-value");

    if (values.length > 0) {
        values[0].textContent = String(count);
    }
}

function setupPlantActions() {
    document
        .querySelectorAll('[data-action="edit"]')
        .forEach(function (button) {
            button.addEventListener("click", function () {
                window.location.href =
                    "plants.html?edit=" +
                    encodeURIComponent(button.dataset.id);
            });
        });

    document
        .querySelectorAll('[data-action="delete"]')
        .forEach(function (button) {
            button.addEventListener(
                "click",
                async function () {
                    const plantId = button.dataset.id;

                    const confirmed = window.confirm(
                        "Bạn có chắc muốn xóa cây trồng này?"
                    );

                    if (!confirmed) {
                        return;
                    }

                    try {
                        button.disabled = true;

                        await window.PlantService.remove(
                            plantId
                        );

                        await loadPlants();

                    } catch (error) {
                        console.error(
                            "Không xóa được cây trồng:",
                            error
                        );

                        alert(
                            error.message ||
                            "Không thể xóa cây trồng."
                        );

                        button.disabled = false;
                    }
                }
            );
        });
}


    /* =====================================================
       FORECAST BUTTON
       ===================================================== */

    function setupForecastButton() {

    const button =
        document.querySelector(
            ".forecast-button"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            window.location.href =
                "weather.html";

        }
    );

}


    /* =====================================================
       VIEW ALL BUTTONS
       ===================================================== */

    function setupViewButtons() {
    const buttons =
        document.querySelectorAll(".view-all-button");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const href = button.dataset.href;

            if (href) {
                window.location.href = href;
            }
        });
    });
}


    /* =====================================================
       THEME BUTTON
       ===================================================== */

    function setupThemeButton() {

        const button =
            document.querySelector(
                ".theme-button"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                alert(
                    "Giao diện hiện đang sử dụng chế độ tối của AgriSmart."
                );

            }
        );

    }


    /* =====================================================
       AI LINK
       ===================================================== */

    function setupAIButton() {

        const button =
            document.querySelector(
                ".ai-question-button"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                /*
                 * Để href="aichandoan-index.html" xử lý
                 * điều hướng tự nhiên.
                 */

                console.log(
                    "Mở module AI."
                );

            }
        );

    }


    /* =====================================================
       SIDE MENU
       ===================================================== */

    function setupSideMenu() {

        const menu = document.getElementById("sideMenu");
        const overlay = document.getElementById("sideMenuOverlay");
        const openButton = document.getElementById("menuButton");
        const closeButton = document.getElementById("sideMenuClose");

        if (!menu || !overlay || !openButton || !closeButton) {

            return;

        }

        function openMenu() {

            menu.classList.add("is-open");
            menu.setAttribute("aria-hidden", "false");
            overlay.hidden = false;
            openButton.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";

            const firstLink = menu.querySelector("a");

            if (firstLink) {

                firstLink.focus();

            }

        }

        function closeMenu() {

            menu.classList.remove("is-open");
            menu.setAttribute("aria-hidden", "true");
            overlay.hidden = true;
            openButton.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";

        }

        openButton.addEventListener("click", openMenu);

        closeButton.addEventListener("click", function () {

            closeMenu();
            openButton.focus();

        });

        overlay.addEventListener("click", closeMenu);

        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape" &&
                menu.classList.contains("is-open")) {

                closeMenu();
                openButton.focus();

            }

        });

        // Quay lại bằng nút Back (bfcache): đảm bảo menu đang đóng
        window.addEventListener("pageshow", closeMenu);

    }


    /* =====================================================
       NOTIFICATION BADGE
       ===================================================== */

    function renderNotificationBadge(count) {

        document
            .querySelectorAll("[data-notification-badge]")
            .forEach(function (badge) {

                if (count > 0) {

                    badge.textContent =
                        count > 99 ? "99+" : String(count);

                    badge.hidden = false;

                } else {

                    badge.hidden = true;

                }

            });

        const bell =
            document.querySelector(".notification-button");

        if (bell) {

            bell.setAttribute(
                "aria-label",
                count > 0
                    ? "Thông báo (" + count + " chưa đọc)"
                    : "Thông báo"
            );

        }

    }


    async function loadNotificationBadge() {

        // Thiếu service thì bỏ qua, không ảnh hưởng phần còn lại của Home
        if (!window.NotificationService) {

            return;

        }

        try {

            renderNotificationBadge(
                await window.NotificationService.getUnreadCount()
            );

        } catch (error) {

            console.error(
                "Không thể tải số thông báo chưa đọc:",
                error
            );

            renderNotificationBadge(0);

        }

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initHome() {

        console.log(
            "AgriSmart Home initialized."
        );


        renderWeather();

        renderStatistics();

        loadPlants();

        setupForecastButton();

        setupViewButtons();

        setupThemeButton();

        setupAIButton();

        setupSideMenu();

        loadNotificationBadge();

        // Quay lại bằng nút Back (bfcache) thì cập nhật lại badge
        window.addEventListener("pageshow", function (event) {

            if (event.persisted) {
                loadNotificationBadge();
            }

        });


        /*
         * Lưu ý:
         *
         * Trang Home hiện chưa có thẻ greeting
         * dạng "Xin chào, ...".
         *
         * Tên người dùng sẽ được sử dụng ở
         * header/profile trong bước tích hợp
         * Login -> Home -> Profile.
         */

        const userName =
            getUserName();
        
        const greeting = document.getElementById("userGreeting");

        if (greeting) {
            greeting.textContent = `Xin chào, ${userName}!`;
        }

        console.log(
            "Người dùng hiện tại:",
            userName
        );

    }


    /* =====================================================
       DOM READY
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initHome
        );

    } else {

        initHome();

    }

})();