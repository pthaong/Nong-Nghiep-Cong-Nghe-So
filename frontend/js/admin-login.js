/* AgriSmart Admin Login
   Gọi POST /api/auth/login (authService.login) và chỉ cho vào khu vực
   Admin khi Backend trả role === "ADMIN".

   Lưu ý: đây là kiểm soát phía frontend theo cơ chế session hiện tại
   (agrismart_session). Nó không thay thế phân quyền ở Backend.
*/
(function (global) {
  'use strict';

  const SESSION_KEY = 'agrismart_session';
  const ADMIN_HOME = 'admin-users.html';
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Backend trả message tiếng Anh cho 2 lỗi đăng nhập thường gặp.
  const KNOWN_MESSAGES = {
    'invalid email or password': 'Email hoặc mật khẩu không đúng.',
    'user account is not active': 'Tài khoản không hoạt động hoặc đã bị khóa.'
  };

  const byId = function (id) { return document.getElementById(id); };

  function isAdmin(session) {
    return !!session && String(session.role || '').toUpperCase() === 'ADMIN';
  }

  function readSession() {
    try {
      const raw =
        global.localStorage.getItem(SESSION_KEY) ||
        global.sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setAlert(message, type) {
    const el = byId('adminLoginAlert');
    el.className = 'auth-alert' + (message ? ' show ' + (type || 'danger') : '');
    el.textContent = message || '';
  }

  function setFieldError(inputId, errorId, message) {
    const input = byId(inputId);
    input.classList.toggle('is-invalid', Boolean(message));
    byId(errorId).textContent = message || '';
    return !message;
  }

  function setLoading(loading) {
    const button = byId('adminLoginSubmit');
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
  }

  function validate() {
    const email = byId('adminEmail').value.trim();
    const password = byId('adminPass').value;

    let emailMessage = '';
    if (!email) emailMessage = 'Email không được để trống.';
    else if (!EMAIL_PATTERN.test(email)) emailMessage = 'Vui lòng nhập email hợp lệ.';

    const emailOk = setFieldError('adminEmail', 'adminEmailError', emailMessage);
    const passOk = setFieldError(
      'adminPass', 'adminPassError',
      password ? '' : 'Mật khẩu không được để trống.'
    );

    return emailOk && passOk;
  }

  function toFriendlyMessage(error) {
    // fetch() ném TypeError khi không kết nối được tới Backend.
    if (error instanceof TypeError) {
      return 'Không kết nối được tới máy chủ. Vui lòng kiểm tra Backend đang chạy.';
    }
    const raw = String((error && error.message) || '').trim();
    if (!raw) return 'Đăng nhập không thành công.';
    return KNOWN_MESSAGES[raw.toLowerCase()] || raw;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setAlert('');

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await global.authService.login({
        email: byId('adminEmail').value.trim(),
        password: byId('adminPass').value
      });

      if (!isAdmin(result)) {
        // Không lưu session: tài khoản này không có quyền Admin.
        setAlert('Tài khoản này không có quyền truy cập khu vực quản trị.');
        return;
      }

      const session = {
        userId: result.userId,
        name: result.name,
        email: result.email,
        role: result.role
      };

      try {
        global.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        global.localStorage.removeItem(SESSION_KEY);
      } catch (_) {
        setAlert('Trình duyệt không cho phép lưu phiên đăng nhập.');
        return;
      }

      global.location.href = ADMIN_HOME;
    } catch (error) {
      setAlert(toFriendlyMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function init() {
    // Đã đăng nhập Admin thì vào thẳng trang quản lý.
    if (isAdmin(readSession())) {
      global.location.replace(ADMIN_HOME);
      return;
    }

    byId('adminLoginForm').addEventListener('submit', handleSubmit);

    ['adminEmail', 'adminPass'].forEach(function (id) {
      byId(id).addEventListener('input', function () { setAlert(''); });
    });

    byId('adminPassToggle').addEventListener('click', function () {
      const input = byId('adminPass');
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      this.innerHTML = '<i class="bi bi-eye' + (visible ? '' : '-slash') + '"></i>';
      this.setAttribute('aria-label', visible ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
    });

    byId('adminEmail').focus();
  }

  init();
})(window);
