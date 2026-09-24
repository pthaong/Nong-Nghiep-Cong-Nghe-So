/**
 * =========================================================
 * AgriSmart - Profile
 * =========================================================
 *
 * Backend API:
 *
 * GET:
 * /api/users/profile?email=...
 *
 * PUT:
 * /api/users/profile?email=...
 *
 * Dữ liệu Profile:
 * - Họ tên
 * - Email
 * - Số điện thoại
 * =========================================================
 */

(function () {

    "use strict";


    /* =====================================================
       CONFIG
       ===================================================== */

    const API_BASE_URL =
        window.APP_CONFIG?.API_BASE_URL ||
        "http://localhost:8080/api";


    /* =====================================================
       DOM
       ===================================================== */

    const profileForm =
        document.getElementById("profileForm");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileNameTitle =
        document.getElementById("profileNameTitle");

    const editButton =
        document.getElementById("editProfileButton");

    const saveButton =
        document.getElementById("saveProfileButton");

    const cancelButton =
        document.getElementById("cancelProfileButton");

    const messageBox =
        document.getElementById("profileMessage");


    /* =====================================================
       STATE
       ===================================================== */

    let originalProfile = null;


    /* =====================================================
       MESSAGE
       ===================================================== */

    function showMessage(message, type) {

        messageBox.textContent =
            message;

        messageBox.className =
            `profile-message ${type}`;

    }


    function clearMessage() {

        messageBox.textContent = "";

        messageBox.className =
            "profile-message";

    }


    /* =====================================================
       GET EMAIL
       ===================================================== */

    function getCurrentEmail() {

        /*
         * Trước tiên thử session.
         */

        try {

            const raw =
                localStorage.getItem(
                    "agrismart_session"
                );

            if (raw) {

                const session =
                    JSON.parse(raw);

                const email =
                    session.email ||
                    session.user?.email ||
                    session.user?.username;

                if (email) {

                    return email;

                }

            }

        } catch (error) {

            console.warn(
                "Không đọc được agrismart_session:",
                error
            );

        }


        /*
         * Fallback cho dữ liệu auth mock
         */

        try {

            const raw =
                localStorage.getItem(
                    "agrismart_current_user"
                );

            if (raw) {

                const user =
                    JSON.parse(raw);

                if (user.email) {

                    return user.email;

                }

            }

        } catch (error) {

            console.warn(
                "Không đọc được agrismart_current_user:",
                error
            );

        }


        return "";

    }


    /* =====================================================
       SET FORM
       ===================================================== */

    function setProfile(profile) {

        profileName.value =
            profile.name ||
            profile.fullName ||
            "";

        profileEmail.value =
            profile.email ||
            "";

        profilePhone.value =
            profile.phone ||
            profile.phoneNumber ||
            "";

        profileNameTitle.textContent =
            profile.name ||
            profile.fullName ||
            "Nông dân";

    }


    /* =====================================================
       EDIT MODE
       ===================================================== */

    function setEditMode(enabled) {

        profileName.disabled =
            !enabled;

        profilePhone.disabled =
            !enabled;

        /*
         * Email vẫn không cho chỉnh sửa
         * vì email được dùng để xác định tài khoản.
         */

        profileEmail.disabled = true;


        editButton.hidden =
            enabled;

        saveButton.hidden =
            !enabled;

        cancelButton.hidden =
            !enabled;

    }


    /* =====================================================
       GET PROFILE
       ===================================================== */

    async function loadProfile() {

        clearMessage();


        const email =
            getCurrentEmail();


        if (!email) {

            showMessage(
                "Không xác định được email tài khoản. Vui lòng đăng nhập lại.",
                "error"
            );

            return;

        }


        try {

            const url =
                `${API_BASE_URL}/users/profile?email=${encodeURIComponent(email)}`;


            const response =
                await fetch(url, {

                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }

                });


            if (!response.ok) {

                throw new Error(
                    `Không thể lấy hồ sơ (${response.status}).`
                );

            }


            const profile =
                await response.json();


            originalProfile = {
                ...profile
            };


            setProfile(profile);

            setEditMode(false);


            console.log(
                "Profile từ Backend:",
                profile
            );


        } catch (error) {

            console.error(
                "GET Profile error:",
                error
            );


            showMessage(
                "Không thể lấy thông tin hồ sơ từ Backend.",
                "error"
            );

        }

    }


    /* =====================================================
       UPDATE PROFILE
       ===================================================== */

    async function updateProfile() {

        clearMessage();


        const email =
            profileEmail.value.trim();

        const name =
            profileName.value.trim();

        const phone =
            profilePhone.value.trim();


        if (!email) {

            showMessage(
                "Email tài khoản không hợp lệ.",
                "error"
            );

            return;

        }


        if (!name) {

            showMessage(
                "Vui lòng nhập họ và tên.",
                "error"
            );

            return;

        }


        if (!phone) {

            showMessage(
                "Vui lòng nhập số điện thoại.",
                "error"
            );

            return;

        }


        saveButton.disabled = true;

        saveButton.innerHTML =
            '<i class="bi bi-hourglass-split"></i> Đang lưu...';


        try {

            const url =
                `${API_BASE_URL}/users/profile?email=${encodeURIComponent(email)}`;


            const response =
                await fetch(url, {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        phone: phone

                    })

                });


            if (!response.ok) {

                throw new Error(
                    `Cập nhật hồ sơ thất bại (${response.status}).`
                );

            }


            const updatedProfile =
                await response.json();


            originalProfile = {
                ...updatedProfile
            };


            setProfile(
                updatedProfile
            );


            setEditMode(false);


            showMessage(
                "Cập nhật thông tin hồ sơ thành công.",
                "success"
            );


        } catch (error) {

            console.error(
                "PUT Profile error:",
                error
            );


            showMessage(
                "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
                "error"
            );

        } finally {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                '<i class="bi bi-check-lg"></i> Lưu thay đổi';

        }

    }


    /* =====================================================
       EDIT
       ===================================================== */

    editButton.addEventListener(
        "click",
        function () {

            clearMessage();

            setEditMode(true);

            profileName.focus();

        }
    );


    /* =====================================================
       CANCEL
       ===================================================== */

    cancelButton.addEventListener(
        "click",
        function () {

            clearMessage();


            if (originalProfile) {

                setProfile(
                    originalProfile
                );

            }


            setEditMode(false);

        }
    );


    /* =====================================================
       SUBMIT
       ===================================================== */

    profileForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            updateProfile();

        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    loadProfile();

})();