// AgriSmart module: farmer
// Các hàm dưới đây được tách trực tiếp từ app.js đang chạy.
// Module này dùng chung DOM/state của ứng dụng hiện tại.

function populateSeasonSelect(){
  const sel = document.getElementById('fieldSeason');
  sel.innerHTML = '<option value="">— Không thuộc mùa vụ —</option>' + mySeasons().map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function editField(id){ openFieldModal(id); new bootstrap.Modal(document.getElementById('fieldModal')).show(); }

function deleteSeason(id){
  if(!confirm('Xoá mùa vụ này?')) return;
  DB.seasons = DB.seasons.filter(s=>s.id!==id); saveDB(); renderSeasons();
}

function openLogModal(){
  const sel = document.getElementById('logField');
  sel.innerHTML = myFields().map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
  document.getElementById('logDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('logNote').value='';
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
