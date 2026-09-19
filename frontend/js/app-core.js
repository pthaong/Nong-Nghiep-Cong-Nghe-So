/* ==================================================================
   AGRISMART — mock data layer (localStorage) + app logic
   ================================================================== */
const STORAGE_KEY = 'agrismart_v1';
let DB = null;
let loginRole = 'user';
let currentPage = 'home';
let currentAITab = 'diag';
let weatherRequestId = 0;
let aiChatStarted = false;

function getLegacyProvinceCode(name){
  const legacy = {
    'Hà Nội':'01', 'Cần Thơ':'92', 'An Giang':'91', 'Đồng Tháp':'82',
    'Lâm Đồng':'68', 'Đắk Lắk':'66', 'Đà Nẵng':'48', 'Quảng Nam':'48',
    'Quảng Ngãi':'51', 'Kon Tum':'51', 'Bình Định':'52', 'Gia Lai':'52',
    'Khánh Hòa':'56', 'Ninh Thuận':'56', 'Phú Yên':'66',
    'Đắk Nông':'68', 'Bình Thuận':'68', 'Đồng Nai':'75',
    'Bình Phước':'75', 'Tây Ninh':'80', 'Long An':'80',
    'Tiền Giang':'82', 'Bến Tre':'86', 'Trà Vinh':'86',
    'Vĩnh Long':'86', 'Kiên Giang':'91', 'Hậu Giang':'92',
    'Sóc Trăng':'92', 'Bạc Liêu':'96', 'Cà Mau':'96',
    'Quảng Bình':'44', 'Hà Nam':'37', 'Nam Định':'37',
    'Bắc Kạn':'19', 'Yên Bái':'15', 'Quảng Nam':'48'
  };
  return legacy[name] || '';
}

function normalizeUserRegions(){
  if (!DB || !Array.isArray(DB.users)) return;
  DB.users.forEach(u => {
    if (!u.regionCode && u.region) u.regionCode = getLegacyProvinceCode(u.region);
    if (u.regionCode) delete u.region;
  });
}

function initProvinceUI(){
  if (!window.PROVINCES) return;
  initProvinceAutocompletes();
  const count = document.getElementById('provinceCoverageCount');
  if (count) count.textContent = window.PROVINCES.length;
  normalizeUserRegions();
  saveDB();
}

function seedData(){
  return {
    users: [
      {id:'u1', name:'Nguyễn Văn An', email:'nongdan@agrismart.vn', pass:'123456', role:'user', phone:'0901 234 567', regionCode:'92', status:'active'},
      {id:'u2', name:'Trần Thị Bích', email:'nongdan2@agrismart.vn', pass:'123456', role:'user', phone:'0912 345 678', regionCode:'91', status:'active'},
      {id:'admin1', name:'Quản trị hệ thống', email:'admin@agrismart.vn', pass:'admin123', role:'admin', phone:'0987 000 111', regionCode:'01', status:'active'}
    ],
    seasons: [
      {id:'s1', name:'Vụ Đông Xuân 2026', crop:'Lúa OM5451', start:'2026-01-10', end:'2026-04-20', status:'Đang canh tác', ownerId:'u1'},
      {id:'s2', name:'Vụ Hè Thu 2026', crop:'Cà chua', start:'2026-08-01', end:'2026-10-30', status:'Đang canh tác', ownerId:'u1'},
      {id:'s3', name:'Vụ Thu Đông 2026', crop:'Lúa OM18', start:'2026-09-01', end:'2026-12-15', status:'Lên kế hoạch', ownerId:'u2'}
    ],
    fields: [
      {id:'f1', name:'Ruộng số 1 - Ấp Bình An', crop:'Lúa OM5451', plantDate:'2026-01-10', area:1.2, stage:'Đẻ nhánh', seasonId:'s1', ownerId:'u1'},
      {id:'f2', name:'Vườn cà chua sau nhà', crop:'Cà chua', plantDate:'2026-08-15', area:0.3, stage:'Ra hoa', seasonId:'s2', ownerId:'u1'},
      {id:'f3', name:'Ruộng số 2 - Kênh 3', crop:'Lúa OM18', plantDate:'2026-07-01', area:0.8, stage:'Mạ non / cây con', seasonId:null, ownerId:'u1'},
      {id:'f4', name:'Ruộng nhà bà Bích', crop:'Lúa OM18', plantDate:'2026-09-01', area:1.6, stage:'Mạ non / cây con', seasonId:'s3', ownerId:'u2'}
    ],
    logs: [
      {id:'l1', fieldId:'f1', ownerId:'u1', date:'2026-09-14', type:'Tưới nước', note:'Tưới ngập 5cm, ruộng khô ráo tốt.', status:'Bình thường'},
      {id:'l2', fieldId:'f2', ownerId:'u1', date:'2026-09-13', type:'Phun thuốc', note:'Phun phòng nấm sương mai sau đợt mưa vừa qua.', status:'Cần theo dõi'},
      {id:'l3', fieldId:'f1', ownerId:'u1', date:'2026-09-10', type:'Bón phân', note:'Bón thúc đợt 2 - NPK 20-20-15, 25kg/1000m².', status:'Bình thường'},
      {id:'l4', fieldId:'f3', ownerId:'u1', date:'2026-09-08', type:'Làm cỏ', note:'Làm cỏ quanh bờ, dọn kênh mương thoát nước.', status:'Bình thường'},
      {id:'l5', fieldId:'f4', ownerId:'u2', date:'2026-09-12', type:'Tưới nước', note:'Tưới bổ sung giai đoạn mạ non.', status:'Bình thường'}
    ],
    prices: [
      {crop:'Lúa OM5451', price:7800, unit:'đ/kg', change:2.3},
      {crop:'Cà chua', price:12500, unit:'đ/kg', change:-4.1},
      {crop:'Xoài cát Hòa Lộc', price:32000, unit:'đ/kg', change:1.0},
      {crop:'Rau muống', price:9000, unit:'đ/kg', change:0},
      {crop:'Thanh long', price:18500, unit:'đ/kg', change:-2.7},
      {crop:'Cà phê nhân', price:112000, unit:'đ/kg', change:3.5}
    ],
    weather: {
      regionCode:'92',
      current:{temp:33, feels:36, humidity:78, rain:20, wind:14, condition:'Nắng gián đoạn, có mây'},
      forecast:[
        {d:'Hôm nay', icon:'bi-cloud-sun', hi:33, lo:26, rain:20},
        {d:'Thứ 5', icon:'bi-cloud-rain-heavy', hi:29, lo:24, rain:85},
        {d:'Thứ 6', icon:'bi-cloud-rain-heavy', hi:28, lo:23, rain:90},
        {d:'Thứ 7', icon:'bi-cloud-drizzle', hi:30, lo:24, rain:55},
        {d:'CN', icon:'bi-cloud-sun', hi:32, lo:25, rain:25},
        {d:'Thứ 2', icon:'bi-sun', hi:34, lo:26, rain:10},
        {d:'Thứ 3', icon:'bi-sun', hi:35, lo:27, rain:5}
      ],
      alerts:[
        {id:'a1', level:'high', title:'Cảnh báo mưa lớn 2 ngày tới', desc:'Dự báo mưa to đến rất to trong 2 ngày tới, lượng mưa 80–120mm, nguy cơ ngập úng ruộng lúa và rửa trôi phân bón.'},
        {id:'a2', level:'medium', title:'Nắng nóng cục bộ đầu tuần sau', desc:'Nhiệt độ có thể vượt 35°C vào buổi trưa các ngày cuối tuần, ảnh hưởng đến cây cà chua đang ra hoa.'},
        {id:'a3', level:'low', title:'Độ ẩm không khí cao kéo dài', desc:'Độ ẩm duy trì trên 80% nhiều ngày liên tiếp, tạo điều kiện thuận lợi cho nấm bệnh phát triển.'}
      ]
    },
    aiRecs:[
      {title:'Nguy cơ nấm bệnh cao trên cà chua', tag:'danger', desc:'Độ ẩm cao kèm mưa liên tục khiến vườn cà chua ở giai đoạn ra hoa có nguy cơ nhiễm sương mai. Nên phun phòng trong 2 ngày tới.', date:'Hôm nay'},
      {title:'Nên hoãn bón phân do mưa lớn sắp tới', tag:'warning', desc:'Mưa to 80–120mm dự báo trong 2 ngày tới có thể rửa trôi phân bón trên ruộng lúa OM5451. Khuyến nghị hoãn bón thúc đến khi tạnh ráo.', date:'Hôm nay'},
      {title:'Giai đoạn đẻ nhánh cần giữ mực nước 3–5cm', tag:'info', desc:'Ruộng số 1 đang ở giai đoạn đẻ nhánh, nên duy trì mực nước 3–5cm để cây đẻ nhánh khoẻ và hạn chế cỏ dại.', date:'Hôm qua'}
    ],
    aiHistory:[
      {id:'h1', ownerId:'u1', date:'2026-09-14', kind:'Chẩn đoán bệnh', question:'Lá cà chua xuất hiện đốm nâu, viền vàng, lan nhanh sau mưa', result:'Bệnh mốc sương (sương mai) — mức độ trung bình'},
      {id:'h2', ownerId:'u1', date:'2026-09-11', kind:'Tư vấn chăm sóc', question:'Lúa OM5451 giai đoạn đẻ nhánh, thời tiết mưa nhiều', result:'Giữ mực nước 3–5cm, hoãn bón đạm đến khi tạnh ráo'},
      {id:'h3', ownerId:'u2', date:'2026-09-09', kind:'Chẩn đoán bệnh', question:'Mạ non có vệt vàng dọc gân lá', result:'Nghi vàng lá gân xanh — cần theo dõi thêm côn trùng môi giới'}
    ]
  };
}

function loadDB(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ DB = JSON.parse(raw); }
    else { DB = seedData(); saveDB(); }
  }catch(e){ console.error('load error', e); DB = seedData(); }
}
function saveDB(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }catch(e){ console.error('save error', e); }
}
function uid(prefix){ return prefix + Math.random().toString(36).slice(2,9); }

/* ---------------- session ---------------- */
let session = null; // {userId, role}

// Small bridge for modular frontend services. The application keeps state in this file
// for backwards compatibility, while feature modules access it through these methods.
window.getAgriSmartDB = () => DB;
window.saveAgriSmartDB = () => saveDB();
window.createAgriSmartId = (prefix) => uid(prefix);
window.setAgriSmartSession = (value) => { session = value; };
window.getAgriSmartSession = () => session;

function selectLoginRole(r){
  loginRole = r;
  document.querySelectorAll('.role-toggle button').forEach(b=>b.classList.toggle('active', b.dataset.role===r));
  document.getElementById('demoHintText').textContent = r==='admin' ? 'admin@agrismart.vn / admin123' : 'nongdan@agrismart.vn / 123456';
}

function doLogin(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const user = DB.users.find(u=>u.email.toLowerCase()===email && u.pass===pass);
  if(!user){ alert('Sai email hoặc mật khẩu. Hãy dùng tài khoản demo được gợi ý bên dưới.'); return false; }
  if(loginRole==='admin' && user.role!=='admin'){ alert('Tài khoản này không có quyền quản trị viên.'); return false; }
  session = {userId:user.id, role:user.role};
  try{ localStorage.setItem('agrismart_session', JSON.stringify(session)); }catch(e){}
  enterApp();
  return false;
}

function logout(){
  session = null;
  try{ localStorage.removeItem('agrismart_session'); }catch(e){}
  document.getElementById('app').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
}

function currentUser(){ return session ? DB.users.find(u=>u.id===session.userId) : null; }

function forceLogoutLockedUser(){
  session = null;
  try{ localStorage.removeItem('agrismart_session'); }catch(e){}
  document.getElementById('app').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  const alert = document.getElementById('loginAlert');
  if(alert){
    alert.className = 'auth-alert show danger';
    alert.textContent = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.';
  }
  if(window.showAuthView) window.showAuthView('login');
}

function ensureCurrentUserActive(){
  const u = currentUser();
  if(u && u.status === 'locked'){ forceLogoutLockedUser(); return false; }
  return Boolean(u);
}

function enterApp(){
  const u = currentUser();
  if(!u) return;
  if(u.status === 'locked'){ forceLogoutLockedUser(); return; }
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('navUser').style.display = u.role==='admin' ? 'none':'block';
  document.getElementById('navAdmin').style.display = u.role==='admin' ? 'block':'none';
  document.getElementById('miniAvatar').textContent = u.name.charAt(0).toUpperCase();
  document.getElementById('miniName').textContent = u.name;
  document.getElementById('miniRegion').textContent = getProvinceShortName(u.regionCode || u.region);
  document.getElementById('topRoleBadge').textContent = u.role==='admin' ? 'Quản trị viên' : 'Nông dân';
  document.getElementById('topRoleBadge').className = 'badge-role ' + (u.role==='admin'?'admin':'user');
  goPage(u.role==='admin' ? 'admin-overview' : 'home');
  renderAllPagesData();
}

/* ---------------- navigation ---------------- */
const pageTitles = {
  'home':['Trang chủ','Tổng quan canh tác hôm nay'],
  'crops':['Cây trồng','Quản lý ruộng và cây trồng của bạn'],
  'seasons':['Mùa vụ','Kế hoạch và theo dõi mùa vụ'],
  'log':['Nhật ký canh tác','Ghi lại công việc chăm sóc hằng ngày'],
  'weather':['Thời tiết','Dự báo chi tiết theo khu vực canh tác'],
  'ai':['AI chẩn đoán & tư vấn','Hỏi AI về bệnh cây và cách chăm sóc'],
  'prices':['Giá nông sản','Tham khảo giá thị trường mới nhất'],
  'account':['Tài khoản','Thông tin cá nhân và khu vực canh tác'],
  'admin-overview':['Tổng quan quản trị','Số liệu toàn hệ thống AgriSmart'],
  'admin-users':['Quản lý người dùng','Danh sách tài khoản trong hệ thống'],
  'admin-fields':['Ruộng & mùa vụ','Dữ liệu canh tác của toàn bộ nông dân'],
  'admin-prices':['Giá nông sản','Cập nhật giá hiển thị cho nông dân'],
  'admin-alerts':['Cảnh báo thời tiết','Cấu hình cảnh báo gửi đến nông dân'],
  'admin-ai':['Lịch sử AI hệ thống','Toàn bộ tương tác AI của người dùng']
};

function goPage(p){
  currentPage = p;
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  const el = document.getElementById('page-'+p);
  if(el) el.classList.add('active');
  document.querySelectorAll('.nav-link-app').forEach(el=>el.classList.toggle('active', el.dataset.page===p));
  const t = pageTitles[p] || ['',''];
  document.getElementById('pageTitle').textContent = t[0];
  document.getElementById('pageSub').textContent = t[1];
  document.getElementById('sidebar').classList.remove('open');
  renderPage(p);
}

async function refreshWeather(force=false){
  const u=currentUser();
  if(!u || !window.AgriWeather) return;
  const code=u.regionCode || getLegacyProvinceCode(u.region);
  if(!code) return;
  const requestId=++weatherRequestId;
  const btn=document.getElementById('weatherRefreshBtn');
  if(btn){btn.disabled=true; btn.innerHTML='<span class="spinner-border spinner-border-sm"></span>'}
  try{
    const data=await window.AgriWeather.load(code,force);
    if(requestId!==weatherRequestId) return;
    DB.weather=data;
    saveDB();
    if(currentPage==='weather') renderWeather();
    if(currentPage==='home') renderHome();
  }catch(e){
    console.warn(e);
  }finally{
    if(btn){btn.disabled=false; btn.innerHTML='<i class="bi bi-arrow-clockwise"></i>'}
  }
}

function renderPage(p){
  if(p==='home'){ renderHome(); refreshWeather(false); }
  else if(p==='crops') renderCrops();
  else if(p==='seasons') renderSeasons();
  else if(p==='log') renderLogs();
  else if(p==='weather'){ renderWeather(); refreshWeather(false); }
  else if(p==='ai') renderAI();
  else if(p==='prices') renderPrices();
  else if(p==='account') renderAccount();
  else if(p==='admin-overview') renderAdminOverview();
  else if(p==='admin-users') renderAdminUsers();
  else if(p==='admin-fields') renderAdminFields();
  else if(p==='admin-prices') renderAdminPrices();
  else if(p==='admin-alerts') renderAdminAlerts();
  else if(p==='admin-ai') renderAdminAI();
}
function renderAllPagesData(){ renderPage(currentPage); }

function myFields(){ const u=currentUser(); return DB.fields.filter(f=>f.ownerId===u.id); }
function mySeasons(){ const u=currentUser(); return DB.seasons.filter(s=>s.ownerId===u.id); }
function myLogs(){ const u=currentUser(); return DB.logs.filter(l=>l.ownerId===u.id); }

/* ---------------- HOME ---------------- */
function chipForTag(tag){
  if(tag==='danger') return '<span class="chip chip-danger"><i class="bi bi-exclamation-octagon"></i>Nguy cơ cao</span>';
  if(tag==='warning') return '<span class="chip chip-warn"><i class="bi bi-exclamation-triangle"></i>Cần lưu ý</span>';
  return '<span class="chip chip-info"><i class="bi bi-info-circle"></i>Thông tin</span>';
}
function alertIcon(level){
  if(level==='high') return 'bi-exclamation-octagon-fill';
  if(level==='medium') return 'bi-exclamation-triangle-fill';
  return 'bi-info-circle-fill';
}
function renderHome(){
  const w = DB.weather;
  document.getElementById('homeRegion').textContent = getProvinceShortName(w.regionCode || w.region);
  document.getElementById('homeTemp').textContent = w.current.temp+'°C';
  document.getElementById('homeCondition').textContent = w.current.condition;
  document.getElementById('homeHumidity').textContent = w.current.humidity+'%';
  document.getElementById('homeRain').textContent = w.current.rain+'%';
  document.getElementById('homeWind').textContent = w.current.wind+' km/h';

  document.getElementById('homeAlerts').innerHTML = w.alerts.map(a=>`
    <div class="alert-x level-${a.level} mb-2">
      <i class="bi ${alertIcon(a.level)}"></i>
      <div><div class="fw-semibold" style="font-size:.88rem;">${a.title}</div><div class="small text-muted2">${a.desc}</div></div>
    </div>`).join('');

  const fields = myFields();
  document.getElementById('statFields').textContent = fields.length;
  document.getElementById('statArea').textContent = fields.reduce((s,f)=>s+Number(f.area),0).toFixed(1);
  const thisMonth = myLogs().filter(l=>l.date && l.date.startsWith('2026-09'));
  document.getElementById('statLogs').textContent = thisMonth.length;
  document.getElementById('statAI').textContent = DB.aiHistory.filter(h=>h.ownerId===currentUser().id).length;

  document.getElementById('homeFields').innerHTML = fields.slice(0,4).map(f=>fieldCardHTML(f)).join('') || emptyHTML('Chưa có ruộng nào được thêm.');
  document.getElementById('homePrices').innerHTML = DB.prices.slice(0,5).map(p=>priceRowHTML(p)).join('');
  document.getElementById('homeAI').innerHTML = DB.aiRecs.map(r=>`
    <div class="col-md-4">
      <div class="h-100 p-3" style="border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface-2);">
        <div class="mb-2">${chipForTag(r.tag)}</div>
        <div class="fw-semibold mb-1" style="font-size:.9rem;">${r.title}</div>
        <div class="small text-muted2">${r.desc}</div>
        <div class="small text-muted2 mt-2"><i class="bi bi-clock"></i> ${r.date}</div>
      </div>
    </div>`).join('');
}
function emptyHTML(msg){ return `<div class="empty-state w-100"><i class="bi bi-inbox d-block mb-2"></i>${msg}</div>`; }
function priceRowHTML(p){
  const up = p.change>0, flat = p.change===0;
  const cls = flat? '' : (up?'up':'down');
  const icon = flat? 'bi-dash' : (up?'bi-arrow-up-short':'bi-arrow-down-short');
  return `<div class="price-row"><div><div class="fw-semibold" style="font-size:.87rem;">${p.crop}</div><div class="small text-muted2">${p.unit}</div></div>
    <div class="text-end"><div class="fw-semibold">${p.price.toLocaleString('vi-VN')}đ</div><div class="small price-change ${cls}"><i class="bi ${icon}"></i>${Math.abs(p.change)}%</div></div></div>`;
}

/* ---------------- CROPS (Cây trồng) ---------------- */
function stageProgress(stage){
  const order = ['Mạ non / cây con','Đẻ nhánh','Ra hoa','Đậu quả / làm hạt','Thu hoạch'];
  const idx = order.indexOf(stage);
  return idx<0 ? 20 : Math.round(((idx+1)/order.length)*100);
}
function fieldCardHTML(f){
  const season = DB.seasons.find(s=>s.id===f.seasonId);
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
function renderCrops(){
  const list = myFields();
  document.getElementById('cropsList').innerHTML = list.map(f=>fieldCardHTML(f)).join('') || emptyHTML('Chưa có ruộng / cây trồng nào. Nhấn "Thêm ruộng / cây trồng" để bắt đầu.');
}
function populateSeasonSelect(){
  const sel = document.getElementById('fieldSeason');
  sel.innerHTML = '<option value="">— Không thuộc mùa vụ —</option>' + mySeasons().map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}
function openFieldModal(id){
  populateSeasonSelect();
  document.getElementById('fieldId').value = id||'';
  if(id){
    const f = DB.fields.find(x=>x.id===id);
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
function deleteField(id){
  if(!confirm('Xoá ruộng này khỏi danh sách quản lý?')) return;
  DB.fields = DB.fields.filter(f=>f.id!==id);
  saveDB(); renderCrops(); renderHome();
}
function saveField(e){
  e.preventDefault();
  const id = document.getElementById('fieldId').value;
  const data = {
    name: document.getElementById('fieldName').value,
    crop: document.getElementById('fieldCrop').value,
    area: parseFloat(document.getElementById('fieldArea').value),
    plantDate: document.getElementById('fieldDate').value,
    stage: document.getElementById('fieldStage').value,
    seasonId: document.getElementById('fieldSeason').value || null,
    ownerId: currentUser().id
  };
  if(id){ Object.assign(DB.fields.find(f=>f.id===id), data); }
  else { DB.fields.push(Object.assign({id:uid('f')}, data)); }
  saveDB();
  bootstrap.Modal.getInstance(document.getElementById('fieldModal')).hide();
  renderCrops(); renderHome();
  return false;
}

/* ---------------- SEASONS (Mùa vụ) ---------------- */
function openSeasonModal(){
  document.getElementById('seasonName').value='';
  document.getElementById('seasonCrop').value='';
  document.getElementById('seasonStart').value='';
  document.getElementById('seasonEnd').value='';
}
function saveSeason(e){
  e.preventDefault();
  const s = {
    id: uid('s'),
    name: document.getElementById('seasonName').value,
    crop: document.getElementById('seasonCrop').value,
    start: document.getElementById('seasonStart').value,
    end: document.getElementById('seasonEnd').value,
    status:'Lên kế hoạch',
    ownerId: currentUser().id
  };
  DB.seasons.push(s); saveDB();
  bootstrap.Modal.getInstance(document.getElementById('seasonModal')).hide();
  renderSeasons();
  return false;
}
function deleteSeason(id){
  if(!confirm('Xoá mùa vụ này?')) return;
  DB.seasons = DB.seasons.filter(s=>s.id!==id); saveDB(); renderSeasons();
}
function renderSeasons(){
  const list = mySeasons();
  document.getElementById('seasonsTable').innerHTML = list.map(s=>{
    const cnt = DB.fields.filter(f=>f.seasonId===s.id).length;
    const badge = s.status==='Đang canh tác' ? 'chip-ok' : (s.status==='Lên kế hoạch' ? 'chip-info' : 'chip-warn');
    return `<tr><td class="fw-semibold">${s.name}</td><td>${s.crop}</td><td>${s.start}</td><td>${s.end}</td>
      <td><span class="chip ${badge}">${s.status}</span></td><td>${cnt}</td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="deleteSeason('${s.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
  }).join('') || `<tr><td colspan="7">${emptyHTML('Chưa có mùa vụ nào.')}</td></tr>`;
}

/* ---------------- LOG (Nhật ký canh tác) ---------------- */
function typeClass(t){
  if(t==='Phun thuốc') return 'type-phun';
  if(t==='Bón phân') return 'type-bon';
  if(t==='Tưới nước') return '';
  return 'type-khac';
}
function statusChip(s){
  if(s==='Có dấu hiệu bệnh') return '<span class="chip chip-danger">Có dấu hiệu bệnh</span>';
  if(s==='Cần theo dõi') return '<span class="chip chip-warn">Cần theo dõi</span>';
  return '<span class="chip chip-ok">Bình thường</span>';
}
function openLogModal(){
  const sel = document.getElementById('logField');
  sel.innerHTML = myFields().map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
  document.getElementById('logDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('logNote').value='';
}
function saveLog(e){
  e.preventDefault();
  const l = {
    id: uid('l'),
    fieldId: document.getElementById('logField').value,
    ownerId: currentUser().id,
    date: document.getElementById('logDate').value,
    type: document.getElementById('logType').value,
    status: document.getElementById('logStatus').value,
    note: document.getElementById('logNote').value
  };
  DB.logs.unshift(l); saveDB();
  bootstrap.Modal.getInstance(document.getElementById('logModal')).hide();
  renderLogs(); renderHome();
  return false;
}
function renderLogs(){
  const filterSel = document.getElementById('logFilterField');
  if(filterSel.options.length<=1){
    filterSel.innerHTML = '<option value="">Tất cả ruộng</option>' + myFields().map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
  }
  const fv = filterSel.value;
  let list = myLogs().sort((a,b)=> a.date<b.date?1:-1);
  if(fv) list = list.filter(l=>l.fieldId===fv);
  document.getElementById('logTimeline').innerHTML = list.map(l=>{
    const f = DB.fields.find(x=>x.id===l.fieldId);
    return `<div class="timeline-item ${typeClass(l.type)}">
      <div class="d-flex justify-content-between flex-wrap gap-1">
        <div><span class="fw-semibold">${l.type}</span> <span class="text-muted2 small">· ${f? f.name:'—'}</span></div>
        <div class="small text-muted2">${l.date}</div>
      </div>
      <div class="small mt-1">${l.note||''}</div>
      <div class="mt-1">${statusChip(l.status)}</div>
    </div>`;
  }).join('') || emptyHTML('Chưa có nhật ký nào được ghi.');
}

/* ---------------- WEATHER ---------------- */
let weatherChartInstance=null;
function renderWeather(){
  const w = DB.weather;
  document.getElementById('wRegion').textContent = getProvinceShortName(w.regionCode || w.region);
  document.getElementById('wTemp').textContent = w.current.temp+'°C';
  document.getElementById('wCondition').textContent = w.current.condition;
  document.getElementById('wFeels').textContent = w.current.feels+'°C';
  document.getElementById('wHumidity').textContent = w.current.humidity+'%';
  document.getElementById('wRain').textContent = w.current.rain+'%';
  document.getElementById('wWind').textContent = w.current.wind+' km/h';
  const vis=document.getElementById('wVisibility'); if(vis) vis.textContent=(w.current.visibility||9)+' km';
  const src=document.getElementById('weatherSource'); if(src) src.textContent=(w.source||'Dữ liệu demo')+(w.updatedAt?' · cập nhật '+new Date(w.updatedAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'');
  document.getElementById('forecastStrip').innerHTML = w.forecast.map(d=>`
    <div class="forecast-day"><div class="d">${d.d}</div><i class="bi ${d.icon}"></i>
      <div class="fw-semibold" style="font-size:.85rem;">${d.hi}° / ${d.lo}°</div>
      <div class="small text-muted2"><i class="bi bi-droplet"></i> ${d.rain}%</div></div>`).join('');
  document.getElementById('weatherAlertsFull').innerHTML = w.alerts.map(a=>`
    <div class="alert-x level-${a.level} mb-2">
      <i class="bi ${alertIcon(a.level)}"></i>
      <div><div class="fw-semibold">${a.title}</div><div class="small text-muted2">${a.desc}</div></div>
    </div>`).join('');

  const ctx = document.getElementById('weatherChart');
  if(weatherChartInstance) weatherChartInstance.destroy();
  const styles = getComputedStyle(document.documentElement);
  weatherChartInstance = new Chart(ctx, {
    data:{
      labels: w.forecast.map(d=>d.d),
      datasets:[
        {type:'line', label:'Nhiệt độ cao (°C)', data:w.forecast.map(d=>d.hi), borderColor: styles.getPropertyValue('--sun').trim()||'#E0A23A', backgroundColor:'transparent', tension:.35, yAxisID:'y'},
        {type:'bar', label:'Khả năng mưa (%)', data:w.forecast.map(d=>d.rain), backgroundColor: (styles.getPropertyValue('--sky').trim()||'#3B7EA1')+'55', borderRadius:6, yAxisID:'y1'}
      ]
    },
    options:{
      responsive:true,
      interaction:{mode:'index', intersect:false},
      scales:{
        y:{position:'left', title:{display:true, text:'°C'}, grid:{color:styles.getPropertyValue('--border').trim()}},
        y1:{position:'right', title:{display:true, text:'% mưa'}, min:0, max:100, grid:{drawOnChartArea:false}}
      },
      plugins:{legend:{position:'bottom'}}
    }
  });
}

/* ---------------- AI ---------------- */
function switchAITab(tab){
  currentAITab = tab;
  document.querySelectorAll('.ai-tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('aitab-diag').style.display = tab==='diag' ? 'block':'none';
  document.getElementById('aitab-advice').style.display = tab==='advice' ? 'block':'none';
  document.getElementById('aitab-history').style.display = tab==='history' ? 'block':'none';
  document.getElementById('aitab-chat').style.display = tab==='chat' ? 'block':'none';
  if(tab==='chat') initAIChat();
  if(tab==='advice'){
    document.getElementById('adviceField').innerHTML = myFields().map(f=>`<option value="${f.id}">${f.name} (${f.crop})</option>`).join('') || '<option value="">Chưa có ruộng nào</option>';
  }
  if(tab==='history') renderAIHistory();
}
function initAIChat(){
  const box=document.getElementById('aiChatMessages');
  if(!box || aiChatStarted) return;
  aiChatStarted=true;
  const u=currentUser();
  const region=getProvinceShortName(u?.regionCode||u?.region)||'khu vực của bạn';
  box.innerHTML=`<div class="ai-msg ai-msg-bot"><div class="ai-msg-avatar"><i class="bi bi-robot"></i></div><div><div class="ai-msg-name">AgriSmart AI</div><div>Xin chào ${u?.name||'bạn'}! Tôi có thể hỗ trợ về cây trồng, thời tiết, sâu bệnh, tưới nước, bón phân và mùa vụ tại <b>${region}</b>. Hãy đặt câu hỏi.</div></div></div>`;
}
function appendAIMessage(type,text){
  const box=document.getElementById('aiChatMessages'); if(!box) return;
  const safe=String(text).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  const isUser=type==='user';
  box.insertAdjacentHTML('beforeend',`<div class="ai-msg ${isUser?'ai-msg-user':'ai-msg-bot'}">${isUser?'':'<div class="ai-msg-avatar"><i class="bi bi-robot"></i></div>'}<div><div class="ai-msg-name">${isUser?'Bạn':'AgriSmart AI'}</div><div>${safe}</div></div></div>`);
  box.scrollTop=box.scrollHeight;
}
async function sendAIChat(){
  const input=document.getElementById('aiChatInput');
  const q=input?.value.trim(); if(!q) return;
  initAIChat(); appendAIMessage('user',q); input.value=''; input.disabled=true;
  try{
    const result=await window.AgriAI.chat(q);
    appendAIMessage('bot',result.answer);
    DB.aiHistory.unshift({id:uid('h'),ownerId:currentUser().id,date:new Date().toISOString().slice(0,10),kind:'Chat AI',question:q,result:result.answer.slice(0,180)});
    saveDB();
  }catch(e){ appendAIMessage('bot','Tạm thời AI không trả lời được. Bạn thử lại sau.'); }
  finally{input.disabled=false; input.focus();}
}
function handleAIChatKeydown(e){
  if(e.key==='Enter' && !e.shiftKey){e.preventDefault();sendAIChat();}
}
function renderAI(){ switchAITab(currentAITab); }
function previewDiagImg(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const img = document.getElementById('diagImgPreview');
    img.src = ev.target.result;
    img.style.display='block';
    img.dataset.fileName=file.name;
    img.dataset.fileSize=file.size;
    img.onload=()=>{ img.title=`${file.name} · ${img.naturalWidth}×${img.naturalHeight}px`; };
    const meta=document.getElementById('diagImageMeta');
    if(meta) meta.textContent=`${file.name} · ${(file.size/1024).toFixed(0)} KB · ảnh đã sẵn sàng để phân tích`;
  };
  reader.readAsDataURL(file);
}
function handleDiagDragOver(e){e.preventDefault(); document.getElementById('diagDropZone')?.classList.add('dragging');}
function handleDiagDragLeave(e){e.preventDefault(); document.getElementById('diagDropZone')?.classList.remove('dragging');}
function handleDiagDrop(e){
  e.preventDefault();
  const zone=document.getElementById('diagDropZone'); zone?.classList.remove('dragging');
  const file=e.dataTransfer?.files?.[0];
  if(!file || !file.type.startsWith('image/')) return;
  const input=document.getElementById('diagImgInput');
  const dt=new DataTransfer(); dt.items.add(file); input.files=dt.files;
  previewDiagImg({target:{files:[file]}});
}


const DISEASE_RULES = [
  {keys:['vàng lá','vàng gân','vàng nhạt'], name:'Vàng lá gân xanh (Greening)', cause:'Do vi khuẩn Candidatus Liberibacter gây ra, lây lan qua rầy chổng cánh hoặc mắt ghép nhiễm bệnh.', severity:'high', treatment:'Nhổ bỏ và tiêu huỷ cây bệnh nặng; phun trừ rầy chổng cánh bằng thuốc đặc hiệu; bón phân cân đối để tăng sức đề kháng.', prevention:'Dùng cây giống sạch bệnh, kiểm soát rầy chổng cánh định kỳ, vệ sinh vườn thường xuyên.'},
  {keys:['đốm nâu','đốm vàng','viền vàng','mốc sương','sương mai'], name:'Bệnh mốc sương (sương mai)', cause:'Do nấm Phytophthora infestans phát triển mạnh trong điều kiện ẩm ướt, mưa nhiều, nhiệt độ mát.', severity:'medium', treatment:'Phun thuốc gốc đồng hoặc thuốc đặc trị nấm theo khuyến cáo; cắt tỉa lá bệnh, tăng thông thoáng cho cây.', prevention:'Không tưới quá ẩm vào chiều tối, luân canh cây trồng, chọn giống kháng bệnh.'},
  {keys:['héo','héo rũ','héo vàng'], name:'Bệnh héo rũ (héo xanh vi khuẩn)', cause:'Vi khuẩn Ralstonia solanacearum tấn công hệ mạch dẫn khiến cây mất khả năng hút nước.', severity:'high', treatment:'Nhổ bỏ cây bệnh, xử lý đất bằng vôi bột, tránh trồng lại cây họ cà trong 2-3 vụ liên tiếp.', prevention:'Luân canh cây trồng khác họ, thoát nước tốt, khử trùng dụng cụ canh tác.'},
  {keys:['đạo ôn','cháy lá','vệt xám'], name:'Bệnh đạo ôn (cháy lá lúa)', cause:'Do nấm Pyricularia oryzae gây hại mạnh khi bón thừa đạm, thời tiết ẩm mát ban đêm.', severity:'high', treatment:'Phun thuốc trừ nấm đặc hiệu (nhóm Tricyclazole, Isoprothiolane...), giảm bón đạm, giữ mực nước hợp lý.', prevention:'Bón phân cân đối NPK, gieo sạ đúng mật độ, vệ sinh đồng ruộng sau thu hoạch.'},
  {keys:['sâu', 'lỗ', 'thủng lá', 'ăn lá'], name:'Sâu ăn lá / sâu cuốn lá', cause:'Do các loài sâu bộ cánh vảy gây hại, phát triển mạnh vào đầu vụ hoặc sau mưa.', severity:'medium', treatment:'Phun thuốc trừ sâu sinh học hoặc hoá học theo ngưỡng gây hại, bắt sâu bằng tay nếu mật độ thấp.', prevention:'Thăm đồng thường xuyên, bảo vệ thiên địch, vệ sinh cỏ dại quanh ruộng.'},
  {keys:['thối rễ','thối gốc','úng nước'], name:'Bệnh thối rễ do úng nước', cause:'Đất bị ngập úng lâu ngày khiến rễ thiếu oxy và bị nấm/vi khuẩn tấn công.', severity:'medium', treatment:'Khơi thông rãnh thoát nước ngay, hạn chế tưới thêm, xử lý nấm vùng rễ bằng thuốc sinh học.', prevention:'Lên liếp cao, đảm bảo hệ thống thoát nước tốt trước mùa mưa.'}
];
async function runDiagnosis(){
  const crop = document.getElementById('diagCrop').value;
  const symptom = document.getElementById('diagSymptom').value.trim();
  const img=document.getElementById('diagImgPreview');
  const hasImg = img.style.display==='block';
  if(!symptom && !hasImg){ alert('Vui lòng mô tả triệu chứng hoặc tải ảnh lên để AI phân tích.'); return; }
  const btn=document.querySelector('#aitab-diag .btn-forest');
  if(btn){btn.disabled=true; btn.innerHTML='<span class="spinner-border spinner-border-sm me-1"></span>AI đang phân tích...';}
  const lower = symptom.toLowerCase();
  let match = DISEASE_RULES.find(r=>r.keys.some(k=>lower.includes(k)));
  let visionNote='';
  let confidence=match?'Cao':'Thấp';
  try{
    if(hasImg){
      const vision=await window.AgriAI.analyzeImage({crop,symptom,imageData:img.src,fileName:img.dataset.fileName||''});
      if(vision && !vision.fallback && (vision.name||vision.diagnosis)){
        match={
          keys:[], name:vision.name||vision.diagnosis,
          cause:vision.cause||'Mô hình AI đã trả về kết quả dựa trên ảnh và thông tin bạn cung cấp.',
          severity:vision.severity||'medium',
          treatment:vision.treatment||'Theo dõi sát và áp dụng hướng xử lý được khuyến nghị bởi mô hình.',
          prevention:vision.prevention||'Giữ vệ sinh đồng ruộng, thông thoáng tán cây và theo dõi diễn biến bệnh.'
        };
        confidence=vision.confidence||'Theo mô hình';
      } else if(!match){
        visionNote='Ảnh đã được nhận. Chế độ demo chưa kết nối mô hình Computer Vision nên cần thêm mô tả triệu chứng để chẩn đoán cụ thể.';
      } else {
        visionNote='AI đã nhận ảnh và kết hợp ảnh với mô tả triệu chứng trong phiên phân tích demo.';
      }
    }
    if(!match && !visionNote) match=DISEASE_RULES[0];
    if(match){
      const sevLabel = match.severity==='high' ? 'Nguy cơ cao' : (match.severity==='medium' ? 'Trung bình' : 'Nhẹ');
      const html = `
        <div class="result-card">
          <div class="rc-head">
            <div class="small text-white-50">KẾT QUẢ CHẨN ĐOÁN AI · ${crop}</div>
            <h5 class="mb-0 mt-1">${match.name}</h5>
            <div class="mt-1"><span class="severity-dot"></span>Mức độ: ${sevLabel} · Độ tin cậy: ${confidence}</div>
          </div>
          <div class="rc-body">
            ${visionNote?`<div class="alert-x level-info mb-3"><i class="bi bi-info-circle"></i><div>${visionNote}</div></div>`:''}
            <div class="mb-3"><div class="fw-semibold small text-muted2 mb-1">NGUYÊN NHÂN</div><div>${match.cause}</div></div>
            <div class="mb-3"><div class="fw-semibold small text-muted2 mb-1">CÁCH XỬ LÝ</div><div>${match.treatment}</div></div>
            <div class="mb-1"><div class="fw-semibold small text-muted2 mb-1">CÁCH PHÒNG NGỪA</div><div>${match.prevention}</div></div>
            <div class="small text-muted2 mt-3"><i class="bi bi-shield-check"></i> Kết quả mang tính tham khảo; không thay thế chẩn đoán chuyên môn. Nếu bệnh lan nhanh hoặc cây chết hàng loạt, nên liên hệ cán bộ nông nghiệp.</div>
          </div>
        </div>`;
      document.getElementById('diagResultWrap').innerHTML = html;
      DB.aiHistory.unshift({id:uid('h'), ownerId:currentUser().id, date:new Date().toISOString().slice(0,10), kind:'Chẩn đoán bệnh', question: symptom || `(Phân tích ảnh: ${img.dataset.fileName||'ảnh cây'})`, result: match.name+' — '+sevLabel});
      saveDB();
    } else {
      document.getElementById('diagResultWrap').innerHTML=`<div class="empty-state"><i class="bi bi-info-circle d-block mb-2"></i>${visionNote}</div>`;
    }
  }finally{
    if(btn){btn.disabled=false; btn.innerHTML='<i class="bi bi-robot me-1"></i>Phân tích bằng AI';}
  }
}
function runAdvice(){
  const fieldId = document.getElementById('adviceField').value;
  const field = DB.fields.find(f=>f.id===fieldId);
  const stage = document.getElementById('adviceStage').value;
  const q = document.getElementById('adviceQuestion').value.trim();
  if(!field){ alert('Bạn chưa có ruộng nào để tư vấn. Hãy thêm ruộng ở mục Cây trồng trước.'); return; }
  const rainy = DB.weather.current.rain >= 50 || DB.weather.alerts.some(a=>a.level==='high' && a.title.toLowerCase().includes('mưa'));
  const hot = DB.weather.current.temp >= 34;
  let watering, fertilizing, disease, timing;
  if(stage==='Mạ non / cây con'){
    watering = 'Giữ ẩm nhẹ, tưới 1 lần/ngày vào sáng sớm, tránh úng nước.';
    fertilizing = 'Có thể bón lót nhẹ, chưa cần bón thúc đạm mạnh giai đoạn này.';
  } else if(stage==='Đẻ nhánh / phát triển thân lá' || stage==='Đẻ nhánh'){
    watering = 'Duy trì mực nước 3–5cm (với lúa) hoặc tưới đều 2 ngày/lần (cây cạn).';
    fertilizing = rainy ? 'Nên hoãn bón thúc đạm đến khi thời tiết tạnh ráo để tránh rửa trôi phân.' : 'Có thể bón thúc đợt 2 với NPK cân đối để cây phát triển thân lá.';
  } else if(stage==='Ra hoa'){
    watering = 'Tưới đều đặn, tránh để khô hạn hoặc ngập úng đột ngột vì dễ gây rụng hoa.';
    fertilizing = 'Bổ sung phân có hàm lượng Kali, Bo để tăng đậu hoa, hạn chế đạm.';
  } else if(stage==='Đậu quả / làm hạt'){
    watering = 'Đảm bảo đủ nước, đặc biệt giai đoạn hạt/quả vào chắc, tránh thiếu nước cục bộ.';
    fertilizing = 'Tăng cường Kali giúp chắc hạt/quả, hạn chế bón đạm giai đoạn cuối.';
  } else {
    watering = 'Giảm tưới nước trước thu hoạch 5–7 ngày để thuận tiện thu hoạch.';
    fertilizing = 'Ngừng bón phân, chuẩn bị nhân lực và phương tiện cho thu hoạch.';
  }
  disease = rainy ? 'Độ ẩm cao và mưa nhiều làm tăng nguy cơ nấm bệnh — nên phun phòng nấm và thăm đồng thường xuyên hơn.' : (hot? 'Nắng nóng kéo dài có thể làm tăng mật độ sâu chích hút — theo dõi bọ trĩ, nhện đỏ.' : 'Thời tiết hiện tại ổn định, duy trì thăm đồng định kỳ 2–3 ngày/lần.');
  timing = rainy ? 'Nên thực hiện các công việc chăm sóc vào lúc trời tạnh ráo, tránh phun/bón ngay trước hoặc trong mưa.' : 'Nên chăm sóc vào sáng sớm hoặc chiều mát để hạn chế bốc hơi và stress nhiệt cho cây.';

  const html = `
    <div class="result-card">
      <div class="rc-head">
        <div class="small text-white-50">TƯ VẤN CHĂM SÓC AI · ${field.crop} · ${stage}</div>
        <h5 class="mb-0 mt-1">${field.name}</h5>
      </div>
      <div class="rc-body">
        <div class="mb-3"><div class="fw-semibold small text-muted2 mb-1"><i class="bi bi-droplet"></i> TƯỚI NƯỚC</div><div>${watering}</div></div>
        <div class="mb-3"><div class="fw-semibold small text-muted2 mb-1"><i class="bi bi-flower1"></i> BÓN PHÂN</div><div>${fertilizing}</div></div>
        <div class="mb-3"><div class="fw-semibold small text-muted2 mb-1"><i class="bi bi-shield-check"></i> PHÒNG BỆNH</div><div>${disease}</div></div>
        <div class="mb-1"><div class="fw-semibold small text-muted2 mb-1"><i class="bi bi-clock-history"></i> THỜI ĐIỂM CHĂM SÓC</div><div>${timing}</div></div>
        ${q? `<div class="mt-3 pt-3 border-top"><div class="fw-semibold small text-muted2 mb-1">CÂU HỎI CỦA BẠN</div><div class="fst-italic mb-2">"${q}"</div><div>AI ghi nhận câu hỏi này và đã lồng ghép vào khuyến nghị phía trên dựa theo giai đoạn sinh trưởng và thời tiết hiện tại.</div></div>` : ''}
      </div>
    </div>`;
  document.getElementById('adviceResultWrap').innerHTML = html;
  DB.aiHistory.unshift({id:uid('h'), ownerId:currentUser().id, date:new Date().toISOString().slice(0,10), kind:'Tư vấn chăm sóc', question: q || (field.crop+' - '+stage), result: 'Đã đề xuất tưới nước, bón phân, phòng bệnh phù hợp'});
  saveDB();
}
function renderAIHistory(){
  const list = DB.aiHistory.filter(h=>h.ownerId===currentUser().id);
  document.getElementById('aiHistoryTable').innerHTML = list.map(h=>`
    <tr><td>${h.date}</td><td><span class="chip ${h.kind==='Chẩn đoán bệnh'?'chip-danger':'chip-info'}">${h.kind}</span></td>
    <td>${h.question}</td><td>${h.result}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="deleteAIHistory('${h.id}')"><i class="bi bi-trash"></i></button></td></tr>`).join('') || `<tr><td colspan="5">${emptyHTML('Chưa có lịch sử tư vấn AI nào.')}</td></tr>`;
}
function deleteAIHistory(id){
  DB.aiHistory = DB.aiHistory.filter(h=>h.id!==id); saveDB(); renderAIHistory();
}

/* ---------------- PRICES ---------------- */
let priceChartInstance=null;
let priceCompareSelection=[];
function renderPrices(){
  document.getElementById('pricesTableFull').innerHTML = DB.prices.map(p=>{
    const up=p.change>0, flat=p.change===0;
    const cls = flat?'':(up?'up':'down');
    const icon = flat?'bi-dash':(up?'bi-arrow-up-short':'bi-arrow-down-short');
    return `<tr><td class="fw-semibold">${p.crop}</td><td>${p.price.toLocaleString('vi-VN')}</td><td>${p.unit}</td><td class="price-change ${cls}"><i class="bi ${icon}"></i>${Math.abs(p.change)}%</td></tr>`;
  }).join('');

  initPriceComparison();
}

function initPriceComparison(){
  const selects=[1,2,3].map(i=>document.getElementById('priceCompare'+i)).filter(Boolean);
  if(!selects.length) return;

  const availableIds = DB.prices.map((_,i)=>String(i));
  priceCompareSelection = priceCompareSelection.filter(i=>availableIds.includes(String(i))).slice(0,3);
  if(priceCompareSelection.length===0 && DB.prices.length) priceCompareSelection=[0, Math.min(1,DB.prices.length-1)].filter((v,i,a)=>a.indexOf(v)===i);

  selects.forEach((select, idx)=>{
    const current = priceCompareSelection[idx] != null ? String(priceCompareSelection[idx]) : '';
    select.innerHTML = `<option value="">-- Không chọn --</option>` + DB.prices.map((p,i)=>`<option value="${i}">${p.crop}</option>`).join('');
    select.value = current;
  });
  updatePriceComparison();
}

function updatePriceComparison(){
  const selects=[1,2,3].map(i=>document.getElementById('priceCompare'+i)).filter(Boolean);
  const selected=selects.map(s=>s.value).filter(v=>v!=='').map(Number);
  priceCompareSelection=selected;

  const unique=[...new Set(selected)];
  if(unique.length!==selected.length){
    selects.forEach((s,i)=>{
      if(s.value && selected.indexOf(Number(s.value))!==i) s.value='';
    });
    priceCompareSelection=selects.map(s=>s.value).filter(Boolean).map(Number);
  }

  const countEl=document.getElementById('priceCompareCount');
  if(countEl) countEl.textContent=`${priceCompareSelection.length}/3`;

  const summary=document.getElementById('priceCompareSummary');
  if(!summary) return;
  const products=priceCompareSelection.map(i=>DB.prices[i]).filter(Boolean);
  if(!products.length){
    summary.innerHTML='<div class="empty-state py-3"><i class="bi bi-bar-chart-line d-block mb-2"></i>Hãy chọn ít nhất một nông sản để xem so sánh.</div>';
  } else {
    const maxPrice=Math.max(...products.map(p=>p.price));
    const minPrice=Math.min(...products.map(p=>p.price));
    const diff=maxPrice-minPrice;
    summary.innerHTML=products.map(p=>{
      const up=p.change>0, flat=p.change===0;
      const cls=flat?'':(up?'up':'down');
      const icon=flat?'bi-dash':(up?'bi-arrow-up-short':'bi-arrow-down-short');
      return `<div class="price-compare-item"><div><div class="fw-semibold">${p.crop}</div><div class="small text-muted2">${p.unit}</div></div><div class="text-end"><div class="fw-semibold">${p.price.toLocaleString('vi-VN')} đ</div><div class="small price-change ${cls}"><i class="bi ${icon}"></i>${Math.abs(p.change)}%</div></div></div>`;
    }).join('') + (products.length>1 ? `<div class="small text-muted2 mt-2">Chênh lệch giữa giá cao nhất và thấp nhất: <strong>${diff.toLocaleString('vi-VN')} đ/${products[0].unit.replace('đ/','')}</strong>.</div>` : '');
  }

  const ctx=document.getElementById('priceChart');
  if(!ctx || typeof Chart==='undefined') return;
  if(priceChartInstance) priceChartInstance.destroy();
  const styles=getComputedStyle(document.documentElement);
  priceChartInstance=new Chart(ctx,{
    type:'bar',
    data:{labels:products.map(p=>p.crop),datasets:[{label:'Giá (đ)',data:products.map(p=>p.price),backgroundColor:styles.getPropertyValue('--rice').trim()||'#5C9457',borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${Number(c.raw).toLocaleString('vi-VN')} đ/${products[c.dataIndex]?.unit?.replace('đ/','')||''}`}}},scales:{y:{beginAtZero:true,grid:{color:styles.getPropertyValue('--border').trim()},ticks:{callback:v=>Number(v).toLocaleString('vi-VN')}},x:{grid:{display:false}}}}
  });
}

/* ---------------- ACCOUNT ---------------- */
function renderAccount(){
  const u = currentUser();
  document.getElementById('accAvatar').textContent = u.name.charAt(0).toUpperCase();
  document.getElementById('accName').textContent = u.name;
  document.getElementById('accRoleBadge').textContent = u.role==='admin'?'Quản trị viên':'Nông dân';
  document.getElementById('accRoleBadge').className = 'badge-role mt-1 d-inline-block '+(u.role==='admin'?'admin':'user');
  document.getElementById('accEmail').textContent = u.email;
  document.getElementById('accPhoneView').textContent = u.phone||'-';
  document.getElementById('accRegionView').textContent = getProvinceShortName(u.regionCode || u.region);
  document.getElementById('accNameInput').value = u.name;
  document.getElementById('accPhoneInput').value = u.phone||'';
  document.getElementById('accEmailInput').value = u.email;
  setProvinceAutocompleteValue('accRegionSearch', u.regionCode || getLegacyProvinceCode(u.region));
}
function saveAccount(e){
  e.preventDefault();
  const u = currentUser();
  u.name = document.getElementById('accNameInput').value;
  u.phone = document.getElementById('accPhoneInput').value;
  u.regionCode = document.getElementById('accRegionInput').value;
  if (!u.regionCode) { alert('Vui lòng chọn một tỉnh/thành từ danh sách gợi ý.'); return false; }
  saveDB();
  DB.weather.regionCode=u.regionCode;
  document.getElementById('miniName').textContent = u.name;
  document.getElementById('miniRegion').textContent = getProvinceShortName(u.regionCode || u.region);
  document.getElementById('miniAvatar').textContent = u.name.charAt(0).toUpperCase();
  renderAccount();
  refreshWeather(true);
  const s = document.getElementById('accSaved'); s.style.display='inline'; setTimeout(()=>s.style.display='none', 2000);
  return false;
}

/* ---------------- ADMIN ---------------- */
let adminChartInstance=null;
function renderAdminOverview(){
  document.getElementById('adStatUsers').textContent = DB.users.length;
  document.getElementById('adStatFields').textContent = DB.fields.length;
  document.getElementById('adStatLogs').textContent = DB.logs.length;
  document.getElementById('adStatAI').textContent = DB.aiHistory.length;
  document.getElementById('adminAlertsMini').innerHTML = DB.weather.alerts.map(a=>`
    <div class="alert-x level-${a.level} mb-2"><i class="bi ${alertIcon(a.level)}"></i>
      <div><div class="fw-semibold" style="font-size:.85rem;">${a.title}</div></div></div>`).join('');
  const types = ['Tưới nước','Bón phân','Phun thuốc','Làm cỏ','Khác'];
  const counts = types.map(t=>DB.logs.filter(l=>l.type===t).length);
  const ctx = document.getElementById('adminActivityChart');
  if(adminChartInstance) adminChartInstance.destroy();
  const styles = getComputedStyle(document.documentElement);
  adminChartInstance = new Chart(ctx,{type:'bar', data:{labels:types, datasets:[{label:'Số lượt ghi nhận', data:counts, backgroundColor: styles.getPropertyValue('--forest-light').trim()||'#2E6B4C', borderRadius:8}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{stepSize:1}, grid:{color:styles.getPropertyValue('--border').trim()}}, x:{grid:{display:false}}}}});
}
function renderAdminUsers(){
  document.getElementById('adminUsersTable').innerHTML = DB.users.map(u=>`
    <tr><td class="fw-semibold">${u.name}</td><td>${u.email}</td>
    <td><span class="badge-role ${u.role==='admin'?'admin':'user'}">${u.role==='admin'?'Quản trị viên':'Nông dân'}</span></td>
    <td>${getProvinceShortName(u.regionCode || u.region)}</td>
    <td><span class="chip ${u.status==='active'?'chip-ok':'chip-warn'}">${u.status==='active'?'Hoạt động':'Tạm khoá'}</span></td>
    <td>
      <button class="btn btn-sm btn-outline-secondary me-1" onclick="toggleUserStatus('${u.id}')" title="Khoá/Mở khoá"><i class="bi bi-toggle2-on"></i></button>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u.id}')" ${u.id===currentUser().id?'disabled':''}><i class="bi bi-trash"></i></button>
    </td></tr>`).join('');
}
function toggleUserStatus(id){
  const u = DB.users.find(x=>x.id===id);
  u.status = u.status==='active' ? 'locked' : 'active';
  saveDB(); renderAdminUsers();
}
function deleteUser(id){
  if(id===currentUser().id){ return; }
  if(!confirm('Xoá người dùng này khỏi hệ thống?')) return;
  DB.users = DB.users.filter(u=>u.id!==id); saveDB(); renderAdminUsers();
}
function adminAddUser(e){
  e.preventDefault();
  if (!document.getElementById('newUserRegion').value) {
    alert('Vui lòng chọn một tỉnh/thành từ danh sách gợi ý.');
    document.getElementById('newUserRegionSearch').focus();
    return false;
  }
  DB.users.push({
    id: uid('u'),
    name: document.getElementById('newUserName').value,
    email: document.getElementById('newUserEmail').value,
    pass:'123456',
    role: document.getElementById('newUserRole').value,
    regionCode: document.getElementById('newUserRegion').value,
    phone:'', status:'active'
  });
  saveDB();
  bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
  document.getElementById('newUserName').value=''; document.getElementById('newUserEmail').value='';
  document.getElementById('newUserRegionSearch').value='';
  document.getElementById('newUserRegion').value='';
  renderAdminUsers();
  return false;
}
function renderAdminFields(){
  document.getElementById('adminFieldsTable').innerHTML = DB.fields.map(f=>{
    const owner = DB.users.find(u=>u.id===f.ownerId);
    return `<tr><td class="fw-semibold">${f.name}</td><td>${f.crop}</td><td>${f.area} ha</td><td><span class="chip chip-ok">${f.stage}</span></td><td>${f.plantDate}</td><td>${owner?owner.name:'—'}</td></tr>`;
  }).join('') || `<tr><td colspan="6">${emptyHTML('Chưa có dữ liệu ruộng nào.')}</td></tr>`;
}
function renderAdminPrices(){
  document.getElementById('adminPricesTable').innerHTML = DB.prices.map((p,i)=>`
    <tr><td class="fw-semibold">${p.crop}</td>
    <td><input type="number" class="form-control form-control-sm" style="width:110px" value="${p.price}" onchange="updatePrice(${i}, this.value)"></td>
    <td>${p.unit}</td>
    <td><input type="number" step="0.1" class="form-control form-control-sm" style="width:90px" value="${p.change}" onchange="updatePriceChange(${i}, this.value)"></td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="deletePrice(${i})"><i class="bi bi-trash"></i></button></td></tr>`).join('');
}
function updatePrice(i,v){ DB.prices[i].price = parseFloat(v)||0; saveDB(); }
function updatePriceChange(i,v){ DB.prices[i].change = parseFloat(v)||0; saveDB(); }
function deletePrice(i){ DB.prices.splice(i,1); saveDB(); renderAdminPrices(); }
function renderAdminAlerts(){
  document.getElementById('adminAlertsFull').innerHTML = DB.weather.alerts.map(a=>`
    <div class="alert-x level-${a.level} mb-2">
      <i class="bi ${alertIcon(a.level)}"></i>
      <div class="flex-grow-1"><div class="fw-semibold">${a.title}</div><div class="small text-muted2">${a.desc}</div></div>
      <button class="btn btn-sm btn-outline-danger align-self-start" onclick="deleteAlert('${a.id}')"><i class="bi bi-trash"></i></button>
    </div>`).join('') || emptyHTML('Chưa có cảnh báo nào.');
}
function deleteAlert(id){ DB.weather.alerts = DB.weather.alerts.filter(a=>a.id!==id); saveDB(); renderAdminAlerts(); }
function adminAddAlert(e){
  e.preventDefault();
  DB.weather.alerts.unshift({id:uid('a'), level:document.getElementById('newAlertLevel').value, title:document.getElementById('newAlertTitle').value, desc:document.getElementById('newAlertDesc').value});
  saveDB();
  bootstrap.Modal.getInstance(document.getElementById('alertModal')).hide();
  document.getElementById('newAlertTitle').value=''; document.getElementById('newAlertDesc').value='';
  renderAdminAlerts();
  return false;
}
function renderAdminAI(){
  document.getElementById('adminAITable').innerHTML = DB.aiHistory.map(h=>{
    const owner = DB.users.find(u=>u.id===h.ownerId);
    return `<tr><td>${h.date}</td><td>${owner?owner.name:'—'}</td><td><span class="chip ${h.kind==='Chẩn đoán bệnh'?'chip-danger':'chip-info'}">${h.kind}</span></td><td>${h.question}</td><td>${h.result}</td></tr>`;
  }).join('') || `<tr><td colspan="5">${emptyHTML('Chưa có lịch sử AI nào.')}</td></tr>`;
}

/* ---------------- THEME ---------------- */
function toggleTheme(){
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let next;
  if(!cur) next = prefersDark ? 'light' : 'dark';
  else next = cur==='dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  document.getElementById('themeIcon').className = next==='dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  try{ localStorage.setItem('agrismart_theme', next); }catch(e){}
  if(document.getElementById('page-weather').classList.contains('active')) renderWeather();
  if(document.getElementById('page-prices').classList.contains('active')) renderPrices();
  if(document.getElementById('page-admin-overview').classList.contains('active')) renderAdminOverview();
}

/* ---------------- INIT ---------------- */
(function init(){
  loadDB();
initProvinceUI();
  try{
    const savedTheme = localStorage.getItem('agrismart_theme');
    if(savedTheme){ document.documentElement.setAttribute('data-theme', savedTheme); document.getElementById('themeIcon').className = savedTheme==='dark' ? 'bi bi-sun':'bi bi-moon-stars'; }
  }catch(e){}
  selectLoginRole('user');
  const chatInput=document.getElementById('aiChatInput'); if(chatInput) chatInput.addEventListener('keydown',handleAIChatKeydown);
  document.getElementById('loginEmail').value='nongdan@agrismart.vn';
  document.getElementById('loginPass').value='123456';
  try{
    const raw = localStorage.getItem('agrismart_session');
    if(raw){
      const s = JSON.parse(raw);
      const savedUser = DB.users.find(u=>u.id===s.userId);
      if(savedUser && savedUser.status !== 'locked'){ session=s; enterApp(); }
      else if(savedUser && savedUser.status === 'locked'){
        try{ localStorage.removeItem('agrismart_session'); }catch(e){}
      }
    }
  }catch(e){}
  window.addEventListener('storage', function(event){
    if(event.key === 'agrismart_v1'){
      try{
        DB = JSON.parse(event.newValue || '{}');
        if(session && !ensureCurrentUserActive()) return;
        if(currentPage === 'admin-users' && session?.role === 'admin') renderAdminUsers();
      }catch(e){}
    }
  });
  setInterval(function(){
    if(session) ensureCurrentUserActive();
  }, 1500);
})();
