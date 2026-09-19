// AgriSmart module: weather
// Các hàm dưới đây được tách trực tiếp từ app.js đang chạy.
// Module này dùng chung DOM/state của ứng dụng hiện tại.

function renderPage(p){
  if(p==='home') renderHome();
  else if(p==='crops') renderCrops();
  else if(p==='seasons') renderSeasons();
  else if(p==='log') renderLogs();
  else if(p==='weather') renderWeather();
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

function alertIcon(level){
  if(level==='high') return 'bi-exclamation-octagon-fill';
  if(level==='medium') return 'bi-exclamation-triangle-fill';
  return 'bi-info-circle-fill';
}

function renderWeather(){
  const w = DB.weather;
  document.getElementById('wRegion').textContent = w.region;
  document.getElementById('wTemp').textContent = w.current.temp+'°C';
  document.getElementById('wCondition').textContent = w.current.condition;
  document.getElementById('wFeels').textContent = w.current.feels+'°C';
  document.getElementById('wHumidity').textContent = w.current.humidity+'%';
  document.getElementById('wRain').textContent = w.current.rain+'%';
  document.getElementById('wWind').textContent = w.current.wind+' km/h';
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
