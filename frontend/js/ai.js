/*
 * AgriSmart - AI chẩn đoán & tư vấn (bản tách riêng)
 * Chỉ chức năng AI hoạt động. Các mục khác trên sidebar được giữ nguyên
 * để thể hiện giao diện hệ thống nhưng không có điều hướng.
 */

const STORAGE_KEY = 'agrismart_ai_split_history_v1';
let currentAITab = 'diag';
let diagImageData = null;

const fields = [
  {id:'f1', name:'Ruộng số 1 - Ấp Bình An', crop:'Lúa OM5451', area:1.2, stage:'Đẻ nhánh'},
  {id:'f2', name:'Vườn cà chua sau nhà', crop:'Cà chua', area:0.3, stage:'Ra hoa'},
  {id:'f3', name:'Ruộng số 2 - Kênh 3', crop:'Lúa OM18', area:0.8, stage:'Mạ non / cây con'}
];

let aiHistory = loadHistory();

function loadHistory(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e) {}
  return [
    {id:'h1',date:'2026-09-14',kind:'Chẩn đoán bệnh',question:'Lá cà chua xuất hiện đốm nâu, viền vàng, lan nhanh sau mưa',result:'Nghi bệnh mốc sương (sương mai) — mức độ trung bình'},
    {id:'h2',date:'2026-09-11',kind:'Tư vấn chăm sóc',question:'Lúa OM5451 giai đoạn đẻ nhánh, thời tiết mưa nhiều',result:'Giữ mực nước 3–5cm, hoãn bón đạm đến khi tạnh ráo'}
  ];
}
function saveHistory(){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(aiHistory));}catch(e){} }
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}
function today(){return new Date().toISOString().slice(0,10);}

function switchAITab(tab){
  currentAITab=tab;
  document.querySelectorAll('.ai-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  ['diag','advice','history','chat'].forEach(t=>document.getElementById('aitab-'+t).style.display=t===tab?'block':'none');
  if(tab==='advice') fillAdviceFields();
  if(tab==='history') renderAIHistory();
  if(tab==='chat') initChat();
}

function fillAdviceFields(){
  const el=document.getElementById('adviceField');
  el.innerHTML=fields.map(f=>`<option value="${f.id}">${esc(f.name)} (${esc(f.crop)})</option>`).join('');
}

function diagnosisResult(crop,symptom,hasImage){
  const q=norm(symptom);
  if(crop==='Cà chua' && /(dom|vang|moc|heo|la)/.test(q)) return {
    title:'Nghi bệnh mốc sương (sương mai)', level:'Mức độ tham khảo: Trung bình',
    detail:'Triệu chứng đốm nâu, viền vàng và lan nhanh trong điều kiện ẩm/mưa có thể phù hợp với nhóm bệnh mốc sương. Cần kiểm tra trực tiếp mặt dưới lá và mức độ lan của vết bệnh để xác định chính xác hơn.'
  };
  if(crop==='Lúa' && /(vang la|dom|seo|dao|nam|heo)/.test(q)) return {
    title:'Cần kiểm tra nhóm bệnh lá trên lúa', level:'Chưa đủ dữ liệu để xác định bệnh',
    detail:'Hãy kiểm tra vị trí vết bệnh, màu sắc, hình dạng, mặt dưới lá và tốc độ lan. Nếu có thể, chụp ảnh rõ vùng bệnh dưới ánh sáng tự nhiên.'
  };
  if(/(vang la|dom nau|nam|heo|sau|ray|thoi re)/.test(q)) return {
    title:'Có dấu hiệu bất thường cần theo dõi', level:'Chưa đủ dữ liệu để xác định',
    detail:'Triệu chứng có thể liên quan đến bệnh, sâu hại hoặc điều kiện chăm sóc. Nên đối chiếu thêm ảnh thực tế, giai đoạn sinh trưởng và điều kiện thời tiết.'
  };
  return {
    title:'Chưa xác định được tác nhân', level:'Cần bổ sung thông tin',
    detail:'Mô tả hiện tại chưa đủ đặc trưng. Hãy ghi rõ cây gì, triệu chứng xuất hiện ở lá/thân/rễ/quả, vị trí bắt đầu, thời gian xuất hiện và mức độ lan.'
  };
}

function runDiagnosis(){
  const crop=document.getElementById('diagCrop').value;
  const symptom=document.getElementById('diagSymptom').value.trim();
  if(!symptom && !diagImageData){showDemoToast('Vui lòng nhập triệu chứng hoặc tải ảnh trước khi phân tích.');return;}
  const r=diagnosisResult(crop,symptom,Boolean(diagImageData));
  document.getElementById('diagResultWrap').innerHTML=`<div class="card-x ai-result"><div class="card-x-head d-flex justify-content-between align-items-center"><h6 class="mb-0"><i class="bi bi-robot me-1"></i>${esc(r.title)}</h6><span class="chip chip-info">AI Demo</span></div><div class="card-x-body"><p class="mb-2"><b>${esc(r.level)}</b></p><p class="mb-3">${esc(r.detail)}</p><div class="alert alert-light mb-0"><b>Gợi ý:</b> Cô lập cây có triệu chứng nếu cần, theo dõi diễn biến và tham khảo cán bộ kỹ thuật trước khi sử dụng thuốc bảo vệ thực vật.</div></div></div>`;
  aiHistory.unshift({id:'h'+Date.now(),date:today(),kind:'Chẩn đoán bệnh',question:`${crop}: ${symptom||'Phân tích từ ảnh'}`,result:r.title}); saveHistory();
}

function runAdvice(){
  const f=fields.find(x=>x.id===document.getElementById('adviceField').value)||fields[0];
  const stage=document.getElementById('adviceStage').value;
  const q=document.getElementById('adviceQuestion').value.trim();
  const nq=norm(q);
  let advice='';
  if(/bon phan|phan bon|dam|kali|npk/.test(nq)) advice='Không nên quyết định lượng phân chỉ từ một câu hỏi. Hãy dựa vào giai đoạn sinh trưởng, tình trạng đất và thời tiết. Nếu khu vực đang có mưa lớn, nên tránh bón ngay trước mưa để giảm nguy cơ rửa trôi.';
  else if(/tuoi|nuoc|thieu nuoc/.test(nq)) advice='Nên kiểm tra độ ẩm đất trước khi tưới, ưu tiên tưới vào sáng sớm hoặc chiều mát và tránh tưới khi dự báo mưa lớn.';
  else if(/benh|sau|ray|nam/.test(nq)) advice='Nên kiểm tra kỹ mặt trên và mặt dưới lá, thân, rễ và theo dõi tốc độ lan. Nếu có ảnh rõ triệu chứng, hãy dùng tab Chẩn đoán bệnh để đối chiếu thêm.';
  else advice=`Với ${f.crop} ở giai đoạn ${stage.toLowerCase()}, nên theo dõi độ ẩm đất, thời tiết và dấu hiệu sâu bệnh hằng ngày. ${f.crop.includes('Lúa')?'Tránh để ruộng ngập sâu kéo dài và điều chỉnh nước theo giai đoạn sinh trưởng.':'Ưu tiên tưới hợp lý và giữ khu vực thông thoáng, tránh ẩm kéo dài.'}`;
  document.getElementById('adviceResultWrap').innerHTML=`<div class="card-x ai-result"><div class="card-x-head"><h6 class="mb-0"><i class="bi bi-lightbulb me-1"></i>Khuyến nghị chăm sóc</h6></div><div class="card-x-body"><div class="mb-2"><b>${esc(f.name)}</b> · ${esc(f.crop)} · ${esc(stage)}</div><p class="mb-0">${esc(advice)}</p></div></div>`;
  aiHistory.unshift({id:'h'+Date.now(),date:today(),kind:'Tư vấn chăm sóc',question:q||`Tư vấn ${f.crop} giai đoạn ${stage}`,result:advice}); saveHistory();
}

function renderAIHistory(){
  const el=document.getElementById('aiHistoryTable');
  el.innerHTML=aiHistory.map(h=>`<tr><td>${esc(h.date)}</td><td><span class="chip ${h.kind==='Chẩn đoán bệnh'?'chip-danger':'chip-info'}">${esc(h.kind)}</span></td><td>${esc(h.question)}</td><td>${esc(h.result)}</td><td><button class="btn btn-sm btn-outline-danger" onclick="deleteAIHistory('${esc(h.id)}')" title="Xóa"><i class="bi bi-trash"></i></button></td></tr>`).join('') || `<tr><td colspan="5">Chưa có lịch sử AI.</td></tr>`;
}
function deleteAIHistory(id){aiHistory=aiHistory.filter(h=>h.id!==id);saveHistory();renderAIHistory();}

function initChat(){
  const box=document.getElementById('aiChatMessages');
  if(box.dataset.ready)return;
  box.dataset.ready='1';
  addChat('ai','Chào bạn! Tôi là AgriSmart AI. Bạn có thể hỏi về sâu bệnh, tưới nước, bón phân hoặc chăm sóc cây trồng.');
  document.getElementById('aiChatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAIChat();}});
}
function addChat(role,text){
  const box=document.getElementById('aiChatMessages');
  const row=document.createElement('div');row.className='chat-msg '+role;
  const bubble=document.createElement('div');bubble.className='chat-bubble';bubble.textContent=text;row.appendChild(bubble);box.appendChild(row);box.scrollTop=box.scrollHeight;
}
function localChat(message){
  const q=norm(message);
  if(/thoi tiet|mua|nhiet do|do am/.test(q)) return 'Nếu thời tiết đang mưa hoặc độ ẩm cao, nên hạn chế phun/bón ngay trước mưa và tăng cường kiểm tra dấu hiệu bệnh nấm.';
  if(/tuoi|nuoc/.test(q)) return 'Hãy kiểm tra độ ẩm đất trước khi tưới, ưu tiên sáng sớm hoặc chiều mát và tránh tưới khi sắp có mưa lớn.';
  if(/bon phan|phan|dam|kali|npk/.test(q)) return 'Nên căn cứ vào cây trồng, giai đoạn sinh trưởng, tình trạng đất và thời tiết trước khi bón. Không nên bón sát thời điểm mưa lớn.';
  if(/benh|sau|ray|nam|vang la|dom/.test(q)) return 'Bạn hãy cho biết loại cây, triệu chứng cụ thể và thời điểm xuất hiện. Nếu có ảnh, hãy chuyển sang tab Chẩn đoán bệnh để kiểm tra thêm.';
  return 'Tôi đã ghi nhận câu hỏi. Để tư vấn sát hơn, hãy nêu loại cây, giai đoạn sinh trưởng và triệu chứng/thời tiết hiện tại.';
}
function sendAIChat(){
  const input=document.getElementById('aiChatInput'); const msg=input.value.trim(); if(!msg)return;
  addChat('user',msg); input.value=''; setTimeout(()=>addChat('ai',localChat(msg)),250);
}

function previewDiagImg(event){const file=event.target.files?.[0]; if(file) loadDiagImage(file);}
function loadDiagImage(file){
  if(!file.type.startsWith('image/')){showDemoToast('Vui lòng chọn tệp ảnh.');return;}
  const reader=new FileReader();reader.onload=e=>{diagImageData=e.target.result;const img=document.getElementById('diagImgPreview');img.src=diagImageData;img.style.display='block';document.getElementById('diagImageMeta').textContent=`${file.name} · ${(file.size/1024).toFixed(0)} KB`;};reader.readAsDataURL(file);
}
function handleDiagDragOver(e){e.preventDefault();document.getElementById('diagDropZone').classList.add('dragover');}
function handleDiagDragLeave(e){document.getElementById('diagDropZone').classList.remove('dragover');}
function handleDiagDrop(e){e.preventDefault();document.getElementById('diagDropZone').classList.remove('dragover');const file=e.dataTransfer.files?.[0];if(file)loadDiagImage(file);}

function toggleTheme(){
  document.body.classList.toggle('dark');
  const dark=document.body.classList.contains('dark');
  try{localStorage.setItem('agrismart_theme',dark?'dark':'light');}catch(e){}
  const icon=document.getElementById('themeIcon');if(icon)icon.className=dark?'bi bi-sun':'bi bi-moon-stars';
}
function showDemoToast(msg){
  const host=document.getElementById('demoToast');host.innerHTML=`<div class="toast show" role="alert"><div class="toast-body">${esc(msg)}</div></div>`;
  setTimeout(()=>host.innerHTML='',2200);
}

document.addEventListener('DOMContentLoaded',()=>{
  if(localStorage.getItem('agrismart_theme')==='dark'){document.body.classList.add('dark');document.getElementById('themeIcon').className='bi bi-sun';}
  fillAdviceFields();
});
