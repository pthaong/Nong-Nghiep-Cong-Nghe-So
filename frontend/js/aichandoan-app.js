/**
 * app.js — Module "AI chẩn đoán bệnh cây"
 *
 * Kết nối Backend thật:
 * - POST /api/diagnosis/text  : chẩn đoán bằng triệu chứng
 * - POST /api/diagnosis/image : chẩn đoán bằng ảnh + triệu chứng
 *
 * Không sử dụng mock result.
 */
const AIService = (function () {
  const API_BASE_URL = 'http://localhost:8080';
 const TEXT_DIAGNOSIS_ENDPOINT = '/api/diagnosis/text';
const IMAGE_DIAGNOSIS_ENDPOINT = '/api/diagnosis/image';

  function authHeaders() {
    const token = localStorage.getItem('agrismart_token');
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  async function parseResponse(response) {
    const text = await response.text().catch(() => '');
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function getErrorMessage(status, body) {
    if (body && typeof body === 'object') {
      if (body.message) return body.message;
      if (body.error) return body.error;
    }

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    switch (status) {
      case 400:
        return 'Dữ liệu chẩn đoán không hợp lệ.';
      case 404:
        return 'Không tìm thấy API chẩn đoán.';
      case 500:
        return 'Backend đang xảy ra lỗi khi chẩn đoán.';
      default:
        return `API trả về lỗi HTTP ${status}.`;
    }
  }

  return {
    /**
     * @param {{plantType:string, symptoms:string}} payload
     * @returns {Promise<{
     *   cause:string,
     *   diseaseName:string,
     *   prevention:string,
     *   result:string,
     *   severity:string,
     *   treatment:string
     * }>}
     */
    async diagnose(payload) {
      const body = {
        plantType: payload.plantType || '',
        symptoms: payload.symptoms || ''
      };

      const response = await fetch(API_BASE_URL + TEXT_DIAGNOSIS_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(body)
      });

      const responseBody = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status, responseBody));
      }

      if (!responseBody || typeof responseBody !== 'object') {
        throw new Error('BE trả về dữ liệu chẩn đoán không hợp lệ.');
      }

      return responseBody;
},

async diagnoseByImage(payload) {
  const formData = new FormData();

  formData.append('plantType', payload.plantType || '');
  formData.append('symptoms', payload.symptoms || '');
  formData.append('image', payload.image);

  const response = await fetch(
    API_BASE_URL + IMAGE_DIAGNOSIS_ENDPOINT,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...authHeaders()
      },
      body: formData
    }
  );

  const responseBody = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(response.status, responseBody)
    );
  }

  if (!responseBody || typeof responseBody !== 'object') {
    throw new Error(
      'BE trả về dữ liệu chẩn đoán không hợp lệ.'
    );
  }

  return responseBody;
}
};
})();

/* =====================================================================
   Giao diện
   ===================================================================== */
(function () {
  let selectedImage = null;

  const $form = document.getElementById('diagForm');
  const $cropInput = document.getElementById('diagCrop');
  const $symptomInput = document.getElementById('diagSymptom');
  const $uploadDrop = document.getElementById('uploadDrop');
  const $imgInput = document.getElementById('diagImgInput');
  const $imgPreviewWrap = document.getElementById('imgPreviewWrap');
  const $imgPreview = document.getElementById('diagImgPreview');
  const $btnRemoveImg = document.getElementById('btnRemoveImg');
  const $validationMsg = document.getElementById('diagValidationMsg');
  const $btnAnalyze = document.getElementById('btnAnalyze');
  const $resultWrap = document.getElementById('diagResultWrap');

  // ---- Upload ảnh: giữ nguyên UI hiện tại; API diagnosis hiện không nhận image ----
  function setImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    selectedImage = file;
    const reader = new FileReader();
    reader.onload = function (e) {
      $imgPreview.src = e.target.result;
      $imgPreviewWrap.style.display = 'flex';
      $uploadDrop.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    selectedImage = null;
    $imgInput.value = '';
    $imgPreview.src = '';
    $imgPreviewWrap.style.display = 'none';
    $uploadDrop.style.display = 'block';
  }

  $uploadDrop.addEventListener('click', () => $imgInput.click());
  $imgInput.addEventListener('change', (e) => setImage(e.target.files[0]));
  $btnRemoveImg.addEventListener('click', clearImage);

  ['dragenter', 'dragover'].forEach((evt) => {
    $uploadDrop.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      $uploadDrop.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    $uploadDrop.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      $uploadDrop.classList.remove('dragover');
    });
  });

  $uploadDrop.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) setImage(file);
  });

  // ---- Tabs ----
  document.querySelectorAll('.ai-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ai-tab-btn').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      document.querySelectorAll('.ai-tabpane').forEach((p) => {
        p.style.display = 'none';
      });
      document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
    });
  });

  // ---- Kết quả ----
  function severityMeta(severity) {
    const value = String(severity || '').trim().toLowerCase();

    if (value === 'cao' || value === 'high') {
      return { color: 'var(--danger)', label: 'Cao' };
    }
    if (value === 'trung bình' || value === 'medium') {
      return { color: 'var(--sun)', label: 'Trung bình' };
    }
    if (value === 'thấp' || value === 'low') {
      return { color: 'var(--sky)', label: 'Thấp' };
    }

    return { color: 'var(--sky)', label: severity || 'Chưa xác định' };
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  function renderLoading() {
    $resultWrap.innerHTML = `
      <div class="empty-state">
        <div class="spinner-border text-success mb-2" role="status"></div>
        <div>AI đang phân tích triệu chứng, vui lòng đợi...</div>
      </div>`;
  }

  function renderError(msg) {
    $resultWrap.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle d-block mb-2 text-danger"></i>
        ${escapeHtml(msg)}
      </div>`;
  }

  function renderResult(plantType, result) {
    const sev = severityMeta(result.severity);

    $resultWrap.innerHTML = `
      <div class="result-card">
        <div class="rc-head">
          <div class="small text-white-50">
            KẾT QUẢ CHẨN ĐOÁN AI · ${escapeHtml(result.plantType || plantType || 'Không rõ loại cây')}
          </div>
          <h5 class="mb-0 mt-1">${escapeHtml(result.diseaseName || 'Chưa xác định bệnh')}</h5>
          <div class="mt-1">
            <span class="severity-dot" style="background:${sev.color}"></span>
            Mức độ: ${escapeHtml(sev.label)}
          </div>
        </div>

        <div class="rc-body">
          <div class="rc-section">
            <div class="rc-label">
              <i class="bi bi-clipboard2-check"></i>Kết quả
            </div>
            <div>${escapeHtml(result.result || 'Chưa có thông tin')}</div>
          </div>

          <div class="rc-section">
            <div class="rc-label">
              <i class="bi bi-question-circle"></i>Nguyên nhân
            </div>
            <div>${escapeHtml(result.cause || 'Chưa có thông tin')}</div>
          </div>

          <div class="rc-section">
            <div class="rc-label">
              <i class="bi bi-shield-check"></i>Phòng ngừa
            </div>
            <div>${escapeHtml(result.prevention || 'Chưa có thông tin')}</div>
          </div>

          <div class="rc-section">
            <div class="rc-label">
              <i class="bi bi-tools"></i>Điều trị / xử lý
            </div>
            <div>${escapeHtml(result.treatment || 'Chưa có thông tin')}</div>
          </div>

          <div class="result-disclaimer">
            <i class="bi bi-info-circle"></i>
            Đây là kết quả phân tích tự động, mang tính tham khảo. Với trường hợp nặng, nên liên hệ cán bộ nông nghiệp địa phương.
          </div>
        </div>
      </div>`;
  }

  // ---- Submit ----
  async function handleSubmit(e) {
    e.preventDefault();

    const plantType = $cropInput.value.trim();
    const symptoms = $symptomInput.value.trim();

    // Contract BE /api/diagnosis yêu cầu plantType + symptoms.
    if (!plantType || !symptoms) {
      $validationMsg.textContent = 'Vui lòng nhập loại cây và triệu chứng.';
      $validationMsg.classList.remove('d-none');
      return;
    }

    $validationMsg.classList.add('d-none');

    const oldLabel = $btnAnalyze.innerHTML;
    $btnAnalyze.disabled = true;
    $btnAnalyze.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Đang phân tích...';
    renderLoading();

    try {
     const result = selectedImage
  ? await AIService.diagnoseByImage({
      plantType,
      symptoms,
      image: selectedImage
    })
  : await AIService.diagnose({
      plantType,
      symptoms
    });
      renderResult(plantType, result);
    } catch (err) {
      console.error('AI Diagnosis API error:', err);
      renderError(err?.message || 'Không thể phân tích lúc này. Vui lòng thử lại sau.');
    } finally {
      $btnAnalyze.disabled = false;
      $btnAnalyze.innerHTML = oldLabel;
    }
  }

  $form.addEventListener('submit', handleSubmit);

  // ---- Theme toggle ----
  document.getElementById('btnToggleTheme').addEventListener('click', function () {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = !cur ? (prefersDark ? 'light' : 'dark') : (cur === 'dark' ? 'light' : 'dark');
    root.setAttribute('data-theme', next);
    document.getElementById('themeIcon').className = next === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  });

  // ---- Sidebar toggle (mobile) ----
  document.getElementById('btnToggleSidebar').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });
})();
