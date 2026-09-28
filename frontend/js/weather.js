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


function tempText(c) {
  if (typeof c !== 'number' || !Number.isFinite(c)) {
    return '—';
  }

  const v = TEMP_UNIT === 'F' ? cToF(c) : c;
  return Math.round(v) + '°' + TEMP_UNIT;
}

function weatherNumber(value, suffix = '', decimals = 0) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return value.toFixed(decimals) + suffix;
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
  document.getElementById('wHumidity').textContent =
  weatherNumber(d.current.humidity, '%');
 document.getElementById('wRain').textContent =
  weatherNumber(d.current.rain, '%');
  document.getElementById('wWind').textContent =
  weatherNumber(d.current.wind, ' km/h');
  document.getElementById('wVisibility').textContent =
  weatherNumber(d.current.visibility, ' km', 1);

  document.getElementById('weatherSource').textContent=
    `${d.source} · ${new Date(d.updatedAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`;
const forecast = Array.isArray(d.forecast)
  ? d.forecast
  : [];
document.getElementById('forecastStrip').innerHTML =
  forecast.length
    ? forecast.map((x, i) => `
        <button
          class="forecast-day"
          onclick="showDayDetail(${i})"
          type="button"
        >
          <div class="d">${x.d}</div>
          <i class="bi ${x.icon || 'bi-cloud'}"></i>
          <div class="fw-semibold" style="font-size:.85rem;">
            ${tempText(x.hi)} / ${tempText(x.lo)}
          </div>
          <div class="small text-muted2">
            <i class="bi bi-droplet"></i>
            ${weatherNumber(x.rain, '%')}
          </div>
        </button>
      `).join('')
    : '<div class="small text-muted2">' +
      'Dự báo 7 ngày hiện chưa khả dụng.' +
      '</div>';

const hourly = Array.isArray(d.hourly)
  ? d.hourly
  : [];

document.getElementById('hourlyStrip').innerHTML =
  hourly.length
    ? hourly.map(x => `
        <div class="hourly-item">
          <div class="time">${hourLabel(x.time)}</div>
          <i class="bi ${x.icon || 'bi-cloud'}"></i>
          <div class="temp">${tempText(x.temp)}</div>
          <div class="small text-muted2">
            <i class="bi bi-droplet"></i>
            ${weatherNumber(x.rain, '%')}
          </div>
          <div class="small text-muted2">
            <i class="bi bi-wind"></i>
            ${weatherNumber(x.wind, ' km/h')}
          </div>
        </div>
      `).join('')
    : '<div class="small text-muted2">' +
      'Dữ liệu theo giờ hiện chưa khả dụng.' +
      '</div>';


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


function drawChart(d) {
  const ctx = document.getElementById('weatherChart');

  if (!ctx) return;

  // Xóa biểu đồ cũ trước khi vẽ biểu đồ mới.
  if (weatherChartInstance) {
    weatherChartInstance.destroy();
    weatherChartInstance = null;
  }

  const forecast = Array.isArray(d?.forecast)
    ? d.forecast
    : [];

  // Không có dự báo thì không tạo biểu đồ trống.
  if (!forecast.length) {
    ctx.style.display = 'none';

    let message = document.getElementById(
      'weatherChartEmpty'
    );

    if (!message) {
      message = document.createElement('div');
      message.id = 'weatherChartEmpty';
      message.className =
        'small text-muted2 text-center py-4';

      ctx.parentElement.appendChild(message);
    }

    message.textContent =
      'Biểu đồ chưa khả dụng vì chưa có dữ liệu dự báo.';

    message.style.display = 'block';
    return;
  }

  // Có dữ liệu thì hiển thị lại biểu đồ.
  ctx.style.display = '';

  const message = document.getElementById(
    'weatherChartEmpty'
  );

  if (message) {
    message.style.display = 'none';
  }

  // Nếu thư viện Chart.js chưa tải, thông báo thay vì lỗi.
  if (typeof Chart === 'undefined') {
    ctx.style.display = 'none';

    if (message) {
      message.textContent =
        'Không tải được thư viện biểu đồ Chart.js.';
      message.style.display = 'block';
    }

    return;
  }

  weatherChartInstance = new Chart(ctx, {
    data: {
      labels: forecast.map(x => x.d),
      datasets: [
        {
          type: 'line',
          label: 'Nhiệt độ cao (' + TEMP_UNIT + ')',
          data: forecast.map(x => {
            if (
              typeof x.hi !== 'number' ||
              !Number.isFinite(x.hi)
            ) {
              return null;
            }

            return TEMP_UNIT === 'F'
              ? cToF(x.hi)
              : x.hi;
          }),
          borderColor: '#E0A23A',
          backgroundColor: 'transparent',
          tension: 0.35,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'Khả năng mưa (%)',
          data: forecast.map(x => {
            return typeof x.rain === 'number' &&
              Number.isFinite(x.rain)
              ? x.rain
              : null;
          }),
          backgroundColor: '#3B7EA155',
          borderRadius: 6,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          position: 'left',
          title: {
            display: true,
            text: '°' + TEMP_UNIT
          }
        },
        y1: {
          position: 'right',
          title: {
            display: true,
            text: '% mưa'
          },
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}


async function refreshWeather(showStatus = true, query = null) {
  const btn = document.getElementById('weatherRefreshBtn');
  const status = document.getElementById('weatherStatus');

  if (btn) {
    btn.disabled = true;
    btn.classList.add('is-loading');
  }

  try {
    if (query) {
      status.textContent = 'Đang tìm khu vực...';

      const results = await AgriWeather.geocodeLocation(query);

      if (!results.length) {
        throw new Error('Không tìm thấy khu vực.');
      }

      const x = results[0];

      WEATHER_LOCATION = {
        name: x.name,
        latitude: x.latitude,
        longitude: x.longitude
      };

      document.getElementById('weatherLocationInput').value =
        x.name;
    }

    status.textContent =
      'Đang lấy dữ liệu thời tiết từ Backend...';

    // Không dùng fallback khi Backend lỗi.
    const data = await AgriWeather.loadWeather(
      WEATHER_LOCATION
    );

    if (
      !data ||
      !data.current ||
      typeof data.current.temp !== 'number'
    ) {
      throw new Error(
        'Backend trả về dữ liệu thời tiết không hợp lệ.'
      );
    }

    // Chỉ lưu dữ liệu khi Backend thực sự thành công.
    localStorage.setItem(
      'agrismart_weather',
      JSON.stringify(data)
    );

    renderWeather(data);

    status.textContent =
      'Đã cập nhật thời tiết cho ' +
      data.region +
      ' từ Backend BE2.' +
      (
        data.forecast.length
          ? ' Dự báo bổ sung từ Open-Meteo.'
          : ' Dự báo nhiều ngày hiện chưa khả dụng.'
      );

  } catch (error) {
    console.error('Lỗi cập nhật thời tiết:', error);

    status.textContent =
      'Không cập nhật được thời tiết: ' +
      (
        error.message ||
        'Vui lòng kiểm tra kết nối Backend.'
      );

    // Không ghi dữ liệu giả vào bộ nhớ.
    // Nếu đã có dữ liệu cũ trên màn hình, giữ nguyên
    // nhưng không thông báo là vừa cập nhật thành công.

  } finally {
    if (btn) {
      btn.disabled = false;
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


function showDayDetail(i) {
  const d = WEATHER_DATA?.forecast?.[i];

  if (!d) {
    document.getElementById('weatherStatus').textContent =
      'Chưa có dữ liệu chi tiết cho ngày này.';
    return;
  }

  document.getElementById('weatherDetailTitle').textContent =
    (d.d || 'Dự báo') + ' · ' +
    (d.condition || 'Chưa có trạng thái thời tiết');

  document.getElementById('weatherDetailBody').innerHTML = `
    <div class="row g-3">
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
        <div class="fs-5 fw-bold">
          ${weatherNumber(d.rain, '%')}
        </div>
      </div>

      <div class="col-6">
        <div class="small text-muted2">Lượng mưa</div>
        <div class="fs-5 fw-bold">
          ${weatherNumber(d.precip, ' mm', 1)}
        </div>
      </div>

      <div class="col-12">
        <div class="small text-muted2">Gió tối đa</div>
        <div class="fs-5 fw-bold">
          ${weatherNumber(d.wind, ' km/h')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('weatherDetailModal')
    .classList.add('show');
}


function closeWeatherDetail(){
  document.getElementById('weatherDetailModal').classList.remove('show');
}


function downloadWeatherData() {
  const forecast = WEATHER_DATA?.forecast;

  // Không xuất file nếu chưa có dữ liệu dự báo.
  if (!Array.isArray(forecast) || !forecast.length) {
    document.getElementById('weatherStatus').textContent =
      'Chưa có dữ liệu dự báo để xuất CSV.';
    return;
  }

  const csvValue = value => {
    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
    ) {
      return '';
    }

    return value;
  };

  const rows = [
    [
      'Ngày',
      'Nhiệt độ cao (°C)',
      'Nhiệt độ thấp (°C)',
      'Khả năng mưa (%)',
      'Lượng mưa (mm)',
      'Gió (km/h)'
    ],
    ...forecast.map(x => [
      x.date || x.d || '',
      csvValue(x.hi),
      csvValue(x.lo),
      csvValue(x.rain),
      csvValue(x.precip),
      csvValue(x.wind)
    ])
  ];

  const csv = '\ufeff' +
    rows.map(row => row.join(',')).join('\r\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'du-bao-thoi-tiet.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
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
// Chỉ hiển thị dữ liệu đã lấy thành công từ Backend BE2.
try {
  const cached = localStorage.getItem('agrismart_weather');
  if (cached) {
    const saved = JSON.parse(cached);
    const isBackendData =
      saved &&
      typeof saved.source === 'string' &&
      saved.source.includes('Backend BE2') &&
      saved.current &&
      typeof saved.current.temp === 'number' &&
      Number.isFinite(saved.current.temp) &&
      Array.isArray(saved.forecast) &&
      Array.isArray(saved.hourly);
    if (isBackendData) {
      renderWeather(saved);
      document.getElementById('weatherStatus').textContent =
        'Đang hiển thị dữ liệu đã lưu từ ' +
        saved.region +
        '. Đang kiểm tra bản cập nhật mới...';
    } else {
      // Chỉ xóa bộ nhớ đệm thời tiết không hợp lệ.
      localStorage.removeItem('agrismart_weather');
    }
  }
} catch (error) {
  console.warn('Bộ nhớ đệm thời tiết không hợp lệ:', error);
  localStorage.removeItem('agrismart_weather');
}

await refreshWeather(false);
setInterval(() => refreshWeather(false), 10 * 60 * 1000);
});
