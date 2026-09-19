// AgriSmart module: products
// Các hàm dưới đây được tách trực tiếp từ app.js đang chạy.
// Module này dùng chung DOM/state của ứng dụng hiện tại.

function priceRowHTML(p){
  const up = p.change>0, flat = p.change===0;
  const cls = flat? '' : (up?'up':'down');
  const icon = flat? 'bi-dash' : (up?'bi-arrow-up-short':'bi-arrow-down-short');
  return `<div class="price-row"><div><div class="fw-semibold" style="font-size:.87rem;">${p.crop}</div><div class="small text-muted2">${p.unit}</div></div>
    <div class="text-end"><div class="fw-semibold">${p.price.toLocaleString('vi-VN')}đ</div><div class="small price-change ${cls}"><i class="bi ${icon}"></i>${Math.abs(p.change)}%</div></div></div>`;
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

function deleteField(id){
  if(!confirm('Xoá ruộng này khỏi danh sách quản lý?')) return;
  DB.fields = DB.fields.filter(f=>f.id!==id);
  saveDB(); renderCrops(); renderHome();
}

function openSeasonModal(){
  document.getElementById('seasonName').value='';
  document.getElementById('seasonCrop').value='';
  document.getElementById('seasonStart').value='';
  document.getElementById('seasonEnd').value='';
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

function renderPrices(){
  document.getElementById('pricesTableFull').innerHTML = DB.prices.map(p=>{
    const up=p.change>0, flat=p.change===0;
    const cls = flat?'':(up?'up':'down');
    const icon = flat?'bi-dash':(up?'bi-arrow-up-short':'bi-arrow-down-short');
    return `<tr><td class="fw-semibold">${p.crop}</td><td>${p.price.toLocaleString('vi-VN')}</td><td>${p.unit}</td><td class="price-change ${cls}"><i class="bi ${icon}"></i>${Math.abs(p.change)}%</td></tr>`;
  }).join('');
  const ctx = document.getElementById('priceChart');
  if(priceChartInstance) priceChartInstance.destroy();
  const styles = getComputedStyle(document.documentElement);
  priceChartInstance = new Chart(ctx,{
    type:'bar',
    data:{labels:DB.prices.map(p=>p.crop), datasets:[{label:'Giá (đ)', data:DB.prices.map(p=>p.price), backgroundColor: styles.getPropertyValue('--rice').trim()||'#5C9457', borderRadius:8}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{grid:{color:styles.getPropertyValue('--border').trim()}}, x:{grid:{display:false}}}}
  });
}

function updatePrice(i,v){ DB.prices[i].price = parseFloat(v)||0; saveDB(); }

function updatePriceChange(i,v){ DB.prices[i].change = parseFloat(v)||0; saveDB(); }
