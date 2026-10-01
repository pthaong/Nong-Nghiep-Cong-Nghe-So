/* AgriSmart - AI Care Service
   BE2 API thật: POST /api/ai-care
   Request : { plantType, growthStage, problem }
   Response: { success, plantType, growthStage, watering, fertilizer, care, diseasePrevention }
*/
(function (global) {
  const API_BASE_URL = global.APP_CONFIG?.API_BASE_URL || 'http://localhost:8080/api';
  const TIMEOUT_MS = 60000; // AI (Gemini) có thể phản hồi chậm

  class AiCareError extends Error {
    constructor(kind, status) {
      super(kind);
      this.kind = kind;     // 'http' | 'network' | 'timeout' | 'invalid'
      this.status = status; // HTTP status nếu có
    }
  }

  async function getAdvice({ plantType, growthStage, problem }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;

    try {
      response = await fetch(`${API_BASE_URL}/ai-care`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantType, growthStage, problem }),
        signal: controller.signal
      });
    } catch (err) {
      throw new AiCareError(err.name === 'AbortError' ? 'timeout' : 'network');
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) throw new AiCareError('http', response.status);

    let data = null;
    try { data = await response.json(); } catch (_) { /* handled below */ }
    if (!data || typeof data !== 'object' || data.success === false) {
      throw new AiCareError('invalid', response.status);
    }
    return data;
  }

  global.aiCareService = { getAdvice };
})(window);
