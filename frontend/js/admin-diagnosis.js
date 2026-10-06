/**
 * AgriSmart Admin - Diagnosis History
 * Admin chỉ xem lịch sử chẩn đoán.
 */

(function () {
  "use strict";

  let diagnoses = [];
  let filteredDiagnoses = [];

  const tableBody = document.getElementById("diagnosisTableBody");
  const tableCard = document.getElementById("tableCard");

  const stateLoading = document.getElementById("stateLoading");
  const stateError = document.getElementById("stateError");
  const stateEmpty = document.getElementById("stateEmpty");
  const stateNoMatch = document.getElementById("stateNoMatch");

  const errorDesc = document.getElementById("errorDesc");

  const searchInput = document.getElementById("searchInput");
  const summaryCount = document.getElementById("summaryCount");

  const btnRefresh = document.getElementById("btnRefresh");
  const btnRetry = document.getElementById("btnRetry");
  const btnExportExcel = document.getElementById("btnExportExcel");
  const btnLogout = document.getElementById("btnLogout");


  // =========================
  // KHỞI TẠO
  // =========================

  document.addEventListener("DOMContentLoaded", function () {

  // Hiển thị giao diện Admin
  const adminApp = document.getElementById("adminApp");

  if (adminApp) {
    adminApp.classList.add("ready");
  }

  bindEvents();

  loadDiagnoses();

});


  function bindEvents() {

    searchInput?.addEventListener("input", handleSearch);

    btnRefresh?.addEventListener("click", function () {
      searchInput.value = "";
      loadDiagnoses();
    });

    btnRetry?.addEventListener("click", loadDiagnoses);

    btnExportExcel?.addEventListener("click", exportExcel);

    btnLogout?.addEventListener("click", logout);

    tableBody?.addEventListener("click", handleTableClick);
  }


  // =========================
  // LOAD DATA
  // =========================

  async function loadDiagnoses() {

    showLoading();

    try {

      const data = await window.AdminDiagnosisService.getAll();

      diagnoses = Array.isArray(data)
        ? data
        : [];

      filteredDiagnoses = [...diagnoses];

      render();

    } catch (error) {

      console.error("Load diagnosis error:", error);

      showError(
        error?.message ||
        "Không thể tải lịch sử chẩn đoán bệnh."
      );
    }
  }


  // =========================
  // RENDER
  // =========================

  function render() {

    hideStates();

    if (diagnoses.length === 0) {

      stateEmpty.hidden = false;

      updateSummary(0);

      return;
    }

    if (filteredDiagnoses.length === 0) {

      stateNoMatch.hidden = false;

      updateSummary(0);

      return;
    }

    tableCard.hidden = false;

    tableBody.innerHTML =
      filteredDiagnoses
        .map(createRow)
        .join("");

    updateSummary(filteredDiagnoses.length);
  }


  function createRow(item) {

    const id = safe(item.id);

    const userName =
      safe(
        item.userName ||
        item.name ||
        "-"
      );

    const phone =
      safe(item.phone || "-");

    const plantType =
      safe(item.plantType || "-");

    const symptoms =
      safe(shortText(item.symptoms, 45));

    const diseaseName =
      safe(item.diseaseName || "Chưa thể xác định");

    const severity =
      safe(item.severity || "-");

    const createdAt =
      formatDateTime(item.createdAt);

    return `
      <tr>

        <td>
          ${id}
        </td>

        <td>
          <strong>
            ${userName}
          </strong>
        </td>

        <td>
          ${phone}
        </td>

        <td>
          ${plantType}
        </td>

        <td title="${safe(item.symptoms || "")}">
          ${symptoms}
        </td>

        <td>
          ${diseaseName}
        </td>

        <td>
          ${severity}
        </td>

        <td>
          ${createdAt}
        </td>

        <td>
          <button
            type="button"
            class="btn btn-sm btn-outline-success btn-detail"
            data-id="${id}">

            <i class="bi bi-eye me-1"></i>
            Xem

          </button>
        </td>

      </tr>
    `;
  }


  // =========================
  // SEARCH ID
  // =========================

  function handleSearch() {

    const keyword =
      searchInput.value.trim();

    if (!keyword) {

      filteredDiagnoses = [...diagnoses];

      render();

      return;
    }

    filteredDiagnoses =
      diagnoses.filter(function (item) {

        return String(item.id) === keyword;

      });

    render();
  }


  // =========================
  // TABLE CLICK
  // =========================

  function handleTableClick(event) {

    const button =
      event.target.closest(".btn-detail");

    if (!button) {
      return;
    }

    const id = button.dataset.id;

    openDetail(id);
  }


  // =========================
  // DETAIL
  // =========================

  async function openDetail(id) {

    try {

      const item =
        await window.AdminDiagnosisService.getById(id);

      fillDetail(item);

      const modalElement =
        document.getElementById(
          "diagnosisDetailModal"
        );

      const modal =
        bootstrap.Modal.getOrCreateInstance(
          modalElement
        );

      modal.show();

    } catch (error) {

      console.error(
        "Diagnosis detail error:",
        error
      );

      alert(
        error?.message ||
        "Không thể tải chi tiết chẩn đoán."
      );
    }
  }


  function fillDetail(item) {

    setText(
      "detailId",
      item.id
    );

    setText(
      "detailUserName",
      item.userName ||
      item.name ||
      "-"
    );

    setText(
      "detailPhone",
      item.phone
    );

    setText(
      "detailPlantType",
      item.plantType
    );

    setText(
      "detailSymptoms",
      item.symptoms
    );

    setText(
      "detailDiseaseName",
      item.diseaseName ||
      "Chưa thể xác định"
    );

    setText(
      "detailSeverity",
      item.severity
    );

    setText(
      "detailResult",
      normalizeResult(item.result)
    );

    setText(
      "detailCause",
      item.cause
    );

    setText(
      "detailPrevention",
      item.prevention
    );

    setText(
      "detailTreatment",
      item.treatment
    );

    setText(
      "detailImageName",
      item.imageName
    );

    setText(
      "detailCreatedAt",
      formatDateTime(item.createdAt)
    );
  }


  // =========================
  // RESULT
  // =========================

  function normalizeResult(value) {

    if (!value) {
      return "-";
    }

    /*
     * Một số bản ghi hiện tại lưu result
     * dưới dạng JSON string.
     */

    if (typeof value === "string") {

      try {

        const parsed = JSON.parse(value);

        if (
          parsed &&
          typeof parsed === "object"
        ) {

          return Object.entries(parsed)
            .map(function ([key, val]) {

              return `${key}: ${formatObjectValue(val)}`;

            })
            .join("\n");
        }

      } catch (_) {
        // Không phải JSON -> hiển thị nguyên bản.
      }
    }

    return String(value);
  }


  function formatObjectValue(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (typeof value === "object") {

      try {
        return JSON.stringify(value);
      } catch (_) {
        return String(value);
      }
    }

    return String(value);
  }


  // =========================
  // EXPORT EXCEL / CSV
  // =========================

  function exportExcel() {

    const source =
      filteredDiagnoses.length > 0
        ? filteredDiagnoses
        : diagnoses;

    if (source.length === 0) {

      alert(
        "Không có dữ liệu chẩn đoán để xuất."
      );

      return;
    }

    const rows = [
      [
        "ID",
        "Người dùng",
        "Số điện thoại",
        "Cây trồng",
        "Triệu chứng",
        "Tên bệnh",
        "Mức độ",
        "Kết quả",
        "Nguyên nhân",
        "Phòng ngừa",
        "Điều trị",
        "Tên ảnh",
        "Thời gian"
      ]
    ];


    source.forEach(function (item) {

      rows.push([
        item.id ?? "",
        item.userName ?? item.name ?? "",
        item.phone ?? "",
        item.plantType ?? "",
        item.symptoms ?? "",
        item.diseaseName ?? "",
        item.severity ?? "",
        normalizeResult(item.result),
        item.cause ?? "",
        item.prevention ?? "",
        item.treatment ?? "",
        item.imageName ?? "",
        formatDateTime(item.createdAt)
      ]);

    });


    const csv =
      "\uFEFF" +
      rows
        .map(function (row) {

          return row
            .map(csvValue)
            .join(",");

        })
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
      `lich-su-chan-doan-${getToday()}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }


  function csvValue(value) {

    const text =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    return `"${text.replace(/"/g, '""')}"`;
  }


  // =========================
  // UI STATES
  // =========================

  function showLoading() {

    hideStates();

    stateLoading.hidden = false;

    tableCard.hidden = true;

    summaryCount.hidden = true;
  }


  function showError(message) {

    hideStates();

    tableCard.hidden = true;

    stateError.hidden = false;

    errorDesc.textContent =
      message || "Internal server error";

    summaryCount.hidden = true;
  }


  function hideStates() {

    stateLoading.hidden = true;
    stateError.hidden = true;
    stateEmpty.hidden = true;
    stateNoMatch.hidden = true;

    tableCard.hidden = true;
  }


  function updateSummary(count) {

    summaryCount.textContent =
      `${count} chẩn đoán`;

    summaryCount.hidden = false;
  }


  // =========================
  // FORMAT
  // =========================

  function formatDateTime(value) {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function shortText(value, maxLength) {

    if (!value) {
      return "-";
    }

    const text =
      String(value).trim();

    if (text.length <= maxLength) {
      return text;
    }

    return (
      text.substring(
        0,
        maxLength
      ) + "..."
    );
  }


  function safe(value) {

    return String(
      value === null ||
      value === undefined
        ? ""
        : value
    )
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function setText(id, value) {

    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    element.textContent =
      value === null ||
      value === undefined ||
      value === ""
        ? "-"
        : String(value);
  }


  function getToday() {

    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  // =========================
  // LOGOUT
  // =========================

  function logout() {

    /*
     * Không xóa toàn bộ localStorage vì
     * có thể ảnh hưởng dữ liệu khác của FE.
     */

    const possibleKeys = [
      "admin",
      "adminUser",
      "adminToken",
      "adminSession"
    ];

    possibleKeys.forEach(function (key) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    window.location.href =
      "admin-login.html";
  }

})();