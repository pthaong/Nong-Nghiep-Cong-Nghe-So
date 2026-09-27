/*
 * AgriSmart Weather UI
 * Tách từ logic Weather của file nguồn.
 * Không phụ thuộc DB/app-core; chỉ làm việc với DOM Weather.
 */

let weatherChartInstance = null;
let WEATHER_DATA = null;
let WEATHER_LOCATION = {name:'Cần Thơ', latitude:10.0452, longitude:105.7469};
let TEMP_UNIT = localStorage.getItem('agrismart_temp_unit') || 'C';
let LOCATION_TIMER = null;

const DEFAULT_LOCATION = {name:'Cần Thơ', latitude:10.0452, longitude:105.7469};

function cToF(c){ return c*9/5+32; }

function tempText(c){
  const v = TEMP_UNIT==='F' ? cToF(c) : c;
  return Math.round(v)+'°'+TEMP_UNIT;
}

function hourLabel(date){
  return new Date(date).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
}

function alertIcon(level){
  return level==='high'
    ? 'bi-exclamation-octagon-fill'
    : level==='medium'
      ? 'bi-exclamation-triangle-fill'
      : 'bi-info-circle-fill';
}

function showSuggestions(items){
  const box=document.getElementById('weatherSuggestions');
  if(!items.length){
    box.innerHTML='<div class="province-no-result">Không tìm thấy tỉnh/thành phố</div>';
    box.classList.add('show');
    return;
  }
  box.innerHTML=items.map((x,i)=>
    `<button type="button" class="province-suggestion" onclick="selectLocation(${i})">
      <i class="bi bi-geo-alt"></i>
      <span>${x.name}</span>
      <small>${x.admin1||x.country||''}</small>
    </button>`
  ).join('');
  box.classList.add('show');
  window.__geoResults=items;
}

function selectLocation(i){
  const x=window.__geoResults?.[i];
  if(!x) return;
  WEATHER_LOCATION={name:x.name,latitude:x.latitude,longitude:x.longitude};
  document.getElementById('weatherLocationInput').value=x.name;
  document.getElementById('weatherSuggestions').classList.remove('show');
  refreshWeather(true);
}

function applyWeatherLocation(){
  const q=document.getElementById('weatherLocationInput').value.trim();
  if(!q) return;
  refreshWeather(true,q);
}

async function useMyLocation(){
  const status=document.getElementById('weatherStatus');

  if(!navigator.geolocation){
    status.innerHTML='<i class="bi bi-exclamation-circle me-1"></i>Trình duyệt không hỗ trợ định vị.';
    return;
  }

  status.innerHTML='<i class="bi bi-hourglass-split me-1"></i>Đang lấy vị trí hiện tại...';

  navigator.geolocation.getCurrentPosition(
    async pos=>{
      WEATHER_LOCATION={
        name:'Vị trí hiện tại',
        latitude:pos.coords.latitude,
        longitude:pos.coords.longitude
      };
      document.getElementById('weatherLocationInput').value='Vị trí hiện tại';
      await refreshWeather(true);
    },
    ()=>{
      status.innerHTML='<i class="bi bi-exclamation-circle me-1"></i>Không lấy được vị trí. Hãy chọn tỉnh/thành phố.';
    },
    {enableHighAccuracy:true,timeout:8000}
  );
}

function renderWeather(d){
  WEATHER_DATA=d;

  document.getElementById('wRegion').textContent=d.region;
  document.getElementById('wTemp').textContent=tempText(d.current.temp);
  document.getElementById('wCondition').textContent=d.current.condition;
  document.getElementById('wFeels').textContent=tempText(d.current.feels);
  document.getElementById('wHumidity').textContent=Math.round(d.current.humidity)+'%';
  document.getElementById('wRain').textContent=Math.round(d.current.rain)+'%';
  document.getElementById('wWind').textContent=Math.round(d.current.wind)+' km/h';
  document.getElementById('wVisibility').textContent=Math.round(d.current.visibility*10)/10+' km';

  document.getElementById('weatherSource').textContent=
    `${d.source} · ${new Date(d.updatedAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`;

  document.getElementById('forecastStrip').innerHTML=d.forecast.map((x,i)=>
    `<button class="forecast-day" onclick="showDayDetail(${i})" type="button">
      <div class="d">${x.d}</div>
      <i class="bi ${x.icon}"></i>
      <div class="fw-semibold" style="font-size:.85rem;">${tempText(x.hi)} / ${tempText(x.lo)}</div>
      <div class="small text-muted2"><i class="bi bi-droplet"></i> ${Math.round(x.rain)}%</div>
    </button>`
  ).join('');

  document.getElementById('hourlyStrip').innerHTML=d.hourly.length
    ? d.hourly.map(x=>
      `<div class="hourly-item">
        <div class="time">${hourLabel(x.time)}</div>
        <i class="bi ${x.icon}"></i>
        <div class="temp">${tempText(x.temp)}</div>
        <div class="small text-muted2"><i class="bi bi-droplet"></i> ${Math.round(x.rain)}%</div>
        <div class="small text-muted2"><i class="bi bi-wind"></i> ${Math.round(x.wind)} km/h</div>
      </div>`
    ).join('')
    : '<div class="small text-muted2">Dữ liệu theo giờ chưa khả dụng.</div>';

  document.getElementById('weatherAlertsFull').innerHTML =
    AgriWeather.makeAlerts(d).map(x=>
      `<div class="alert-x level-${x.level} mb-2">
        <i class="bi ${alertIcon(x.level)}"></i>
        <div>
          <div class="fw-semibold">${x.title}</div>
          <div class="small text-muted2">${x.desc}</div>
        </div>
      </div>`
    ).join('');

  document.getElementById('weatherAdvice').innerHTML =
    AgriWeather.advice(d).map(x=>
      `<div class="weather-advice">
        <i class="bi ${x[0]}"></i>
        <div>
          <div class="fw-semibold">${x[1]}</div>
          <div class="small text-muted2">${x[2]}</div>
        </div>
      </div>`
    ).join('');

  drawChart(d);
}

function drawChart(d){
  const ctx=document.getElementById('weatherChart');
  if(weatherChartInstance) weatherChartInstance.destroy();

  weatherChartInstance=new Chart(ctx,{
    data:{
      labels:d.forecast.map(x=>x.d),
      datasets:[
        {
          type:'line',
          label:'Nhiệt độ cao ('+TEMP_UNIT+')',
          data:d.forecast.map(x=>TEMP_UNIT==='F'?cToF(x.hi):x.hi),
          borderColor:'#E0A23A',
          backgroundColor:'transparent',
          tension:.35,
          yAxisID:'y'
        },
        {
          type:'bar',
          label:'Khả năng mưa (%)',
          data:d.forecast.map(x=>x.rain),
          backgroundColor:'#3B7EA155',
          borderRadius:6,
          yAxisID:'y1'
        }
      ]
    },
    options:{
      responsive:true,
      interaction:{mode:'index',intersect:false},
      scales:{
        y:{position:'left',title:{display:true,text:'°'+TEMP_UNIT}},
        y1:{position:'right',title:{display:true,text:'% mưa'},min:0,max:100,grid:{drawOnChartArea:false}}
      },
      plugins:{legend:{position:'bottom'}}
    }
  });
}

async function refreshWeather(showStatus=true,query=null){
  const btn=document.getElementById('weatherRefreshBtn');

  if(btn){
    btn.disabled=true;
    btn.classList.add('is-loading');
  }

  try{
    if(query){
      document.getElementById('weatherStatus').innerHTML=
        '<i class="bi bi-search me-1"></i>Đang tìm khu vực...';

      const results=await AgriWeather.geocodeLocation(query);
      if(!results.length) throw Error('Không tìm thấy khu vực');

      const x=results[0];

      WEATHER_LOCATION={
        name:x.name,
        latitude:x.latitude,
        longitude:x.longitude
      };

      document.getElementById('weatherLocationInput').value=x.name;
    }

    document.getElementById('weatherStatus').innerHTML=
      '<i class="bi bi-cloud-arrow-down me-1"></i>Đang cập nhật dữ liệu thời tiết...';

    let d;
    try{
      d=await AgriWeather.loadWeather(WEATHER_LOCATION);
    }catch(e){
      console.warn(e);
      d=AgriWeather.fallback(WEATHER_LOCATION);
    }

    localStorage.setItem('agrismart_weather',JSON.stringify(d));
    renderWeather(d);

    document.getElementById('weatherStatus').innerHTML=
      '<i class="bi bi-check-circle me-1"></i>Đã cập nhật thời tiết cho '+d.region+'.';
  }catch(e){
    document.getElementById('weatherStatus').innerHTML=
      '<i class="bi bi-exclamation-circle me-1"></i>'+e.message;
  }finally{
    if(btn){
      btn.disabled=false;
      btn.classList.remove('is-loading');
    }
  }
}

function setTempUnit(unit){
  TEMP_UNIT=unit;
  localStorage.setItem('agrismart_temp_unit',unit);

  document.getElementById('unitC').classList.toggle('active',unit==='C');
  document.getElementById('unitF').classList.toggle('active',unit==='F');

  if(WEATHER_DATA) renderWeather(WEATHER_DATA);
}

function showDayDetail(i){
  if(!WEATHER_DATA) return;

  const d=WEATHER_DATA.forecast[i];

  document.getElementById('weatherDetailTitle').textContent=
    d.d+' · '+d.condition;

  document.getElementById('weatherDetailBody').innerHTML=
    `<div class="row g-3">
      <div class="col-6">
        <div class="small text-muted2">Nhiệt độ cao</div>
        <div class="fs-4 fw-bold">${tempText(d.hi)}</div>
      </div>
      <div class="col-6">
        <div class="small text-muted2">Nhiệt độ thấp</div>
        <div class="fs-4 fw-bold">${tempText(d.lo)}</div>
      </div>
      <div class="col-6">
        <div class="small text-muted2">Khả năng mưa</div>
        <div class="fs-5 fw-bold">${Math.round(d.rain)}%</div>
      </div>
      <div class="col-6">
        <div class="small text-muted2">Lượng mưa</div>
        <div class="fs-5 fw-bold">${Math.round(d.precip*10)/10} mm</div>
      </div>
      <div class="col-12">
        <div class="small text-muted2">Gió tối đa</div>
        <div class="fs-5 fw-bold">${Math.round(d.wind)} km/h</div>
      </div>
    </div>`;

  document.getElementById('weatherDetailModal').classList.add('show');
}

function closeWeatherDetail(){
  document.getElementById('weatherDetailModal').classList.remove('show');
}

function downloadWeatherData(){
  if(!WEATHER_DATA) return;

  const rows=[
    ['Ngày','Nhiệt độ cao','Nhiệt độ thấp','Khả năng mưa','Lượng mưa mm','Gió km/h'],
    ...WEATHER_DATA.forecast.map(x=>[x.d,x.hi,x.lo,x.rain,x.precip,x.wind])
  ];

  const csv='\ufeff'+rows.map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(
    new Blob([csv],{type:'text/csv;charset=utf-8'})
  );
  a.download='du-bao-thoi-tiet.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function toggleTheme(){
  const root=document.documentElement;
  const next=root.getAttribute('data-theme')==='dark'?'light':'dark';

  root.setAttribute('data-theme',next);
  document.getElementById('themeIcon').className=
    next==='dark'?'bi bi-sun':'bi bi-moon-stars';

  localStorage.setItem('agrismart_theme',next);

  if(WEATHER_DATA) drawChart(WEATHER_DATA);
}

document.addEventListener('DOMContentLoaded',async()=>{
  try{
    const saved=localStorage.getItem('agrismart_theme');
    if(saved){
      document.documentElement.setAttribute('data-theme',saved);
      document.getElementById('themeIcon').className=
        saved==='dark'?'bi bi-sun':'bi bi-moon-stars';
    }
  }catch(e){}

  document.getElementById('unitC').classList.toggle('active',TEMP_UNIT==='C');
  document.getElementById('unitF').classList.toggle('active',TEMP_UNIT==='F');

  const input=document.getElementById('weatherLocationInput');

  input.addEventListener('input',()=>{
    clearTimeout(LOCATION_TIMER);
    const q=input.value.trim();

    if(q.length<2){
      document.getElementById('weatherSuggestions').classList.remove('show');
      return;
    }

    LOCATION_TIMER=setTimeout(async()=>{
      try{
        showSuggestions(await AgriWeather.geocodeLocation(q));
      }catch(e){}
    },350);
  });

  input.addEventListener('keydown',e=>{
    if(e.key==='Enter') applyWeatherLocation();
    if(e.key==='Escape')
      document.getElementById('weatherSuggestions').classList.remove('show');
  });

  document.addEventListener('click',e=>{
    if(!e.target.closest('.province-autocomplete'))
      document.getElementById('weatherSuggestions').classList.remove('show');
  });

  const cached=localStorage.getItem('agrismart_weather');
  if(cached){
    try{
      WEATHER_DATA=JSON.parse(cached);
      renderWeather(WEATHER_DATA);
    }catch(e){}
  }

  await refreshWeather(false);
  setInterval(()=>refreshWeather(false),10*60*1000);
});
