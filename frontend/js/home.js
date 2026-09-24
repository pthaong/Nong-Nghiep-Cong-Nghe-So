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

        weather: {

            location: "Cao Bằng",

            temperature: "31°C",

            description: "Trời quang nhẹ",

            humidity: "68%",

            rainChance: "51%",

            wind: "3 km/h"

        },


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
                localStorage.getItem(
                    "agrismart_session"
                );

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

    function renderWeather() {

        const weather =
            HOME_MOCK_DATA.weather;


        const location =
            document.getElementById(
                "weatherLocation"
            );

        const temperature =
            document.getElementById(
                "weatherTemperature"
            );

        const description =
            document.getElementById(
                "weatherDescription"
            );

        const humidity =
            document.getElementById(
                "humidityValue"
            );

        const rain =
            document.getElementById(
                "rainValue"
            );

        const wind =
            document.getElementById(
                "windValue"
            );


        if (location) {

            location.textContent =
                weather.location;

        }


        if (temperature) {

            temperature.textContent =
                weather.temperature;

        }


        if (description) {

            description.textContent =
                weather.description;

        }


        if (humidity) {

            humidity.textContent =
                weather.humidity;

        }


        if (rain) {

            rain.textContent =
                weather.rainChance;

        }


        if (wind) {

            wind.textContent =
                weather.wind;

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

    function setupCropActions() {

        const editButtons =
            document.querySelectorAll(
                ".crop-action.edit"
            );


        editButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        alert(
                            "Chức năng chỉnh sửa cây trồng sẽ được kết nối sau."
                        );

                    }
                );

            }
        );


        const deleteButtons =
            document.querySelectorAll(
                ".crop-action.delete"
            );


        deleteButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const confirmed =
                            window.confirm(
                                "Bạn có chắc muốn xóa cây trồng này?"
                            );


                        if (confirmed) {

                            alert(
                                "Dữ liệu đang là mock nên chưa thực hiện xóa thật."
                            );

                        }

                    }
                );

            }
        );

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

                alert(
                    "Weather API đang được BE2 phát triển. Hiện tại trang sử dụng dữ liệu thời tiết mẫu."
                );

            }
        );

    }


    /* =====================================================
       VIEW ALL BUTTONS
       ===================================================== */

    function setupViewButtons() {

        const buttons =
            document.querySelectorAll(
                ".view-all-button"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        alert(
                            "Chức năng xem toàn bộ dữ liệu sẽ được bổ sung ở module tương ứng."
                        );

                    }
                );

            }
        );

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
                 * Để href="ai.html" xử lý
                 * điều hướng tự nhiên.
                 */

                console.log(
                    "Mở module AI."
                );

            }
        );

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

        setupCropActions();

        setupForecastButton();

        setupViewButtons();

        setupThemeButton();

        setupAIButton();


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