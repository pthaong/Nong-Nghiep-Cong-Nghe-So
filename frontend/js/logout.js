document.addEventListener('DOMContentLoaded', function () {
  const logoutButton = document.querySelector('.sidebar-logout, #btnLogout');

  if (!logoutButton) return;

  logoutButton.addEventListener('click', function () {
    localStorage.removeItem('agrismart_session');
    sessionStorage.removeItem('agrismart_session');
    window.location.href = '../index.html';
  });
});
