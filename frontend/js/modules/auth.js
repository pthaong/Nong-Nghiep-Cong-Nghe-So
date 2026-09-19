// AgriSmart Authentication UI module.
// Uses authService as the single integration point for future backend APIs.
(function (global) {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let activeView = 'login';

  function byId(id) { return document.getElementById(id); }

  function setAlert(id, message, type = 'danger') {
    const el = byId(id);
    if (!el) return;
    el.className = `auth-alert ${message ? `show ${type}` : ''}`;
    el.textContent = message || '';
  }

  function setFieldError(inputId, errorId, message) {
    const input = byId(inputId);
    const error = byId(errorId);
    if (!input || !error) return !message;
    input.classList.toggle('is-invalid', Boolean(message));
    input.classList.toggle('is-valid', !message && input.value.trim() !== '');
    error.textContent = message || '';
    return !message;
  }

  function clearFormState(formId) {
    const form = byId(formId);
    if (!form) return;
    form.querySelectorAll('.is-invalid, .is-valid').forEach(el => el.classList.remove('is-invalid', 'is-valid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => { el.textContent = ''; });
  }

  function setLoading(buttonId, loading) {
    const button = byId(buttonId);
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
  }

  function validateEmail(inputId, errorId) {
    const value = byId(inputId).value.trim();
    if (!value) return setFieldError(inputId, errorId, 'Email không được để trống.');
    if (!EMAIL_PATTERN.test(value)) return setFieldError(inputId, errorId, 'Vui lòng nhập email hợp lệ.');
    return setFieldError(inputId, errorId, '');
  }

  function validateLogin() {
    let valid = validateEmail('loginEmail', 'loginEmailError');
    const password = byId('loginPass').value;
    if (!password) valid = setFieldError('loginPass', 'loginPassError', 'Mật khẩu không được để trống.') && valid;
    else setFieldError('loginPass', 'loginPassError', '');
    return valid;
  }

  function validateRegister() {
    let valid = true;
    const name = byId('registerName').value.trim();
    const phone = byId('registerPhone').value.trim();
    const password = byId('registerPass').value;
    const confirm = byId('registerConfirmPass').value;
    const terms = byId('registerTerms').checked;

    valid = setFieldError('registerName', 'registerNameError', name ? '' : 'Họ và tên không được để trống.') && valid;
    valid = validateEmail('registerEmail', 'registerEmailError') && valid;
    valid = setFieldError('registerPhone', 'registerPhoneError', phone ? '' : 'Số điện thoại không được để trống.') && valid;
    valid = setFieldError('registerPass', 'registerPassError', password.length >= 6 ? '' : 'Mật khẩu phải có ít nhất 6 ký tự.') && valid;
    valid = setFieldError('registerConfirmPass', 'registerConfirmPassError', confirm === password ? '' : 'Mật khẩu xác nhận không trùng khớp.') && valid;
    valid = setFieldError('registerTerms', 'registerTermsError', terms ? '' : 'Bạn cần đồng ý với điều khoản sử dụng.') && valid;
    return valid;
  }

  function validateForgot() {
    return validateEmail('forgotEmail', 'forgotEmailError');
  }

  function selectLoginRole(role) {
    global.loginRole = role;
    document.querySelectorAll('.role-toggle button').forEach(button => button.classList.toggle('active', button.dataset.role === role));
    const hint = byId('demoHintText');
    if (hint) hint.textContent = role === 'admin' ? 'admin@agrismart.vn / admin123' : 'nongdan@agrismart.vn / 123456';
  }

  function showAuthView(view) {
    activeView = view;
    document.querySelectorAll('[data-auth-view]').forEach(section => section.classList.toggle('active', section.dataset.authView === view));
    if (view !== 'forgot') {
      const success = byId('forgotSuccess');
      const formState = byId('forgotFormState');
      if (success) success.classList.remove('show');
      if (formState) formState.style.display = 'block';
    }
    document.querySelector(`#auth${view.charAt(0).toUpperCase() + view.slice(1)}View input`)?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function togglePassword(inputId, button) {
    const input = byId(inputId);
    if (!input) return;
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.innerHTML = `<i class="bi bi-eye${visible ? '' : '-slash'}"></i>`;
    button.setAttribute('aria-label', visible ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
  }

  async function doLogin(event) {
    event.preventDefault();
    setAlert('loginAlert', '');
    if (!validateLogin()) return false;
    setLoading('loginSubmit', true);
    try {
      const result = await global.authService.login({
        email: byId('loginEmail').value.trim(),
        password: byId('loginPass').value,
        role: global.loginRole || 'user'
      });
      global.setAgriSmartSession({ userId: result.userId, role: result.role });
      const remember = byId('rememberLogin')?.checked;
      try {
        if (remember) localStorage.setItem('agrismart_session', JSON.stringify(global.session));
        else localStorage.removeItem('agrismart_session');
      } catch (storageError) { /* Storage is optional for the mock frontend. */ }
      global.enterApp();
    } catch (error) {
      setAlert('loginAlert', error.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading('loginSubmit', false);
    }
    return false;
  }

  async function handleRegister(event) {
    event.preventDefault();
    setAlert('registerAlert', '');
    if (!validateRegister()) return false;
    setLoading('registerSubmit', true);
    try {
      await global.authService.register({
        name: byId('registerName').value.trim(),
        email: byId('registerEmail').value.trim(),
        phone: byId('registerPhone').value.trim(),
        password: byId('registerPass').value
      });
      setAlert('registerAlert', 'Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.', 'success');
      byId('loginEmail').value = byId('registerEmail').value.trim();
      byId('loginPass').value = '';
      byId('registerForm').reset();
      clearFormState('registerForm');
      setTimeout(() => showAuthView('login'), 900);
    } catch (error) {
      setAlert('registerAlert', error.message || 'Không thể tạo tài khoản.');
    } finally {
      setLoading('registerSubmit', false);
    }
    return false;
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setAlert('forgotAlert', '');
    if (!validateForgot()) return false;
    setLoading('forgotSubmit', true);
    try {
      await global.authService.forgotPassword(byId('forgotEmail').value.trim());
      byId('forgotFormState').style.display = 'none';
      byId('forgotSuccess').classList.add('show');
    } catch (error) {
      setAlert('forgotAlert', error.message || 'Không thể gửi yêu cầu.');
    } finally {
      setLoading('forgotSubmit', false);
    }
    return false;
  }

  function logout() {
    global.setAgriSmartSession(null);
    try { localStorage.removeItem('agrismart_session'); } catch (error) { /* optional */ }
    const app = byId('app');
    const login = byId('loginScreen');
    if (app) app.style.display = 'none';
    if (login) login.style.display = 'flex';
    byId('loginPass').value = '';
    setAlert('loginAlert', '');
    showAuthView('login');
  }

  function initAuthUI() {
    byId('loginForm')?.addEventListener('submit', doLogin);
    byId('registerForm')?.addEventListener('submit', handleRegister);
    byId('forgotForm')?.addEventListener('submit', handleForgotPassword);
    ['loginEmail', 'loginPass'].forEach(id => byId(id)?.addEventListener('input', () => setAlert('loginAlert', '')));
    selectLoginRole('user');
    showAuthView(activeView);
  }

  Object.assign(global, { selectLoginRole, showAuthView, togglePassword, doLogin, logout });
  initAuthUI();
})(window);
