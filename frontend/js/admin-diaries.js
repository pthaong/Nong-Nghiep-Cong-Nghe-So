(function () {
  "use strict";

  const adminApp = document.getElementById("adminApp");

  const searchInput = document.getElementById("searchInput");

  const btnRefresh = document.getElementById("btnRefresh");
  const btnRetry = document.getElementById("btnRetry");
  const btnExportExcel = document.getElementById("btnExportExcel");
  const btnLogout = document.getElementById("btnLogout");

  const stateLoading = document.getElementById("stateLoading");
  const stateError = document.getElementById("stateError");
  const stateEmpty = document.getElementById("stateEmpty");
  const stateNoMatch = document.getElementById("stateNoMatch");

  const errorDesc = document.getElementById("errorDesc");

  const tableCard = document.getElementById("tableCard");
  const diaryTableBody = document.getElementById("diaryTableBody");

  const summaryCount = document.getElementById("summaryCount");

  let diaries = [];
  let filteredDiaries = [];


  // =========================================================
  // STATE
  // =========================================================

  function hideStates() {

    stateLoading.hidden = true;
    stateError.hidden = true;
    stateEmpty.hidden = true;
    stateNoMatch.hidden = true;
    tableCard.hidden = true;
  }


  function showLoading() {

    hideStates();

    stateLoading.hidden = false;

    summaryCount.hidden = true;
  }


  function showError(error) {

    hideStates();

    stateError.hidden = false;

    errorDesc.textContent =
      error?.message ||
      "Đã xảy ra lỗi khi tải dữ liệu.";
  }


  function showEmpty() {

    hideStates();

    stateEmpty.hidden = false;

    summaryCount.textContent = "0 nhật ký";
    summaryCount.hidden = false;
  }


  function showNoMatch() {

    hideStates();

    stateNoMatch.hidden = false;

    summaryCount.textContent = "0 nhật ký";
    summaryCount.hidden = false;
  }


  // =========================================================
  // FORMAT
  // =========================================================

  function safe(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return String(value);
  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }

    const parts = String(value).split("-");

    if (parts.length !== 3) {
      return value;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }


  function formatAmount(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return safe(value);
    }

    return number.toLocaleString("vi-VN");
  }


  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  // =========================================================
  // TABLE
  // =========================================================

  function renderTable(data) {

    hideStates();

    if (!data.length) {

      if (searchInput.value.trim()) {
        showNoMatch();
      } else {
        showEmpty();
      }

      return;
    }


    diaryTableBody.innerHTML = data.map(diary => {

      return `
        <tr>

          <td data-label="ID">
            ${escapeHtml(safe(diary.id))}
          </td>

          <td data-label="Người dùng"
              class="cell-name">
            ${escapeHtml(safe(diary.userName))}
          </td>

          <td data-label="Số điện thoại">
            ${escapeHtml(safe(diary.phone))}
          </td>

          <td data-label="Mùa vụ">
            ${escapeHtml(safe(diary.seasonName))}
          </td>

          <td data-label="Ngày thực hiện">
            ${escapeHtml(formatDate(diary.activityDate))}
          </td>

          <td data-label="Hoạt động">
            ${escapeHtml(safe(diary.activityType))}
          </td>

          <td data-label="Nội dung">
            ${escapeHtml(safe(diary.content))}
          </td>

          <td data-label="Lượng nước">
            ${escapeHtml(formatAmount(diary.waterAmount))}
          </td>

          <td data-label="Phân bón">
            ${escapeHtml(formatAmount(diary.fertilizerAmount))}
          </td>

          <td data-label="Thuốc BVTV">
            ${escapeHtml(formatAmount(diary.pesticideAmount))}
          </td>

          <td data-label="Ghi chú">
            ${escapeHtml(safe(diary.notes))}
          </td>

        </tr>
      `;

    }).join("");


    tableCard.hidden = false;

    summaryCount.textContent =
      `${data.length} nhật ký`;

    summaryCount.hidden = false;
  }


  // =========================================================
  // LOAD DATA
  // =========================================================

  async function loadDiaries() {

    showLoading();

    try {

      const data =
        await window.AdminDiaryService.getAll();

      diaries =
        Array.isArray(data)
          ? data
          : [];

      filteredDiaries = [...diaries];

      searchInput.value = "";

      renderTable(filteredDiaries);

    } catch (error) {

      console.error(
        "Không thể tải nhật ký:",
        error
      );

      showError(error);
    }
  }


  // =========================================================
  // SEARCH ID
  // =========================================================

  function handleSearch() {

    const keyword =
      searchInput.value.trim();

    if (!keyword) {

      filteredDiaries = [...diaries];

      renderTable(filteredDiaries);

      return;
    }


    filteredDiaries = diaries.filter(diary => {

      return String(diary.id ?? "")
        .includes(keyword);

    });


    renderTable(filteredDiaries);
  }


  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  function csvCell(value) {

    const text =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    return `"${text.replaceAll('"', '""')}"`;
  }


  function exportExcel() {

    const data =
      filteredDiaries.length
        ? filteredDiaries
        : diaries;


    if (!data.length) {

      alert(
        "Không có dữ liệu nhật ký để xuất."
      );

      return;
    }


    const rows = [

      [
        "ID",
        "Người dùng",
        "Số điện thoại",
        "ID mùa vụ",
        "Tên mùa vụ",
        "Ngày thực hiện",
        "Hoạt động",
        "Nội dung",
        "Lượng nước",
        "Phân bón",
        "Thuốc BVTV",
        "Ghi chú"
      ],

      ...data.map(diary => [

        diary.id,
        diary.userName,
        diary.phone,

        diary.seasonId,
        diary.seasonName,

        formatDate(diary.activityDate),

        diary.activityType,
        diary.content,

        diary.waterAmount,
        diary.fertilizerAmount,
        diary.pesticideAmount,

        diary.notes

      ])

    ];


    const csv =
      "\uFEFF" +
      rows
        .map(row =>
          row.map(csvCell).join(",")
        )
        .join("\r\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `nhat-ky-canh-tac-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  function logout() {

    /*
     * Giữ tương thích với phiên Admin hiện tại.
     * Chỉ xóa dữ liệu phiên ở browser.
     */

    sessionStorage.clear();

    window.location.href =
      "admin-login.html";
  }


  // =========================================================
  // EVENTS
  // =========================================================

  searchInput.addEventListener(
    "input",
    handleSearch
  );


  btnRefresh.addEventListener(
    "click",
    loadDiaries
  );


  btnRetry.addEventListener(
    "click",
    loadDiaries
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
  // INIT
  // =========================================================

  adminApp.classList.add("ready");

  loadDiaries();

})();