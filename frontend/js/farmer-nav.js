/*
 * farmer-nav.js — điều hướng dùng chung cho toàn bộ trang Farmer.
 *
 * Việc script này làm:
 *  1. Trang KHÔNG có sidebar (Hồ sơ, Thông báo, AI/Lịch sử AI, Coming Soon):
 *     chèn thanh điều hướng đầy đủ lên đầu trang.
 *  2. Mọi trang: gắn hành vi "Đăng xuất" (xóa phiên đăng nhập -> trang Login).
 *     Không đổi logic xác thực (auth.js / auth-service.js).
 *
 * Sidebar của các trang có sẵn sidebar được viết tĩnh trong HTML (link thật).
 * Danh sách module dưới đây là nguồn tham chiếu duy nhất cho thanh điều hướng.
 * URL được tính từ vị trí file script này nên đúng với mọi độ sâu thư mục
 * (frontend/pages/*.html và các trang ở thư mục gốc repo).
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script || !script.src) { return; }

  var JS_DIR = new URL('.', script.src);             // .../frontend/js/
  var FRONTEND = new URL('../', JS_DIR);             // .../frontend/
  var PAGES = new URL('pages/', FRONTEND);           // .../frontend/pages/
  var REPO_ROOT = new URL('../', FRONTEND);          // thư mục gốc repo
  var LOGIN_URL = new URL('index.html', FRONTEND).href;
  var CSS_URL = new URL('../css/farmer-nav.css', JS_DIR).href;

  var ITEMS = [
    { key: 'home',      label: 'Trang chủ',            icon: 'bi-house-door',      href: new URL('home.html', PAGES) },
    { key: 'plants',    label: 'Cây trồng',            icon: 'bi-flower2',         href: new URL('index.html', REPO_ROOT) },
    { key: 'seasons',   label: 'Mùa vụ',               icon: 'bi-calendar3-range', href: new URL('seasons.html', PAGES) },
    { key: 'diary',     label: 'Nhật ký canh tác',     icon: 'bi-journal-text',    href: new URL('nhatky-index.html', PAGES) },
    { key: 'weather',   label: 'Thời tiết',            icon: 'bi-cloud-sun',       href: new URL('weather.html', PAGES) },
    { key: 'ai',        label: 'AI chẩn đoán',         icon: 'bi-robot',           href: new URL('aichandoan-index.html', PAGES) },
    { key: 'aihistory', label: 'Lịch sử AI',           icon: 'bi-clock-history',   href: new URL('coming-soon.html?module=ai-history', PAGES) },
    { key: 'knowledge', label: 'Kiến thức nông nghiệp', icon: 'bi-book',            href: new URL('coming-soon.html?module=knowledge', PAGES) },
    { key: 'prices',    label: 'Giá nông sản',         icon: 'bi-graph-up-arrow',  href: new URL('prices.html', PAGES) },
    { key: 'profile',   label: 'Hồ sơ',                icon: 'bi-person-circle',   href: new URL('profile.html', PAGES) },
    { key: 'notification', label: 'Thông báo',         icon: 'bi-bell',            href: new URL('notification.html', PAGES) }
  ];

  function normPath(p) {
    p = p.replace(/\/+$/, '');
    return /\.html?$/i.test(p) ? p : p + '/index.html';
  }

  function isActive(item) {
    var here = window.location;
    if (normPath(here.pathname) !== normPath(item.href.pathname)) { return false; }
    if (item.href.hash) { return here.hash === item.href.hash; }
    if (item.href.search) { return here.search.indexOf(item.href.search.slice(1)) !== -1; }
    return true;
  }

  function ensureStyles() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (/farmer-nav\.css/.test(links[i].getAttribute('href') || '')) { return; }
    }
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = CSS_URL;
    document.head.appendChild(l);
  }

  function ensureIcons() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (/bootstrap-icons/.test(links[i].getAttribute('href') || '')) { return; }
    }
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(l);
  }

  function logout() {
    ['agrismart_session', 'agrismart_token'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
      try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ }
    });
    window.location.href = LOGIN_URL;
  }

  function bindLogout(root) {
    var sel = '[data-farmer-logout], .sidebar-logout, .sidebar-foot button, #btnLogout';
    root.querySelectorAll(sel).forEach(function (btn) {
      if (btn.__fnavLogout) { return; }
      btn.__fnavLogout = true;
      btn.addEventListener('click', function (e) { e.preventDefault(); logout(); });
    });
  }

  function buildTopbar() {
    var bar = document.createElement('header');
    bar.className = 'fnav-topbar';
    bar.setAttribute('data-farmer-nav', 'topbar');

    var links = ITEMS.map(function (it) {
      var active = isActive(it);
      return '<a class="fnav-link' + (active ? ' active' : '') + '" href="' + it.href.href + '"' +
        (active ? ' aria-current="page"' : '') + '><i class="bi ' + it.icon + '"></i><span>' + it.label + '</span></a>';
    }).join('');

    bar.innerHTML =
      '<div class="fnav-bar">' +
        '<a class="fnav-brand" href="' + ITEMS[0].href.href + '"><span class="fnav-dot"></span>AgriSmart</a>' +
        '<button type="button" class="fnav-toggle" aria-label="Mở menu điều hướng" aria-expanded="false">' +
          '<i class="bi bi-list"></i></button>' +
        '<nav class="fnav-menu" aria-label="Điều hướng chính">' + links +
          '<span class="fnav-sep"></span>' +
          '<button type="button" class="fnav-link fnav-logout-top" data-farmer-logout>' +
            '<i class="bi bi-box-arrow-left"></i><span>Đăng xuất</span></button>' +
        '</nav>' +
      '</div>';

    var toggle = bar.querySelector('.fnav-toggle');
    toggle.addEventListener('click', function () {
      var open = bar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    return bar;
  }

  // Trang chủ: nút #menuButton mở sidebar dạng ngăn kéo trên mobile/tablet.
  function setupDrawer() {
    var btn = document.getElementById('menuButton');
    var side = document.getElementById('sidebar');
    if (!btn || !side || document.getElementById('sideMenu')) { return; }
    var backdrop = null;
    function close() {
      side.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      if (backdrop) { backdrop.remove(); backdrop = null; }
    }
    function open() {
      side.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      backdrop = document.createElement('div');
      backdrop.className = 'fnav-drawer-backdrop';
      backdrop.addEventListener('click', close);
      document.body.appendChild(backdrop);
    }
    btn.setAttribute('aria-controls', 'sidebar');
    btn.addEventListener('click', function () { side.classList.contains('open') ? close() : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 992) { close(); } });
  }

  function init() {
    ensureStyles();

    if (!document.getElementById('sidebar')) {
      ensureIcons();
      document.body.insertBefore(buildTopbar(), document.body.firstChild);
    } else {
      // Sidebar có sẵn nhưng chưa có nút đăng xuất (ví dụ trang Giá nông sản).
      var side = document.getElementById('sidebar');
      if (!side.querySelector('.sidebar-foot button, .sidebar-logout, [data-farmer-logout]')) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fnav-logout';
        btn.setAttribute('data-farmer-logout', '');
        btn.innerHTML = '<i class="bi bi-box-arrow-left"></i> Đăng xuất';
        var foot = side.querySelector('.sidebar-foot') || side;
        foot.appendChild(btn);
      }
    }

    setupDrawer();
    bindLogout(document);
    window.addEventListener('hashchange', function () {
      document.querySelectorAll('.fnav-link:not([data-farmer-logout])').forEach(function (a) {
        var on = a.href === window.location.href ||
          (a.hash && a.pathname === window.location.pathname && a.hash === window.location.hash);
        a.classList.toggle('active', !!on);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
