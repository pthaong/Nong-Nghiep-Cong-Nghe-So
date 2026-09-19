// Danh mục 34 đơn vị hành chính cấp tỉnh, áp dụng từ 01/07/2025.
// Nguồn: Quyết định 19/2025/QĐ-TTg.
window.PROVINCES = [
  { code: '01', name: 'Thành phố Hà Nội' },
  { code: '04', name: 'Tỉnh Cao Bằng' },
  { code: '08', name: 'Tỉnh Tuyên Quang' },
  { code: '11', name: 'Tỉnh Điện Biên' },
  { code: '12', name: 'Tỉnh Lai Châu' },
  { code: '14', name: 'Tỉnh Sơn La' },
  { code: '15', name: 'Tỉnh Lào Cai' },
  { code: '19', name: 'Tỉnh Thái Nguyên' },
  { code: '20', name: 'Tỉnh Lạng Sơn' },
  { code: '22', name: 'Tỉnh Quảng Ninh' },
  { code: '24', name: 'Tỉnh Bắc Ninh' },
  { code: '25', name: 'Tỉnh Phú Thọ' },
  { code: '31', name: 'Thành phố Hải Phòng' },
  { code: '33', name: 'Tỉnh Hưng Yên' },
  { code: '37', name: 'Tỉnh Ninh Bình' },
  { code: '38', name: 'Tỉnh Thanh Hóa' },
  { code: '40', name: 'Tỉnh Nghệ An' },
  { code: '42', name: 'Tỉnh Hà Tĩnh' },
  { code: '44', name: 'Tỉnh Quảng Trị' },
  { code: '46', name: 'Thành phố Huế' },
  { code: '48', name: 'Thành phố Đà Nẵng' },
  { code: '51', name: 'Tỉnh Quảng Ngãi' },
  { code: '52', name: 'Tỉnh Gia Lai' },
  { code: '56', name: 'Tỉnh Khánh Hòa' },
  { code: '66', name: 'Tỉnh Đắk Lắk' },
  { code: '68', name: 'Tỉnh Lâm Đồng' },
  { code: '75', name: 'Tỉnh Đồng Nai' },
  { code: '79', name: 'Thành phố Hồ Chí Minh' },
  { code: '80', name: 'Tỉnh Tây Ninh' },
  { code: '82', name: 'Tỉnh Đồng Tháp' },
  { code: '86', name: 'Tỉnh Vĩnh Long' },
  { code: '91', name: 'Tỉnh An Giang' },
  { code: '92', name: 'Thành phố Cần Thơ' },
  { code: '96', name: 'Tỉnh Cà Mau' }
];

window.getProvinceByCode = function(code) {
  return window.PROVINCES.find(p => p.code === String(code)) || null;
};

window.getProvinceName = function(code) {
  const p = window.getProvinceByCode(code);
  return p ? p.name : (code || '');
};

window.getProvinceShortName = function(code) {
  const p = window.getProvinceByCode(code);
  if (!p) return code || '';
  return p.name.replace(/^Thành phố\s+/, '').replace(/^Tỉnh\s+/, '');
};

window.normalizeProvinceText = function(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim();
};

window.getProvinceByName = function(value) {
  const q = window.normalizeProvinceText(value);
  return window.PROVINCES.find(p =>
    window.normalizeProvinceText(p.name) === q ||
    window.normalizeProvinceText(window.getProvinceShortName(p.code)) === q
  ) || null;
};

window.setupProvinceAutocomplete = function(searchId, hiddenId, suggestionsId) {
  const input = document.getElementById(searchId);
  const hidden = document.getElementById(hiddenId);
  const box = document.getElementById(suggestionsId);
  if (!input || !hidden || !box) return;

  let activeIndex = -1;

  function renderSuggestions(query = '') {
    const q = window.normalizeProvinceText(query);
    const matches = window.PROVINCES.filter(p => {
      const full = window.normalizeProvinceText(p.name);
      const short = window.normalizeProvinceText(window.getProvinceShortName(p.code));
      return !q || full.includes(q) || short.includes(q);
    });

    activeIndex = -1;
    if (!matches.length) {
      box.innerHTML = '<div class="province-no-result">Không tìm thấy tỉnh/thành phù hợp</div>';
      box.classList.add('show');
      return;
    }

    box.innerHTML = matches.map((p, i) => `
      <button type="button" class="province-suggestion" data-code="${p.code}" data-index="${i}">
        <i class="bi bi-geo-alt"></i>
        <span>${p.name}</span>
        <small>${p.code}</small>
      </button>
    `).join('');
    box.classList.add('show');

    box.querySelectorAll('.province-suggestion').forEach(btn => {
      btn.addEventListener('mousedown', e => e.preventDefault());
      btn.addEventListener('click', () => selectProvince(btn.dataset.code));
    });
  }

  function selectProvince(code) {
    const province = window.getProvinceByCode(code);
    if (!province) return;
    hidden.value = province.code;
    input.value = province.name;
    box.classList.remove('show');
    input.dispatchEvent(new Event('change', {bubbles:true}));
  }

  function setValue(code) {
    const province = window.getProvinceByCode(code);
    hidden.value = province ? province.code : '';
    input.value = province ? province.name : '';
  }

  input.addEventListener('focus', () => renderSuggestions(input.value));
  input.addEventListener('input', () => {
    hidden.value = '';
    renderSuggestions(input.value);
  });
  input.addEventListener('keydown', e => {
    const items = [...box.querySelectorAll('.province-suggestion')];
    if (!box.classList.contains('show') || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectProvince(items[activeIndex].dataset.code);
      return;
    } else if (e.key === 'Escape') {
      box.classList.remove('show');
      return;
    } else return;
    items.forEach((item, i) => item.classList.toggle('active', i === activeIndex));
    if (items[activeIndex]) items[activeIndex].scrollIntoView({block:'nearest'});
  });
  input.addEventListener('blur', () => {
    setTimeout(() => {
      box.classList.remove('show');
      const province = window.getProvinceByName(input.value);
      if (province) setValue(province.code);
      else if (!input.value.trim()) hidden.value = '';
    }, 120);
  });

  input._setProvinceValue = setValue;
  input._renderProvinceSuggestions = renderSuggestions;
};

window.setProvinceAutocompleteValue = function(searchId, code) {
  const input = document.getElementById(searchId);
  if (input && typeof input._setProvinceValue === 'function') input._setProvinceValue(code);
};

window.initProvinceAutocompletes = function() {
  setupProvinceAutocomplete('accRegionSearch', 'accRegionInput', 'accProvinceSuggestions');
  setupProvinceAutocomplete('newUserRegionSearch', 'newUserRegion', 'newUserProvinceSuggestions');
};
