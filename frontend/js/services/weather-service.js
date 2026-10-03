
/*
 * AgriSmart Weather Service
 * Backend BE2 cung cấp dữ liệu thời tiết hiện tại.
 * Open-Meteo chỉ cung cấp dữ liệu dự báo bổ sung.
 * Giữ nguyên các hàm công khai để tương thích với FE3.
 */
(function () {
  'use strict';

  const API_BASE = 'http://localhost:8080';

  const WMO = {
    0: ['Trời quang', 'bi-sun'],
    1: ['Trời quang nhẹ', 'bi-sun'],
    2: ['Mây rải rác', 'bi-cloud-sun'],
    3: ['Nhiều mây', 'bi-clouds'],
    45: ['Sương mù', 'bi-cloud-fog'],
    48: ['Sương mù', 'bi-cloud-fog'],
    51: ['Mưa phùn nhẹ', 'bi-cloud-drizzle'],
    53: ['Mưa phùn', 'bi-cloud-drizzle'],
    55: ['Mưa phùn dày', 'bi-cloud-drizzle'],
    56: ['Mưa phùn lạnh nhẹ', 'bi-cloud-drizzle'],
    57: ['Mưa phùn lạnh', 'bi-cloud-drizzle'],
    61: ['Mưa nhẹ', 'bi-cloud-rain'],
    63: ['Mưa vừa', 'bi-cloud-rain'],
    65: ['Mưa to', 'bi-cloud-rain-heavy'],
    66: ['Mưa lạnh nhẹ', 'bi-cloud-rain'],
    67: ['Mưa lạnh to', 'bi-cloud-rain-heavy'],
    71: ['Tuyết nhẹ', 'bi-snow'],
    73: ['Tuyết vừa', 'bi-snow'],
    75: ['Tuyết to', 'bi-snow'],
    77: ['Mưa tuyết', 'bi-snow'],
    80: ['Mưa rào nhẹ', 'bi-cloud-drizzle'],
    81: ['Mưa rào vừa', 'bi-cloud-rain'],
    82: ['Mưa rào to', 'bi-cloud-rain-heavy'],
    95: ['Dông', 'bi-cloud-lightning-rain'],
    96: ['Dông, mưa đá nhẹ', 'bi-cloud-hail'],
    99: ['Dông, mưa đá', 'bi-cloud-hail']
  };

  function weatherCondition(code) {
    return WMO[code] || [
      'Chưa có dữ liệu trạng thái',
      'bi-cloud'
    ];
  }

  function dayLabel(date, i) {
    if (i === 0) return 'Hôm nay';

    const d = new Date(date + 'T12:00:00');

    return [
      'CN', 'Thứ 2', 'Thứ 3', 'Thứ 4',
      'Thứ 5', 'Thứ 6', 'Thứ 7'
    ][d.getDay()];
  }

  const valid = n =>
    typeof n === 'number' && Number.isFinite(n);

  function numberOrNull(n) {
    if (n === null || n === undefined || n === '') {
      return null;
    }

    const value = Number(n);
    return Number.isFinite(value) ? value : null;
  }

  async function geocodeLocation(query) {
    const url =
      'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(query) +
      '&count=8&language=vi&format=json';

    const response = await fetch(url);

    if (!response.ok) {
      throw Error('Không tìm thấy khu vực');
    }

    const data = await response.json();
    return data.results || [];
  }

  // Dự báo bổ sung, không thay thế dữ liệu hiện tại của BE2.
  async function loadForecast(lat, lon) {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'apparent_temperature,visibility,weather_code',
      hourly:
        'temperature_2m,precipitation_probability,' +
        'weather_code,wind_speed_10m',
      forecast_hours: '24',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,' +
        'precipitation_probability_max,precipitation_sum,' +
        'wind_speed_10m_max',
      forecast_days: '7',
      timezone: 'auto'
    });

    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?' + params
    );

    if (!response.ok) {
      throw Error('Không lấy được dự báo bổ sung');
    }

    const raw = await response.json();
    const daily = raw.daily;
    const hours = raw.hourly;

    const forecast = Array.isArray(daily?.time)
      ? daily.time.map((date, i) => ({
          date,
          d: dayLabel(date, i),
          icon: weatherCondition(daily.weather_code?.[i])[1],
          condition: weatherCondition(daily.weather_code?.[i])[0],
          hi: numberOrNull(daily.temperature_2m_max?.[i]),
          lo: numberOrNull(daily.temperature_2m_min?.[i]),
          rain: numberOrNull(
            daily.precipitation_probability_max?.[i]
          ),
          precip: numberOrNull(daily.precipitation_sum?.[i]),
          wind: numberOrNull(daily.wind_speed_10m_max?.[i])
        }))
      : [];

    const hourly = Array.isArray(hours?.time)
      ? hours.time.slice(0, 12).map((time, i) => ({
          time,
          temp: numberOrNull(hours.temperature_2m?.[i]),
          rain: numberOrNull(
            hours.precipitation_probability?.[i]
          ),
          wind: numberOrNull(hours.wind_speed_10m?.[i]),
          icon: weatherCondition(hours.weather_code?.[i])[1],
          condition: weatherCondition(hours.weather_code?.[i])[0]
        }))
      : [];

    const visibility = numberOrNull(
      raw.current?.visibility
    );

    return {
      forecast,
      hourly,
      feels: numberOrNull(
        raw.current?.apparent_temperature
      ),
      visibility:
        visibility === null ? null : visibility / 1000,
      condition: weatherCondition(
        raw.current?.weather_code
      )[0],
      icon: weatherCondition(
        raw.current?.weather_code
      )[1],
      rain: hourly[0]?.rain ?? null
    };
  }

  // API chính: luôn lấy thời tiết hiện tại từ Backend BE2.
  async function loadWeather(location) {
    const name = String(location?.name || '').trim();

    if (!name) {
      throw Error('Vui lòng chọn tỉnh/thành phố');
    }

    if (name === 'Vị trí hiện tại') {
      throw Error(
        'Backend chưa hỗ trợ tìm thời tiết bằng tọa độ. ' +
        'Hãy chọn tỉnh/thành phố.'
      );
    }

    let response;

try {
  const backendLocation = name.trim();

  response = await fetch(
    API_BASE + '/api/weather?location=' +
    encodeURIComponent(backendLocation)
  );
} catch (error) {
      throw Error(
        'Không kết nối được Backend thời tiết tại localhost:8080.'
      );
    }

    if (!response.ok) {
      throw Error(
        'Backend thời tiết trả về lỗi HTTP ' + response.status
      );
    }

    let raw;

    try {
      raw = await response.json();
    } catch (error) {
      throw Error('Dữ liệu Backend không phải JSON hợp lệ');
    }

    const current = raw?.current;

    const temp = numberOrNull(
      current?.temperature_2m
    );
    const humidity = numberOrNull(
      current?.relative_humidity_2m
    );
    const wind = numberOrNull(
      current?.wind_speed_10m
    );
    const lat = numberOrNull(raw?.latitude);
    const lon = numberOrNull(raw?.longitude);

    if (
      !valid(temp) ||
      !valid(humidity) ||
      !valid(wind)
    ) {
      throw Error(
        'Backend thiếu dữ liệu nhiệt độ, độ ẩm hoặc tốc độ gió'
      );
    }

    const result = {
      region: name,
      source: 'Backend BE2',
      updatedAt: new Date().toISOString(),
      current: {
        temp,
        feels: null,
        humidity,
        rain: null,
        wind,
        visibility: null,
        condition: 'Chưa có dữ liệu trạng thái',
        icon: 'bi-cloud'
      },
      forecast: [],
      hourly: [],
      coords: {
        lat,
        lon
      },
      forecastSource: null
    };

    // Open-Meteo không khả dụng vẫn giữ dữ liệu BE2.
    if (valid(lat) && valid(lon)) {
      try {
        const extra = await loadForecast(lat, lon);

        result.forecast = extra.forecast;
        result.hourly = extra.hourly;
        result.current.feels = extra.feels;
        result.current.visibility = extra.visibility;
        result.current.condition = extra.condition;
        result.current.icon = extra.icon;
        result.current.rain = extra.rain;

        result.forecastSource =
          'Open-Meteo (dự báo bổ sung)';

        result.source =
          'Backend BE2 (hiện tại) + Open-Meteo (dự báo)';
      } catch (error) {
        console.warn(
          'Dự báo bổ sung chưa khả dụng:',
          error
        );
      }
    }

    return result;
  }

  // Giữ hàm cũ để tương thích, nhưng không tạo số liệu giả.
  function fallback(location) {
    return {
      region: location?.name || 'Chưa chọn khu vực',
      source: 'Không có dữ liệu (API chưa khả dụng)',
      updatedAt: new Date().toISOString(),
      current: {
        temp: null,
        feels: null,
        humidity: null,
        rain: null,
        wind: null,
        visibility: null,
        condition: 'Chưa có dữ liệu',
        icon: 'bi-cloud'
      },
      forecast: [],
      hourly: [],
      coords: {
        lat: location?.latitude ?? null,
        lon: location?.longitude ?? null
      }
    };
  }

  function makeAlerts(data) {
    const forecast = Array.isArray(data?.forecast)
      ? data.forecast
      : [];

    const values = key =>
      forecast
        .map(item => item[key])
        .filter(valid);

    const max = key => {
      const nums = values(key);
      return nums.length ? Math.max(...nums) : null;
    };

    const rain = max('rain');
    const precip = max('precip');
    const hi = max('hi');
    const alerts = [];

    if (
      (rain !== null && rain >= 80) ||
      (precip !== null && precip >= 50)
    ) {
      alerts.push({
        level: 'high',
        title: 'Nguy cơ mưa lớn',
        desc:
          'Dự báo bổ sung cho thấy nguy cơ mưa cao. ' +
          'Kiểm tra thoát nước và theo dõi dự báo ' +
          'trước khi phun/bón.'
      });
    } else if (rain !== null && rain >= 50) {
      alerts.push({
        level: 'medium',
        title: 'Khả năng mưa khá cao',
        desc:
          'Xác suất mưa cao nhất ' +
          Math.round(rain) +
          '%. Bố trí công việc vào thời điểm khô ráo.'
      });
    }

    if (
      (hi !== null && hi >= 35) ||
      (
        valid(data?.current?.temp) &&
        data.current.temp >= 35
      )
    ) {
      alerts.push({
        level: 'medium',
        title: 'Nhiệt độ cao',
        desc:
          'Nên theo dõi nhu cầu tưới và ưu tiên ' +
          'tưới sáng sớm hoặc chiều mát.'
      });
    }

    if (
      valid(data?.current?.humidity) &&
      data.current.humidity >= 85
    ) {
      alerts.push({
        level: 'low',
        title: 'Độ ẩm không khí cao',
        desc:
          'Độ ẩm hiện tại ' +
          Math.round(data.current.humidity) +
          '%; nên tăng tần suất kiểm tra bệnh nấm.'
      });
    }

    if (alerts.length) return alerts;

    return [{
      level: 'low',
      title: forecast.length
        ? 'Chưa ghi nhận cảnh báo theo ngưỡng'
        : 'Chưa có dữ liệu dự báo để đánh giá',
      desc: forecast.length
        ? 'Chưa có chỉ số vượt ngưỡng cảnh báo tự động; ' +
          'tiếp tục theo dõi thời tiết.'
        : 'Backend chỉ cung cấp thời tiết hiện tại; ' +
          'chưa thể đánh giá rủi ro trong 7 ngày.'
    }];
  }

  function advice(data) {
    const forecast = Array.isArray(data?.forecast)
      ? data.forecast
      : [];

    const max = key => {
      const nums = forecast
        .map(item => item[key])
        .filter(valid);

      return nums.length ? Math.max(...nums) : null;
    };

    const recommendations = [];

    if (
      max('rain') !== null &&
      max('rain') >= 60
    ) {
      recommendations.push([
        'bi-droplet',
        'Tưới tiêu',
        'Dự báo có khả năng mưa: theo dõi trước ' +
        'khi quyết định giảm tưới.'
      ]);
    }

    if (
      max('precip') !== null &&
      max('precip') >= 5
    ) {
      recommendations.push([
        'bi-cloud-rain',
        'Phun/bón',
        'Theo dõi thời điểm mưa trước khi phun ' +
        'thuốc hoặc bón phân lá.'
      ]);
    }

    if (
      valid(data?.current?.humidity) &&
      data.current.humidity >= 80
    ) {
      recommendations.push([
        'bi-bug',
        'Theo dõi sâu bệnh',
        'Độ ẩm cao: nên kiểm tra lá và thân thường xuyên.'
      ]);
    }

    if (
      (
        max('hi') !== null &&
        max('hi') >= 34
      ) ||
      (
        valid(data?.current?.temp) &&
        data.current.temp >= 34
      )
    ) {
      recommendations.push([
        'bi-sun',
        'Nắng nóng',
        'Ưu tiên tưới sáng sớm/chiều mát và ' +
        'theo dõi dấu hiệu thiếu nước.'
      ]);
    }

    if (!recommendations.length) {
      recommendations.push([
        'bi-info-circle',
        'Theo dõi thời tiết',
        'Chưa có khuyến nghị theo ngưỡng ' +
        'từ các chỉ số hiện có.'
      ]);
    }

    return recommendations;
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
