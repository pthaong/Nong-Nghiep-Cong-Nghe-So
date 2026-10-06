(function () {
  "use strict";

  let allSeasons = [];
  let displayedSeasons = [];

  const adminApp = document.getElementById("adminApp");
  const adminName = document.getElementById("adminName");

  const searchInput = document.getElementById("searchInput");
  const summaryCount = document.getElementById("summaryCount");

  const stateLoading = document.getElementById("stateLoading");
  const stateError = document.getElementById("stateError");
  const stateEmpty = document.getElementById("stateEmpty");
  const stateNoMatch = document.getElementById("stateNoMatch");

  const errorDesc = document.getElementById("errorDesc");

  const tableCard = document.getElementById("tableCard");
  const seasonTableBody = document.getElementById("seasonTableBody");

  const btnRefresh = document.getElementById("btnRefresh");
  const btnRetry = document.getElementById("btnRetry");
  const btnExportExcel = document.getElementById("btnExportExcel");
  const btnLogout = document.getElementById("btnLogout");


  // =========================================================
  // ADMIN SESSION
  // =========================================================

  function getStoredAdmin() {
    const keys = [
      "user",
      "currentUser",
      "authUser"
    ];

    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);

        if (!raw) {
          continue;
        }

        const data = JSON.parse(raw);

        if (
          data &&
          String(data.role || "").toUpperCase() === "ADMIN"
        ) {
          return data;
        }
      } catch (_) {
        // Bỏ qua dữ liệu localStorage không hợp lệ.
      }
    }

    // admin-users.js hiện tại có thể quản lý phiên riêng.
    // Không chặn trang ở đây để tránh phá cơ chế đăng nhập đang chạy.
    return null;
  }


  function initializeAdmin() {
    const admin = getStoredAdmin();

    if (admin && admin.name) {
      adminName.textContent = admin.name;
    }

    adminApp.classList.add("ready");
  }


  // =========================================================
  // UI STATE
  // =========================================================

  function hideAllStates() {
    stateLoading.hidden = true;
    stateError.hidden = true;
    stateEmpty.hidden = true;
    stateNoMatch.hidden = true;
    tableCard.hidden = true;
  }


  function showLoading() {
    hideAllStates();

    stateLoading.hidden = false;
    summaryCount.hidden = true;
  }


  function showError(error) {
    hideAllStates();

    stateError.hidden = false;

    errorDesc.textContent =
      error?.message ||
      "Không thể kết nối tới máy chủ.";
  }


  function showEmpty() {
    hideAllStates();

    stateEmpty.hidden = false;

    summaryCount.textContent = "0 mùa vụ";
    summaryCount.hidden = false;
  }


  function showNoMatch() {
    hideAllStates();

    stateNoMatch.hidden = false;

    summaryCount.textContent = "0 kết quả";
    summaryCount.hidden = false;
  }


  // =========================================================
  // FORMAT
  // =========================================================

  function safeText(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return String(value);
  }


  function escapeHtml(value) {
    return safeText(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const parts = String(value).split("-");

    if (parts.length !== 3) {
      return safeText(value);
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }


  function formatArea(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return safeText(value);
    }

    return `${number.toLocaleString("vi-VN")} ha`;
  }


  function getStatusClass(status) {
    const normalized =
      String(status || "")
        .trim()
        .toLowerCase();

    if (
      normalized.includes("hoàn") ||
      normalized.includes("completed")
    ) {
      return "status-active";
    }

    if (
      normalized.includes("hủy") ||
      normalized.includes("cancel")
    ) {
      return "status-locked";
    }

    return "status-other";
  }


  // =========================================================
  // RENDER TABLE
  // =========================================================

  function renderTable(seasons) {
    displayedSeasons = Array.isArray(seasons)
      ? seasons
      : [];

    if (allSeasons.length === 0) {
      showEmpty();
      return;
    }

    if (displayedSeasons.length === 0) {
      showNoMatch();
      return;
    }

    hideAllStates();

    seasonTableBody.innerHTML =
      displayedSeasons
        .map((season) => {

          const statusClass =
            getStatusClass(season.status);

          return `
            <tr>

              <td data-label="ID">
                ${escapeHtml(season.id)}
              </td>

              <td data-label="Người dùng"
                  class="cell-name">
                ${escapeHtml(season.userName)}
              </td>

              <td data-label="Số điện thoại">
                ${escapeHtml(season.phone)}
              </td>

              <td data-label="Tên mùa vụ">
                ${escapeHtml(season.name)}
              </td>

              <td data-label="Cây trồng">
                ${escapeHtml(season.crop)}
              </td>

              <td data-label="Diện tích">
                ${escapeHtml(formatArea(season.area))}
              </td>

              <td data-label="Ngày bắt đầu">
                ${escapeHtml(formatDate(season.start))}
              </td>

              <td data-label="Ngày kết thúc">
                ${escapeHtml(formatDate(season.end))}
              </td>

              <td data-label="Trạng thái">
                <span class="status-badge ${statusClass}">
                  ${escapeHtml(season.status)}
                </span>
              </td>

            </tr>
          `;
        })
        .join("");

    tableCard.hidden = false;

    summaryCount.textContent =
      `${displayedSeasons.length} mùa vụ`;

    summaryCount.hidden = false;
  }


  // =========================================================
  // LOAD API
  // =========================================================

  async function loadSeasons() {
    showLoading();

    try {
      const data =
        await window.AdminSeasonService.getAll();

      allSeasons =
        Array.isArray(data)
          ? data
          : [];

      searchInput.value = "";

      renderTable(allSeasons);

    } catch (error) {
      console.error(
        "Admin season load error:",
        error
      );

      showError(error);
    }
  }


  // =========================================================
  // SEARCH BY SEASON ID
  // =========================================================

  function searchById() {
    const keyword =
      searchInput.value.trim();

    if (!keyword) {
      renderTable(allSeasons);
      return;
    }

    const result =
      allSeasons.filter(
        (season) =>
          String(season.id) === keyword
      );

    renderTable(result);
  }


  // =========================================================
  // EXPORT EXCEL-COMPATIBLE CSV
  // =========================================================

  function csvCell(value) {
    const text =
      safeText(value)
        .replaceAll('"', '""');

    return `"${text}"`;
  }


  function exportExcel() {
    const data =
      displayedSeasons.length > 0
        ? displayedSeasons
        : allSeasons;

    if (!data.length) {
      alert("Không có dữ liệu mùa vụ để xuất.");
      return;
    }

    const headers = [
      "ID",
      "Người dùng",
      "Số điện thoại",
      "Tên mùa vụ",
      "Cây trồng",
      "Diện tích (ha)",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Trạng thái"
    ];

    const rows =
      data.map((season) => [
        season.id,
        season.userName,
        season.phone,
        season.name,
        season.crop,
        season.area,
        formatDate(season.start),
        formatDate(season.end),
        season.status
      ]);

    const csv =
      [
        headers,
        ...rows
      ]
        .map(
          (row) =>
            row.map(csvCell).join(",")
        )
        .join("\r\n");

    // BOM để Excel trên Windows đọc tiếng Việt đúng.
    const blob =
      new Blob(
        ["\uFEFF" + csv],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;

    link.download =
      `danh-sach-mua-vu-${today}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  function logout() {
    // Giữ tương thích với các tên session thường dùng.
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authUser");

    sessionStorage.clear();

    window.location.href =
      "admin-login.html";
  }


  // =========================================================
  // EVENTS
  // =========================================================

  searchInput.addEventListener(
    "input",
    searchById
  );

  btnRefresh.addEventListener(
    "click",
    loadSeasons
  );

  btnRetry.addEventListener(
    "click",
    loadSeasons
  );

  btnExportExcel.addEventListener(
    "click",
    exportExcel
  );

  btnLogout.addEventListener(
    "click",
    logout
  );


  // =========================================================
  // START
  // =========================================================

  initializeAdmin();

  loadSeasons();

})();