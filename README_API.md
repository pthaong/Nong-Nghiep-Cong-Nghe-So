# AgriSmart - AI Chẩn đoán & Tư vấn (API Ready)

## Cấu trúc
- `index.html`: giao diện module AI
- `style.css`: giao diện
- `script.js`: xử lý giao diện và chức năng
- `api.js`: lớp kết nối API Backend

## API đã chuẩn bị

Base URL mặc định:
`http://localhost:8080/api`

Endpoint dự kiến:
- `POST /api/ai/diagnose` - chẩn đoán bệnh
- `POST /api/ai/advice` - tư vấn chăm sóc
- `POST /api/ai/chat` - chat với AI

## Cách bật API

Trong `api.js` đổi:

```js
ENABLE_API: false
```

thành:

```js
ENABLE_API: true
```

Khi Backend Spring Boot của nhóm có endpoint thực tế, chỉ cần cập nhật `BASE_URL` và endpoint/request body nếu Backend dùng tên khác.

## Lưu ý

Hiện tại `ENABLE_API` để `false` để giao diện vẫn chạy được khi Backend chưa hoàn thiện.
Các chức năng demo hiện tại không bị xóa.
