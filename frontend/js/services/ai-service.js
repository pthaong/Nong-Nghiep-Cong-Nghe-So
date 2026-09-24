/**
 * AgriSmart - AI API Layer
 * API-ready: Backend Spring Boot có thể dùng các endpoint dưới đây.
 * Hiện tại mặc định API chưa bật, nên giao diện vẫn có thể chạy bằng dữ liệu demo.
 */

const API_CONFIG = {
    BASE_URL: "http://localhost:8080/api",
    ENABLE_API: false
};

async function callAIAPI(endpoint, data) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Chẩn đoán bệnh cây
 * Backend dự kiến: POST /api/ai/diagnose
 */
async function apiDiagnose(data) {
    return callAIAPI("/ai/diagnose", data);
}

/**
 * Tư vấn chăm sóc
 * Backend dự kiến: POST /api/ai/advice
 */
async function apiAdvice(data) {
    return callAIAPI("/ai/advice", data);
}

/**
 * Chat với AI
 * Backend dự kiến: POST /api/ai/chat
 */
async function apiChat(data) {
    return callAIAPI("/ai/chat", data);
}

/**
 * Bật API khi Backend đã sẵn sàng:
 * API_CONFIG.ENABLE_API = true;
 */