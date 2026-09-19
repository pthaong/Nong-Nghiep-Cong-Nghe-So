/* Authentication service layer.
   Current mode: mock/localStorage so the frontend can run without a backend.
   Backend preparation: when API_BASE_URL is configured, these methods can be
   switched to fetch() requests without changing the UI module.
*/
(function (global) {
  const API_BASE_URL = global.APP_CONFIG?.API_BASE_URL || '';

  const DEMO_USERS = [
    {
      id: 'u1',
      name: 'Nguyễn Văn Nông',
      email: 'nongdan@agrismart.vn',
      phone: '0900000000',
      password: '123456',
      role: 'user',
      status: 'active'
    },
    {
      id: 'admin1',
      name: 'Quản trị viên',
      email: 'admin@agrismart.vn',
      phone: '0900000001',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    }
  ];

  const STORAGE_KEY = 'agrismart_auth_users';
  const wait = (ms = 450) => new Promise(resolve => setTimeout(resolve, ms));

  function getUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USERS));
    } catch (_) {}
    return DEMO_USERS.map(user => ({ ...user }));
  }

  function saveUsers(users) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); } catch (_) {}
  }

  async function login(data) {
    // Future backend:
    // return request('/auth/login', { method: 'POST', body: data });
    await wait();
    const users = getUsers();
    const user = users.find(item =>
      item.email.toLowerCase() === data.email.toLowerCase() &&
      item.password === data.password
    );

    if (!user) throw new Error('Email hoặc mật khẩu không chính xác.');
    if (user.status === 'locked') {
      throw new Error('Tài khoản của bạn đã bị khóa.');
    }
    if (data.role === 'admin' && user.role !== 'admin') {
      throw new Error('Tài khoản này không có quyền quản trị viên.');
    }

    return { userId: user.id, role: user.role, user };
  }

  async function register(data) {
    // Future backend: POST /auth/register
    await wait();
    const users = getUsers();

    if (users.some(item => item.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email này đã được sử dụng.');
    }

    const user = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'user',
      status: 'active'
    };

    users.push(user);
    saveUsers(users);
    return { user };
  }

  async function forgotPassword(email) {
    // Future backend: POST /auth/forgot-password
    await wait();
    return { success: true, email, apiBaseUrl: API_BASE_URL };
  }

  global.authService = { login, register, forgotPassword };
})(window);
