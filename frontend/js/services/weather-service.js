/*
 * AgriSmart Weather Service
 * Tách từ logic Weather của file nguồn, không phụ thuộc DB/app-core.
 * Trách nhiệm:
 * - WMO -> nhãn/icon
 * - Geocoding Open-Meteo
 * - Forecast Open-Meteo
 * - fallback
 * - cảnh báo
 * - gợi ý canh tác
 */

(function(){
  const WMO = {
    0:['Trời quang','bi-sun'],1:['Trời quang nhẹ','bi-sun'],2:['Mây rải rác','bi-cloud-sun'],3:['Nhiều mây','bi-clouds'],
    45:['Sương mù','bi-cloud-fog'],48:['Sương mù','bi-cloud-fog'],51:['Mưa phùn nhẹ','bi-cloud-drizzle'],53:['Mưa phùn','bi-cloud-drizzle'],55:['Mưa phùn dày','bi-cloud-drizzle'],
    56:['Mưa phùn lạnh nhẹ','bi-cloud-drizzle'],57:['Mưa phùn lạnh','bi-cloud-drizzle'],61:['Mưa nhẹ','bi-cloud-rain'],63:['Mưa vừa','bi-cloud-rain'],65:['Mưa to','bi-cloud-rain-heavy'],
    66:['Mưa lạnh nhẹ','bi-cloud-rain'],67:['Mưa lạnh to','bi-cloud-rain-heavy'],71:['Tuyết nhẹ','bi-snow'],73:['Tuyết vừa','bi-snow'],75:['Tuyết to','bi-snow'],77:['Mưa tuyết','bi-snow'],
    80:['Mưa rào nhẹ','bi-cloud-drizzle'],81:['Mưa rào vừa','bi-cloud-rain'],82:['Mưa rào to','bi-cloud-rain-heavy'],95:['Dông','bi-cloud-lightning-rain'],96:['Dông, mưa đá nhẹ','bi-cloud-hail'],99:['Dông, mưa đá','bi-cloud-hail']
  };

  function weatherCondition(code){
    return WMO[code] || ['Thời tiết thay đổi','bi-cloud-sun'];
  }

  function dayLabel(date,i){
    if(i===0) return 'Hôm nay';
    const d = new Date(date+'T12:00:00');
    return ['CN','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()];
  }

  async function geocodeLocation(query){
    const url =
      'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(query) +
      '&count=8&language=vi&format=json';
    const r = await fetch(url);
    if(!r.ok) throw Error('Không tìm thấy khu vực');
    const j = await r.json();
    return j.results || [];
  }

  async function loadWeather(location){
    const {latitude,longitude} = location;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility` +
      `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
      `&forecast_hours=24` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max` +
      `&forecast_days=7&timezone=auto`;

    const r = await fetch(url);
    if(!r.ok) throw Error('Weather API error');

    const raw = await r.json();
    const c = raw.current, d = raw.daily, h = raw.hourly;

    const current = {
      temp:c.temperature_2m,
      feels:c.apparent_temperature,
      humidity:c.relative_humidity_2m,
      rain:h.precipitation_probability?.[0] ?? 0,
      wind:c.wind_speed_10m,
      visibility:(c.visibility||0)/1000,
      condition:weatherCondition(c.weather_code)[0],
      icon:weatherCondition(c.weather_code)[1]
    };

    const forecast = d.time.map((date,i)=>({
      date,
      d:dayLabel(date,i),
      icon:weatherCondition(d.weather_code[i])[1],
      condition:weatherCondition(d.weather_code[i])[0],
      hi:d.temperature_2m_max[i],
      lo:d.temperature_2m_min[i],
      rain:d.precipitation_probability_max[i]||0,
      precip:d.precipitation_sum[i]||0,
      wind:d.wind_speed_10m_max[i]||0
    }));

    const hourly = h.time.slice(0,12).map((t,i)=>({
      time:t,
      temp:h.temperature_2m[i],
      rain:h.precipitation_probability[i]||0,
      wind:h.wind_speed_10m[i]||0,
      icon:weatherCondition(h.weather_code[i])[1],
      condition:weatherCondition(h.weather_code[i])[0]
    }));

    return {
      region:location.name,
      source:'Open-Meteo',
      updatedAt:new Date().toISOString(),
      current,
      forecast,
      hourly,
      coords:{lat:latitude,lon:longitude}
    };
  }

  function fallback(location){
    return {
      region:location.name,
      source:'Dữ liệu mẫu (API chưa khả dụng)',
      updatedAt:new Date().toISOString(),
      current:{
        temp:28,feels:33,humidity:85,rain:96,wind:10,visibility:10,
        condition:'Mưa phùn nhẹ',icon:'bi-cloud-drizzle'
      },
      forecast:[
        {d:'Hôm nay',date:'',icon:'bi-cloud-drizzle',condition:'Mưa phùn',hi:32,lo:25,rain:100,precip:9,wind:18},
        {d:'Thứ 2',date:'',icon:'bi-cloud-drizzle',condition:'Mưa phùn',hi:31,lo:25,rain:97,precip:7,wind:17},
        {d:'Thứ 3',date:'',icon:'bi-cloud-drizzle',condition:'Mưa',hi:31,lo:25,rain:92,precip:8,wind:18},
        {d:'Thứ 4',date:'',icon:'bi-cloud-drizzle',condition:'Mưa',hi:31,lo:25,rain:98,precip:10,wind:19},
        {d:'Thứ 5',date:'',icon:'bi-cloud-drizzle',condition:'Mưa',hi:31,lo:25,rain:87,precip:6,wind:17},
        {d:'Thứ 6',date:'',icon:'bi-cloud-drizzle',condition:'Mưa',hi:31,lo:24,rain:90,precip:7,wind:16},
        {d:'Thứ 7',date:'',icon:'bi-cloud-drizzle',condition:'Mưa',hi:31,lo:25,rain:94,precip:8,wind:18}
      ],
      hourly:[],
      coords:{lat:location.latitude,lon:location.longitude}
    };
  }

  function makeAlerts(d){
    const maxRain=Math.max(...d.forecast.map(x=>x.rain));
    const maxP=Math.max(...d.forecast.map(x=>x.precip));
    const maxT=Math.max(...d.forecast.map(x=>x.hi));
    const a=[];

    if(maxRain>=80 || maxP>=50){
      a.push({
        level:'high',
        title:'Nguy cơ mưa lớn',
        desc:`Xác suất mưa cao nhất ${Math.round(maxRain)}%, lượng mưa ngày cao nhất khoảng ${Math.round(maxP)}mm. Kiểm tra thoát nước và tránh phun/bón ngay trước mưa.`
      });
    }else if(maxRain>=50){
      a.push({
        level:'medium',
        title:'Khả năng mưa khá cao',
        desc:`Xác suất mưa cao nhất ${Math.round(maxRain)}%. Nên bố trí công việc đồng ruộng vào thời điểm khô ráo.`
      });
    }

    if(maxT>=35){
      a.push({
        level:'medium',
        title:'Nhiệt độ cao',
        desc:`Nhiệt độ cao nhất dự báo khoảng ${Math.round(maxT)}°C. Ưu tiên tưới vào sáng sớm hoặc chiều mát.`
      });
    }

    if(d.current.humidity>=85){
      a.push({
        level:'low',
        title:'Độ ẩm không khí cao',
        desc:`Độ ẩm hiện tại khoảng ${Math.round(d.current.humidity)}%, nên tăng tần suất thăm ruộng để phát hiện bệnh nấm.`
      });
    }

    return a.length ? a : [{
      level:'low',
      title:'Thời tiết tương đối ổn định',
      desc:'Chưa phát hiện ngưỡng thời tiết bất lợi nổi bật trong 7 ngày dự báo.'
    }];
  }

  function advice(d){
    const a=[];
    if(Math.max(...d.forecast.map(x=>x.rain))>=60)
      a.push(['bi-droplet','Tưới tiêu','Có mưa trong nhiều ngày: giảm tưới chủ động và ưu tiên kiểm tra khả năng thoát nước.']);
    if(Math.max(...d.forecast.map(x=>x.precip))>=5)
      a.push(['bi-cloud-rain','Phun/bón','Hạn chế phun thuốc hoặc bón phân lá trước thời điểm mưa; chọn khoảng thời gian khô ráo.']);
    if(d.current.humidity>=80)
      a.push(['bi-bug','Theo dõi sâu bệnh','Độ ẩm cao làm tăng nguy cơ bệnh nấm; nên kiểm tra lá và thân thường xuyên.']);
    if(Math.max(...d.forecast.map(x=>x.hi))>=34)
      a.push(['bi-sun','Nắng nóng','Nếu nhiệt độ tăng cao, ưu tiên tưới sáng sớm/chiều mát và theo dõi dấu hiệu stress nước.']);
    if(!a.length)
      a.push(['bi-check-circle','Canh tác','Điều kiện thời tiết hiện tại chưa có cảnh báo nổi bật.']);
    return a;
  }

  window.AgriWeather = {
    geocodeLocation,
    loadWeather,
    fallback,
    makeAlerts,
    advice,
    weatherCondition,
    dayLabel
  };
})();
