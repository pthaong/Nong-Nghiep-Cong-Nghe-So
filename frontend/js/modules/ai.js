// AgriSmart module: ai
// Các hàm dưới đây được tách trực tiếp từ app.js đang chạy.
// Module này dùng chung DOM/state của ứng dụng hiện tại.

function switchAITab(tab){
  currentAITab = tab;
  document.querySelectorAll('.ai-tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('aitab-diag').style.display = tab==='diag' ? 'block':'none';
  document.getElementById('aitab-advice').style.display = tab==='advice' ? 'block':'none';
  document.getElementById('aitab-history').style.display = tab==='history' ? 'block':'none';
  if(tab==='advice'){
    document.getElementById('adviceField').innerHTML = myFields().map(f=>`<option value="${f.id}">${f.name} (${f.crop})</option>`).join('') || '<option value="">Chưa có ruộng nào</option>';
  }
  if(tab==='history') renderAIHistory();
}

function renderAI(){ switchAITab(currentAITab); }

function deleteAIHistory(id){
  DB.aiHistory = DB.aiHistory.filter(h=>h.id!==id); saveDB(); renderAIHistory();
}

function renderAdminAI(){
  document.getElementById('adminAITable').innerHTML = DB.aiHistory.map(h=>{
    const owner = DB.users.find(u=>u.id===h.ownerId);
    return `<tr><td>${h.date}</td><td>${owner?owner.name:'—'}</td><td><span class="chip ${h.kind==='Chẩn đoán bệnh'?'chip-danger':'chip-info'}">${h.kind}</span></td><td>${h.question}</td><td>${h.result}</td></tr>`;
  }).join('') || `<tr><td colspan="5">${emptyHTML('Chưa có lịch sử AI nào.')}</td></tr>`;
}
