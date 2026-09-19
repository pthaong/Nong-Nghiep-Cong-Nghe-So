/* AgriSmart Weather Service
 * Live weather via Open-Meteo. Falls back to local demo data if the API is unavailable.
 */
window.AgriWeather = (() => {
  const CACHE_KEY = 'agrismart_weather_cache_v2';
  const CACHE_MS = 10 * 60 * 1000;

  const WMO = {
    0:['Trời quang','bi-sun'], 1:['Trời quang nhẹ','bi-sun'], 2:['Mây rải rác','bi-cloud-sun'], 3:['Nhiều mây','bi-clouds'],
    45:['Sương mù','bi-cloud-fog'], 48:['Sương mù đóng băng','bi-cloud-fog'],
    51:['Mưa phùn nhẹ','bi-cloud-drizzle'], 53:['Mưa phùn','bi-cloud-drizzle'], 55:['Mưa phùn dày','bi-cloud-drizzle'],
    56:['Mưa phùn lạnh nhẹ','bi-cloud-drizzle'], 57:['Mưa phùn lạnh','bi-cloud-drizzle'],
    61:['Mưa nhẹ','bi-cloud-rain'], 63:['Mưa vừa','bi-cloud-rain'], 65:['Mưa to','bi-cloud-rain-heavy'],
    66:['Mưa lạnh nhẹ','bi-cloud-rain'], 67:['Mưa lạnh to','bi-cloud-rain-heavy'],
    71:['Tuyết nhẹ','bi-snow'], 73:['Tuyết vừa','bi-snow'], 75:['Tuyết to','bi-snow'], 77:['Mưa tuyết','bi-snow'],
    80:['Mưa rào nhẹ','bi-cloud-drizzle'], 81:['Mưa rào vừa','bi-cloud-rain'], 82:['Mưa rào to','bi-cloud-rain-heavy'],
    85:['Mưa tuyết rào nhẹ','bi-cloud-snow'], 86:['Mưa tuyết rào to','bi-cloud-snow'],
    95:['Dông','bi-cloud-lightning-rain'], 96:['Dông, mưa đá nhẹ','bi-cloud-hail'], 99:['Dông, mưa đá','bi-cloud-hail']
  };

  function shortName(code){
    return window.getProvinceShortName ? window.getProvinceShortName(code) : '';
  }
  function getCached(code){
    try{
      const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const item = all[code];
      if(item && Date.now()-item.savedAt < CACHE_MS) return item.data;
    }catch(e){}
    return null;
  }
  function setCached(code,data){
    try{
      const all=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
      all[code]={savedAt:Date.now(),data};
      localStorage.setItem(CACHE_KEY,JSON.stringify(all));
    }catch(e){}
  }
  function condition(code){ return WMO[code] || ['Thời tiết thay đổi','bi-cloud-sun']; }
  function dayLabel(date,index){
    if(index===0) return 'Hôm nay';
    const d=new Date(date+'T12:00:00');
    return ['CN','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()];
  }
  function buildAlerts(current,daily){
    const alerts=[];
    const maxRain=Math.max(...(daily.precipitation_probability_max||[0]));
    const maxTemp=Math.max(...(daily.temperature_2m_max||[0]));
    const rainIndex=(daily.precipitation_sum||[]).reduce((m,v)=>Math.max(m,Number(v||0)),0);
    if(maxRain>=80 || rainIndex>=50){
      alerts.push({id:'live-rain',level:'high',title:'Nguy cơ mưa lớn',desc:`Xác suất mưa cao nhất khoảng ${Math.round(maxRain)}%, lượng mưa ngày cao nhất khoảng ${Math.round(rainIndex)}mm. Nên kiểm tra thoát nước và tránh bón/phun ngay trước mưa.`});
    } else if(maxRain>=50){
      alerts.push({id:'live-rain',level:'medium',title:'Khả năng mưa khá cao',desc:`Xác suất mưa cao nhất khoảng ${Math.round(maxRain)}%. Nên bố trí tưới, bón phân và phun thuốc vào thời điểm khô ráo.`});
    }
    if(maxTemp>=35){
      alerts.push({id:'live-heat',level:'medium',title:'Nhiệt độ cao',desc:`Nhiệt độ cao nhất dự báo khoảng ${Math.round(maxTemp)}°C. Theo dõi cây vào trưa và ưu tiên tưới vào sáng sớm/chiều mát.`});
    }
    if(Number(current.relative_humidity_2m)>=85){
      alerts.push({id:'live-humidity',level:'low',title:'Độ ẩm không khí cao',desc:`Độ ẩm hiện tại khoảng ${Math.round(current.relative_humidity_2m)}%, điều kiện thuận lợi cho một số bệnh nấm. Nên tăng tần suất thăm ruộng.`});
    }
    if(!alerts.length){ alerts.push({id:'live-good',level:'low',title:'Thời tiết tương đối ổn định',desc:'Chưa phát hiện ngưỡng thời tiết bất lợi nổi bật trong 7 ngày dự báo.'}); }
    return alerts;
  }
  async function geocode(code){
    const name=shortName(code);
    const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=vi&format=json&countryCode=VN`;
    const r=await fetch(url);
    if(!r.ok) throw new Error('Không thể xác định tọa độ khu vực');
    const data=await r.json();
    if(!data.results?.length) throw new Error('Không tìm thấy tọa độ khu vực');
    const exact=data.results.find(x=>window.normalizeProvinceText?.(x.name)===window.normalizeProvinceText?.(name));
    return exact || data.results[0];
  }
  async function fetchLive(code){
    const cached=getCached(code); if(cached) return {...cached,fromCache:true};
    const place=await geocode(code);
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}`+
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility`+
      `&hourly=precipitation_probability&forecast_hours=24`+
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max`+
      `&forecast_days=7&timezone=Asia%2FBangkok`;
    const r=await fetch(url);
    if(!r.ok) throw new Error('Không lấy được dữ liệu thời tiết');
    const raw=await r.json();
    const c=raw.current, d=raw.daily;
    const currentRainProbability=Number(raw.hourly?.precipitation_probability?.[0] || 0);
    const cond=condition(c.weather_code);
    const forecast=d.time.map((date,i)=>{
      const [label,icon]=condition(d.weather_code[i]);
      return {d:dayLabel(date,i),icon,hi:Math.round(d.temperature_2m_max[i]),lo:Math.round(d.temperature_2m_min[i]),rain:Math.round(d.precipitation_probability_max[i]||0),condition:label,precipitation:Number(d.precipitation_sum[i]||0)};
    });
    const data={
      regionCode:code, region:shortName(code),
      source:'Open-Meteo', updatedAt:new Date().toISOString(),
      current:{temp:Math.round(c.temperature_2m),feels:Math.round(c.apparent_temperature),humidity:Math.round(c.relative_humidity_2m),rain:Math.round(currentRainProbability),wind:Math.round(c.wind_speed_10m),visibility:Math.round((c.visibility||0)/1000),condition:cond[0],weatherCode:c.weather_code},
      forecast, alerts:buildAlerts(c,d)
    };
    setCached(code,data); return data;
  }
  function demoFallback(code){
    const n=parseInt(code||'1',10)||1;
    const base=28+(n%7), rain=(n*7)%70, humidity=65+(n%25), wind=8+(n%15);
    const forecast=[0,1,2,3,4,5,6].map((_,i)=>({d:i===0?'Hôm nay':['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][((i-1)%6)],icon:i<2?'bi-cloud-sun':(i===2?'bi-cloud-rain':'bi-sun'),hi:base+2+(i%3),lo:base-4+(i%2),rain:Math.min(95,rain+i*6),condition:i<2?'Mây rải rác':'Nắng gián đoạn',precipitation:0}));
    return {regionCode:code,region:shortName(code),source:'Dữ liệu demo · chưa kết nối được API',fallback:true,updatedAt:new Date().toISOString(),current:{temp:base,feels:base+2,humidity,rain,wind,visibility:9,condition:'Mây rải rác',weatherCode:2},forecast,alerts:[{id:'demo',level:'low',title:'Đang dùng dữ liệu demo',desc:'Không thể tải dữ liệu thời tiết trực tuyến. Hãy kiểm tra kết nối mạng và bấm Cập nhật để thử lại.'}]};
  }
  async function load(code){
    try{return await fetchLive(code);}catch(error){
      console.warn('Weather live API failed, using demo fallback:',error);
      if(window.DB?.weather && DB.weather.regionCode===code) return {...DB.weather,regionCode:code,region:shortName(code),source:'Dữ liệu demo (API không khả dụng)',fallback:true};
      return demoFallback(code);
    }
  }
  return {load};
})();
