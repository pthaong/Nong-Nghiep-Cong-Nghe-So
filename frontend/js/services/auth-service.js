/* AgriSmart Authentication Service
   Backend API integration:
   POST /api/auth/login
   POST /api/auth/register

   Forgot Password remains mock because
   no backend endpoint has been provided yet.
*/

(function (global) {

  const API_BASE_URL =
    global.APP_CONFIG?.API_BASE_URL ||
    'http://localhost:8080/api';

  async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    let data = null;

    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }

    if (!response.ok) {
      let message = 'Có lỗi xảy ra. Vui lòng thử lại.';

      if (data) {
        if (typeof data.message === 'string') {
          message = data.message;
        } else if (typeof data.error === 'string') {
          message = data.error;
        } else if (typeof data === 'string') {
          message = data;
        }
      }

      throw new Error(message);
    }

    return data;
  }

  // =========================
  // LOGIN
  // POST /api/auth/login
  // =========================
  async function login(data) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });

    return {
      userId: result.userId,
      name: result.name,
      email: result.email,
      role: result.role,
      user: {
        id: result.userId,
        name: result.name,
        email: result.email,
        role: result.role
      }
    };
  }

  // =========================
  // REGISTER
  // POST /api/auth/register
  // =========================
  async function register(data) {
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password
      })
    });

    return {
      userId: result.userId,
      name: result.name,
      email: result.email,
      role: result.role,
      user: {
        id: result.userId,
        name: result.name,
        email: result.email,
        role: result.role
      }
    };
  }

  // =========================
  // FORGOT PASSWORD
  // Backend endpoint chưa có
  // =========================
  async function forgotPassword(email) {
    return {
      success: true,
      email
    };
  }

  global.authService = {
    login,
    register,
    forgotPassword
  };

})(window);