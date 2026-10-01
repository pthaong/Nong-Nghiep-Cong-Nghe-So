/* AgriSmart - AI Care UI (tư vấn chăm sóc cây trồng)
   Dùng API thật của BE2 qua aiCareService. Không có mock/fake data. */
(function () {
  const $ = (id) => document.getElementById(id);
  const form = $('careForm');
  const submitBtn = $('careSubmit');
  const submitLabel = $('careSubmitLabel');
  let loading = false;
  let lastPayload = null;

  const SECTIONS = [
    { key: 'watering',         icon: '💧', title: 'Tưới nước',                 cls: 'water' },
    { key: 'fertilizer',       icon: '🌱', title: 'Phân bón',                  cls: 'fert' },
    { key: 'diseasePrevention',icon: '🛡', title: 'Phòng bệnh',                cls: 'prevent' },
    { key: 'care',             icon: '🌿', title: 'Chăm sóc theo giai đoạn',   cls: 'stage' }
  ];

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text; // textContent: an toàn XSS
    return n;
  }

  function showValidation(fieldId, message) {
    const input = $(fieldId), msg = $(fieldId + 'Error');
    input.classList.toggle('is-invalid', !!message);
    msg.textContent = message || '';
  }

  function validate() {
    const plant = $('carePlant').value.trim();
    const stage = $('careStage').value.trim();
    const problem = $('careProblem').value.trim();
    showValidation('carePlant', plant ? '' : 'Vui lòng chọn cây trồng.');
    showValidation('careStage', stage ? '' : 'Vui lòng chọn giai đoạn sinh trưởng.');
    showValidation('careProblem', problem ? '' : 'Vui lòng nhập vấn đề cần tư vấn.');
    if (!plant || !stage || !problem) return null;
    return { plantType: plant, growthStage: stage, problem };
  }

  function setLoading(on) {
    loading = on;
    submitBtn.disabled = on;
    submitLabel.textContent = on ? 'AI đang tạo tư vấn...' : 'Nhận tư vấn';
    $('careSpinner').classList.toggle('d-none', !on);
    $('careLoading').classList.toggle('d-none', !on);
    form.setAttribute('aria-busy', String(on));
  }

  function friendlyError(err) {
    if (err.kind === 'timeout') return 'AI phản hồi quá lâu. Vui lòng thử lại.';
    if (err.kind === 'network') return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
    if (err.kind === 'http') {
      if (err.status === 400) return 'Thông tin gửi đi chưa hợp lệ. Vui lòng kiểm tra lại các trường.';
      if (err.status === 401 || err.status === 403) return 'Bạn chưa có quyền dùng chức năng này. Vui lòng đăng nhập lại.';
      if (err.status === 404) return 'Không tìm thấy dịch vụ tư vấn. Vui lòng thử lại sau.';
    }
    return 'Không thể nhận tư vấn lúc này. Vui lòng thử lại.';
  }

  function showError(message) {
    const box = $('careError');
    $('careErrorText').textContent = message;
    box.classList.remove('d-none');
  }
  function hideError() { $('careError').classList.add('d-none'); }

  function renderResult(data) {
    const wrap = $('careResult');
    wrap.replaceChildren();

    const head = el('div', 'card-x mb-3');
    const body = el('div', 'card-x-body');
    const title = el('h6', 'mb-2');
    title.appendChild(el('span', '', '🤖 Tư vấn từ AI'));
    body.appendChild(title);
    const meta = el('p', 'care-result-text mb-1');
    meta.textContent = `Cây trồng: ${data.plantType ?? ''} · Giai đoạn: ${data.growthStage ?? ''}`;
    body.appendChild(meta);
    if (typeof data.answer === 'string' && data.answer.trim()) {
      body.appendChild(el('p', 'care-result-text mt-2 mb-2', data.answer));
    }
    body.appendChild(el('p', 'care-note mb-0', 'Khuyến nghị chỉ mang tính tham khảo.'));
    head.appendChild(body);
    wrap.appendChild(head);

    const row = el('div', 'row g-3');
    SECTIONS.forEach((s) => {
      const value = data[s.key];
      const col = el('div', 'col-12 col-md-6');
      const box = el('div', `care-section ${s.cls}`);
      box.appendChild(el('h6', '', `${s.icon} ${s.title}`));
      box.appendChild(el('p', 'care-result-text',
        typeof value === 'string' && value.trim() ? value : 'Chưa có dữ liệu từ AI.'));
      col.appendChild(box);
      row.appendChild(col);
    });
    wrap.appendChild(row);
  }

  async function submit(payload) {
    if (loading) return; // chặn gửi nhiều request liên tiếp
    hideError();
    setLoading(true);
    try {
      const data = await window.aiCareService.getAdvice(payload);
      renderResult(data);
    } catch (err) {
      // Giữ nguyên kết quả cũ (nếu có), chỉ hiện thông báo lỗi
      showError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = validate();
    if (!payload) return;
    lastPayload = payload;
    submit(payload);
  });

  $('careRetry').addEventListener('click', () => { if (lastPayload) submit(lastPayload); });

  ['carePlant', 'careStage', 'careProblem'].forEach((id) =>
    $(id).addEventListener('input', () => showValidation(id, '')));

  if (localStorage.getItem('agrismart_theme') === 'dark') document.body.classList.add('dark');
})();
