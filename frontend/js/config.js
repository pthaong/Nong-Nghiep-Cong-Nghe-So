/* Frontend runtime configuration.
 * For the current static frontend this is intentionally secret-free.
 * Set API_BASE_URL here when the backend is available, or inject APP_CONFIG
 * before loading auth-service.js in a deployment pipeline.
 */
window.APP_CONFIG = window.APP_CONFIG || {
  API_BASE_URL: ''
};
