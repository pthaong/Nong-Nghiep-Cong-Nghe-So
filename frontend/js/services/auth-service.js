/* AgriSmart Authentication Service
 * Mock service layer for the frontend. Replace these implementations with
 * real HTTP requests when the backend authentication API is available.
 */
(function (global) {
  const API_BASE_URL = global.APP_CONFIG?.API_BASE_URL || global.API_BASE_URL || '';

  const wait = (ms = 450) => new Promise(resolve => setTimeout(resolve, ms));

  async function login(data) {
    await wait();
    const users = global.getAgriSmartDB?.()?.users || [];
    const user = users.find(item => item.email.toLowerCase() === data.email.toLowerCase() && item.pass === data.password);
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác.');
    if (user.status === 'locked') throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
    if (data.role === 'admin' && user.role !== 'admin') throw new Error('Tài khoản này không có quyền quản trị viên.');
    return { userId: user.id, role: user.role, user };
  }

  async function register(data) {
    await wait();
    const users = global.getAgriSmartDB?.()?.users || [];
    if (users.some(item => item.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email này đã được sử dụng.');
    }
    const user = {
      id: global.createAgriSmartId ? global.createAgriSmartId('u') : `u${Date.now()}`,
      name: data.name,
      email: data.email,
      pass: data.password,
      role: 'user',
      phone: data.phone,
      regionCode: '',
      status: 'active'
    };
    users.push(user);
    if (global.saveAgriSmartDB) global.saveAgriSmartDB();
    return { user };
  }

  async function forgotPassword(email) {
    await wait();
    return { success: true, email, apiBaseUrl: API_BASE_URL };
  }

  global.authService = { login, register, forgotPassword };
})(window);
