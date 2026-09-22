/* =====================================================================
   CropService — lớp trung gian thao tác dữ liệu Ruộng / Cây trồng.
   ---------------------------------------------------------------------
   ĐANG CHẠY Ở CHẾ ĐỘ MOCK (USE_MOCK_DATA = true): dữ liệu lưu tạm ở
   localStorage để demo giao diện mà không cần Backend.

   KHI BACKEND (JAVA) SẴN SÀNG:
     1) Đổi USE_MOCK_DATA = false
     2) Sửa API_BASE_URL cho đúng địa chỉ Backend thực tế
     3) Nếu API cần xác thực, thêm header Authorization trong authHeaders()
   -> Toàn bộ phần giao diện (render, modal, sự kiện) KHÔNG cần sửa gì
      thêm, vì chỉ gọi qua các hàm CropService.* bên dưới.

   Hợp đồng dữ liệu (Backend cần trả về đúng cấu trúc này):
     Field {
       id: string, name: string, crop: string, area: number,
       plantDate: "YYYY-MM-DD", stage: string, seasonId: string|null
     }
     Season { id: string, name: string }

   Endpoint gợi ý:
     GET    /api/fields                -> getAllFields()
     GET    /api/seasons               -> getAllSeasons()
     POST   /api/fields                -> createField(data)
     PUT    /api/fields/{id}           -> updateField(id, data)
     DELETE /api/fields/{id}           -> deleteField(id)
   ===================================================================== */
const CropService = (function () {
  const USE_MOCK_DATA = true;                      // TODO: đổi false khi có Backend thật
  const API_BASE_URL = 'https://api.agrismart.vn';  // TODO: đổi thành địa chỉ Backend thật

  const FIELDS_KEY = 'agrismart_fields_v1';
  const SEASONS_KEY = 'agrismart_seasons_v1';

  const MOCK_FIELDS = [
    {id:'f1', name:'Ruộng số 1 - Ấp Bình An', crop:'Lúa OM5451', plantDate:'2026-01-10', area:1.2, stage:'Đẻ nhánh', seasonId:'s1'},
    {id:'f2', name:'Vườn cà chua sau nhà', crop:'Cà chua', plantDate:'2026-08-15', area:0.3, stage:'Ra hoa', seasonId:'s2'},
    {id:'f3', name:'Ruộng số 2 - Kênh 3', crop:'Lúa OM18', plantDate:'2026-07-01', area:0.8, stage:'Mạ non / cây con', seasonId:null}
  ];
  const MOCK_SEASONS = [
    {id:'s1', name:'Vụ Đông Xuân 2026'},
    {id:'s2', name:'Vụ Hè Thu 2026'}
  ];

  // Header xác thực dùng chung cho các request thật (gắn token nếu có)
  function authHeaders(){
    const token = localStorage.getItem('agrismart_token'); // TODO: lấy token đăng nhập thật
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    };
  }

  async function apiFetch(path, options){
    const res = await fetch(API_BASE_URL + path, Object.assign({ headers: authHeaders() }, options));
    if(!res.ok){
      const msg = await res.text().catch(()=> '');
      throw new Error('API lỗi ' + res.status + (msg ? (': ' + msg) : ''));
    }
    if(res.status === 204) return null; // No Content (thường gặp ở DELETE)
    return res.json();
  }

  // ---- mock storage helpers ----
  function loadMock(key, seed){
    try{
      const raw = localStorage.getItem(key);
      if(raw) return JSON.parse(raw);
      localStorage.setItem(key, JSON.stringify(seed));
      return JSON.parse(JSON.stringify(seed));
    }catch(e){ console.error('Lỗi đọc dữ liệu mock:', e); return JSON.parse(JSON.stringify(seed)); }
  }
  function saveMock(key, list){
    try{ localStorage.setItem(key, JSON.stringify(list)); }
    catch(e){ console.error('Lỗi lưu dữ liệu mock:', e); }
  }
  function genId(){ return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

  return {
    async getAllFields(){
      if(!USE_MOCK_DATA) return apiFetch('/api/fields', { method:'GET' });
      await delay(200);
      return loadMock(FIELDS_KEY, MOCK_FIELDS);
    },
    async getAllSeasons(){
      if(!USE_MOCK_DATA) return apiFetch('/api/seasons', { method:'GET' });
      await delay(150);
      return loadMock(SEASONS_KEY, MOCK_SEASONS);
    },
    async createField(data){
      if(!USE_MOCK_DATA) return apiFetch('/api/fields', { method:'POST', body: JSON.stringify(data) });
      await delay(150);
      const list = loadMock(FIELDS_KEY, MOCK_FIELDS);
      const newField = Object.assign({ id: genId() }, data);
      list.unshift(newField);
      saveMock(FIELDS_KEY, list);
      return newField;
    },
    async updateField(id, data){
      if(!USE_MOCK_DATA) return apiFetch('/api/fields/' + id, { method:'PUT', body: JSON.stringify(data) });
      await delay(150);
      const list = loadMock(FIELDS_KEY, MOCK_FIELDS);
      const idx = list.findIndex(f=>f.id===id);
      if(idx===-1) throw new Error('Không tìm thấy ruộng để cập nhật');
      list[idx] = Object.assign({}, list[idx], data, { id });
      saveMock(FIELDS_KEY, list);
      return list[idx];
    },
    async deleteField(id){
      if(!USE_MOCK_DATA) { await apiFetch('/api/fields/' + id, { method:'DELETE' }); return true; }
      await delay(150);
      let list = loadMock(FIELDS_KEY, MOCK_FIELDS);
      list = list.filter(f=>f.id!==id);
      saveMock(FIELDS_KEY, list);
      return true;
    }
  };
})();

/* =====================================================================
   Giao diện — gọi dữ liệu qua CropService (không thao tác trực tiếp mảng)
   ===================================================================== */
let fields = [];
let seasons = [];

function stageProgress(stage){
  const order = ['Mạ non / cây con','Đẻ nhánh','Ra hoa','Đậu quả / làm hạt','Thu hoạch'];
  const idx = order.indexOf(stage);
  return idx<0 ? 20 : Math.round(((idx+1)/order.length)*100);
}
function emptyHTML(msg){ return `<div class="empty-state w-100"><i class="bi bi-inbox d-block mb-2"></i>${msg}</div>`; }
function loadingHTML(){ return `<div class="empty-state w-100"><div class="spinner-border text-success mb-2"></div><div>Đang tải danh sách cây trồng...</div></div>`; }
function errorHTML(msg){ return `<div class="empty-state w-100"><i class="bi bi-exclamation-triangle d-block mb-2 text-danger"></i>${msg}</div>`; }

function fieldCardHTML(f){
  const season = seasons.find(s=>s.id===f.seasonId);
  return `<div class="col-md-6">
    <div class="field-card">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-semibold">${f.name}</div>
          <div class="small text-muted2">${f.crop} · ${f.area} ha</div>
        </div>
        <span class="chip chip-ok">${f.stage}</span>
      </div>
      <div class="stage-bar"><span style="width:${stageProgress(f.stage)}%"></span></div>
      <div class="small text-muted2 d-flex justify-content-between mt-1">
        <span>Gieo trồng: ${f.plantDate}</span>
        ${season? `<span>${season.name}</span>` : ''}
      </div>
      <div class="d-flex gap-2 mt-2">
        <button class="btn btn-sm btn-outline-forest" onclick="editField('${f.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteField('${f.id}')"><i class="bi bi-trash"></i></button>
      </div>
    </div>
  </div>`;
}

function paintCrops(){
  document.getElementById('cropsList').innerHTML = fields.map(f=>fieldCardHTML(f)).join('') || emptyHTML('Chưa có ruộng / cây trồng nào. Nhấn "Thêm ruộng / cây trồng" để bắt đầu.');
}

/** Tải lại dữ liệu từ CropService (mock hoặc API thật tuỳ USE_MOCK_DATA) */
async function loadCrops(){
  document.getElementById('cropsList').innerHTML = loadingHTML();
  try{
    [fields, seasons] = await Promise.all([CropService.getAllFields(), CropService.getAllSeasons()]);
    paintCrops();
  }catch(err){
    console.error(err);
    document.getElementById('cropsList').innerHTML = errorHTML('Không tải được danh sách cây trồng. Vui lòng thử lại sau.');
  }
}

function populateSeasonSelect(){
  const sel = document.getElementById('fieldSeason');
  sel.innerHTML = '<option value="">— Không thuộc mùa vụ —</option>' + seasons.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}
function openFieldModal(id){
  populateSeasonSelect();
  document.getElementById('fieldModalTitle').textContent = id ? 'Chỉnh sửa ruộng / cây trồng' : 'Thêm ruộng / cây trồng';
  document.getElementById('fieldId').value = id||'';
  if(id){
    const f = fields.find(x=>x.id===id);
    document.getElementById('fieldName').value=f.name;
    document.getElementById('fieldCrop').value=f.crop;
    document.getElementById('fieldArea').value=f.area;
    document.getElementById('fieldDate').value=f.plantDate;
    document.getElementById('fieldStage').value=f.stage;
    document.getElementById('fieldSeason').value=f.seasonId||'';
  } else {
    document.getElementById('fieldName').value='';
    document.getElementById('fieldArea').value='';
    document.getElementById('fieldDate').value='';
  }
}
function editField(id){ openFieldModal(id); new bootstrap.Modal(document.getElementById('fieldModal')).show(); }

async function deleteField(id){
  if(!confirm('Xoá ruộng này khỏi danh sách quản lý?')) return;
  try{
    await CropService.deleteField(id);
    await loadCrops();
  }catch(err){
    console.error(err);
    alert('Không xoá được, vui lòng thử lại.');
  }
}

async function saveField(e){
  e.preventDefault();
  const id = document.getElementById('fieldId').value;
  const data = {
    name: document.getElementById('fieldName').value,
    crop: document.getElementById('fieldCrop').value,
    area: parseFloat(document.getElementById('fieldArea').value),
    plantDate: document.getElementById('fieldDate').value,
    stage: document.getElementById('fieldStage').value,
    seasonId: document.getElementById('fieldSeason').value || null
  };
  const $btn = e.target.querySelector('button[type="submit"]');
  const oldLabel = $btn.innerHTML;
  $btn.disabled = true;
  $btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Đang lưu...';
  try{
    if(id) await CropService.updateField(id, data);
    else await CropService.createField(data);
    bootstrap.Modal.getInstance(document.getElementById('fieldModal')).hide();
    await loadCrops();
  }catch(err){
    console.error(err);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }finally{
    $btn.disabled = false;
    $btn.innerHTML = oldLabel;
  }
  return false;
}

/* ---------------- Theme toggle (y hệt bản gốc) ---------------- */
function toggleTheme(){
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let next;
  if(!cur) next = prefersDark ? 'light' : 'dark';
  else next = cur==='dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  document.getElementById('themeIcon').className = next==='dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
}

loadCrops();
