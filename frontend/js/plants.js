(function () {
    "use strict";

    let plants = [];
    let deletePlantId = null;

    const elements = {};
   function applyTheme(theme) {
    const root = document.documentElement;
    const normalizedTheme = theme === "dark" ? "dark" : "light";

    root.setAttribute("data-theme", normalizedTheme);

    const icon = document.getElementById("themeIcon");

    if (icon) {
        icon.className =
            normalizedTheme === "dark"
                ? "bi bi-sun"
                : "bi bi-moon-stars";
    }
}

function initTheme() {
    const savedTheme =
        localStorage.getItem("agrismart_theme") || "light";

    applyTheme(savedTheme);

    const button = document.getElementById("btnTheme");

    if (!button) return;

    button.addEventListener("click", function () {
        const root = document.documentElement;

        const nextTheme =
            root.getAttribute("data-theme") === "dark"
                ? "light"
                : "dark";

        localStorage.setItem("agrismart_theme", nextTheme);

        applyTheme(nextTheme);
    });
}
    function cacheElements() {
        elements.totalPlants = document.getElementById("totalPlants");
        elements.plantsLoading = document.getElementById("plantsLoading");
        elements.plantsEmpty = document.getElementById("plantsEmpty");
        elements.plantsGrid = document.getElementById("plantsGrid");
        elements.plantMessage = document.getElementById("plantMessage");

        elements.btnAddPlant = document.getElementById("btnAddPlant");
        elements.btnReloadPlants = document.getElementById("btnReloadPlants");

        elements.plantModal = document.getElementById("plantModal");
        elements.plantModalBackdrop =
            document.getElementById("plantModalBackdrop");
        elements.plantModalTitle =
            document.getElementById("plantModalTitle");

        elements.btnClosePlantModal =
            document.getElementById("btnClosePlantModal");
        elements.btnCancelPlant =
            document.getElementById("btnCancelPlant");

        elements.plantForm = document.getElementById("plantForm");
        elements.plantId = document.getElementById("plantId");
        elements.plantName = document.getElementById("plantName");
        elements.plantType = document.getElementById("plantType");
        elements.plantVariety = document.getElementById("plantVariety");
        elements.plantGrowthStage =
            document.getElementById("plantGrowthStage");
        elements.plantDescription =
            document.getElementById("plantDescription");

        elements.btnSavePlant =
            document.getElementById("btnSavePlant");
        elements.savePlantText =
            document.getElementById("savePlantText");

        elements.deleteModal =
            document.getElementById("deleteModal");
        elements.deleteModalBackdrop =
            document.getElementById("deleteModalBackdrop");
        elements.deletePlantName =
            document.getElementById("deletePlantName");
        elements.btnCancelDelete =
            document.getElementById("btnCancelDelete");
        elements.btnConfirmDelete =
            document.getElementById("btnConfirmDelete");
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) {
            return "Chưa có";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Chưa có";
        }

        return date.toLocaleDateString("vi-VN");
    }

    function showMessage(message, type = "success") {
        if (!elements.plantMessage) {
            return;
        }

        elements.plantMessage.textContent = message;
        elements.plantMessage.className =
            "plant-message " + type;
        elements.plantMessage.hidden = false;

        window.clearTimeout(showMessage.timer);

        showMessage.timer = window.setTimeout(function () {
            elements.plantMessage.hidden = true;
        }, 3500);
    }

    function setLoading(loading) {
        elements.plantsLoading.hidden = !loading;

        if (loading) {
            elements.plantsEmpty.hidden = true;
            elements.plantsGrid.innerHTML = "";
        }
    }

    function renderPlants() {
        elements.totalPlants.textContent =
            String(plants.length);

        if (plants.length === 0) {
            elements.plantsEmpty.hidden = false;
            elements.plantsGrid.innerHTML = "";
            return;
        }

        elements.plantsEmpty.hidden = true;

        elements.plantsGrid.innerHTML = plants
            .map(function (plant) {
                return `
                    <article
                        class="plant-card"
                        data-id="${plant.id}"
                    >

                        <div class="plant-card-head">

                            <div class="plant-card-icon">
                                <i class="bi bi-flower2"></i>
                            </div>

                            <span class="growth-badge">
                                ${escapeHtml(
                                    plant.growthStage ||
                                    "Chưa cập nhật"
                                )}
                            </span>

                        </div>

                        <div class="plant-card-body">

                            <h3>
                                ${escapeHtml(plant.name)}
                            </h3>

                            <div class="plant-type">
                                ${escapeHtml(plant.plantType)}
                            </div>

                            <div class="plant-details">

                                <div>
                                    <span>Giống cây</span>
                                    <strong>
                                        ${escapeHtml(
                                            plant.variety ||
                                            "Chưa cập nhật"
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>Ngày tạo</span>
                                    <strong>
                                        ${formatDate(
                                            plant.createdAt
                                        )}
                                    </strong>
                                </div>

                            </div>

                            ${
                                plant.description
                                    ? `
                                        <p class="plant-description">
                                            ${escapeHtml(
                                                plant.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>

                        <div class="plant-card-actions">

                            <button
                                type="button"
                                class="btn-edit-plant"
                                data-action="edit"
                                data-id="${plant.id}"
                            >
                                <i class="bi bi-pencil"></i>
                                Sửa
                            </button>

                            <button
                                type="button"
                                class="btn-delete-plant"
                                data-action="delete"
                                data-id="${plant.id}"
                            >
                                <i class="bi bi-trash"></i>
                                Xóa
                            </button>

                        </div>

                    </article>
                `;
            })
            .join("");

        bindCardActions();
    }

    async function loadPlants() {
        setLoading(true);

        try {
            plants = await window.PlantService.getAll();

            if (!Array.isArray(plants)) {
                plants = [];
            }

            renderPlants();

            console.log(
                "Plants loaded from Backend:",
                plants
            );

        } catch (error) {
            console.error(
                "Không tải được cây trồng:",
                error
            );

            plants = [];
            renderPlants();

            showMessage(
                error.message ||
                "Không tải được danh sách cây trồng.",
                "error"
            );

        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        elements.plantForm.reset();
        elements.plantId.value = "";
    }

    function openCreateModal() {
        resetForm();

        elements.plantModalTitle.textContent =
            "Thêm cây trồng";

        elements.savePlantText.textContent =
            "Lưu cây trồng";

        elements.plantModal.hidden = false;

        document.body.classList.add("modal-open");

        window.setTimeout(function () {
            elements.plantName.focus();
        }, 50);
    }

    async function openEditModal(plantId) {
        try {
            const plant =
                await window.PlantService.getById(
                    plantId
                );

            elements.plantId.value =
                plant.id;

            elements.plantName.value =
                plant.name || "";

            elements.plantType.value =
                plant.plantType || "";

            elements.plantVariety.value =
                plant.variety || "";

            elements.plantGrowthStage.value =
                plant.growthStage || "";

            elements.plantDescription.value =
                plant.description || "";

            elements.plantModalTitle.textContent =
                "Chỉnh sửa cây trồng";

            elements.savePlantText.textContent =
                "Lưu thay đổi";

            elements.plantModal.hidden = false;

            document.body.classList.add("modal-open");

        } catch (error) {
            console.error(
                "Không lấy được cây trồng:",
                error
            );

            showMessage(
                error.message ||
                "Không thể tải thông tin cây trồng.",
                "error"
            );
        }
    }

    function closePlantModal() {
        elements.plantModal.hidden = true;
        document.body.classList.remove("modal-open");
        resetForm();
    }

    function getFormData() {
        return {
            name: elements.plantName.value.trim(),
            plantType:
                elements.plantType.value.trim(),
            variety:
                elements.plantVariety.value.trim(),
            growthStage:
                elements.plantGrowthStage.value.trim(),
            description:
                elements.plantDescription.value.trim()
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const data = getFormData();

        if (!data.name) {
            showMessage(
                "Vui lòng nhập tên cây trồng.",
                "error"
            );

            elements.plantName.focus();
            return;
        }

        if (!data.plantType) {
            showMessage(
                "Vui lòng nhập loại cây.",
                "error"
            );

            elements.plantType.focus();
            return;
        }

        const plantId =
            elements.plantId.value.trim();

        const editing = Boolean(plantId);

        try {
            elements.btnSavePlant.disabled = true;

            elements.savePlantText.textContent =
                editing
                    ? "Đang lưu..."
                    : "Đang thêm...";

            if (editing) {
                await window.PlantService.update(
                    plantId,
                    data
                );
            } else {
                await window.PlantService.create(
                    data
                );
            }

            closePlantModal();

            showMessage(
                editing
                    ? "Cập nhật cây trồng thành công."
                    : "Thêm cây trồng thành công.",
                "success"
            );

            await loadPlants();

        } catch (error) {
            console.error(
                "Không lưu được cây trồng:",
                error
            );

            showMessage(
                error.message ||
                "Không thể lưu cây trồng.",
                "error"
            );

        } finally {
            elements.btnSavePlant.disabled = false;

            elements.savePlantText.textContent =
                editing
                    ? "Lưu thay đổi"
                    : "Lưu cây trồng";
        }
    }

    function openDeleteModal(plantId) {
        const plant = plants.find(function (item) {
            return String(item.id) ===
                String(plantId);
        });

        if (!plant) {
            return;
        }

        deletePlantId = plant.id;

        elements.deletePlantName.textContent =
            plant.name || "cây trồng này";

        elements.deleteModal.hidden = false;

        document.body.classList.add("modal-open");
    }

    function closeDeleteModal() {
        deletePlantId = null;
        elements.deleteModal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    async function confirmDelete() {
        if (!deletePlantId) {
            return;
        }

        const plantId = deletePlantId;

        try {
            elements.btnConfirmDelete.disabled = true;

            await window.PlantService.remove(
                plantId
            );

            closeDeleteModal();

            showMessage(
                "Xóa cây trồng thành công.",
                "success"
            );

            await loadPlants();

        } catch (error) {
            console.error(
                "Không xóa được cây trồng:",
                error
            );

            showMessage(
                error.message ||
                "Không thể xóa cây trồng.",
                "error"
            );

        } finally {
            elements.btnConfirmDelete.disabled = false;
        }
    }

    function bindCardActions() {
        elements.plantsGrid
            .querySelectorAll(
                '[data-action="edit"]'
            )
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        openEditModal(
                            button.dataset.id
                        );
                    }
                );
            });

        elements.plantsGrid
            .querySelectorAll(
                '[data-action="delete"]'
            )
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        openDeleteModal(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    function bindEvents() {
        elements.btnAddPlant.addEventListener(
            "click",
            openCreateModal
        );

        elements.btnReloadPlants.addEventListener(
            "click",
            loadPlants
        );

        elements.btnClosePlantModal.addEventListener(
            "click",
            closePlantModal
        );

        elements.btnCancelPlant.addEventListener(
            "click",
            closePlantModal
        );

        elements.plantModalBackdrop.addEventListener(
            "click",
            closePlantModal
        );

        elements.plantForm.addEventListener(
            "submit",
            handleSubmit
        );

        elements.btnCancelDelete.addEventListener(
            "click",
            closeDeleteModal
        );

        elements.deleteModalBackdrop.addEventListener(
            "click",
            closeDeleteModal
        );

        elements.btnConfirmDelete.addEventListener(
            "click",
            confirmDelete
        );

        document.addEventListener(
            "keydown",
            function (event) {
                if (event.key !== "Escape") {
                    return;
                }

                if (!elements.plantModal.hidden) {
                    closePlantModal();
                }

                if (!elements.deleteModal.hidden) {
                    closeDeleteModal();
                }
            }
        );
    }

    function handleEditFromHome() {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const editId =
            params.get("edit");

        if (!editId) {
            return;
        }

        openEditModal(editId);
    }

    async function init() {
        console.log(
            "AgriSmart Plants initialized."
        );

        if (!window.PlantService) {
            console.error(
                "PlantService chưa được tải."
            );

            return;
        }

        cacheElements();
initTheme();
bindEvents();

        await loadPlants();

        handleEditFromHome();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();