/* AgriSmart - Trang Giá nông sản
   Luồng: prices.html -> prices.js -> PriceService -> GET /api/prices

   Mapping field Backend (CommodityPriceResponse):
     commodityType -> Tên nông sản
     price         -> Giá hiện tại
     unit          -> Đơn vị
     updatedAt     -> Thời gian cập nhật
     source        -> Nguồn dữ liệu

   Tăng/giảm: Backend KHÔNG trả giá trước đó (previousPrice/change...) nên
   trang này không hiển thị tăng/giảm và không tự tính/bịa số liệu.
   Không dùng mock data.
*/

(function () {
  'use strict';

  const els = {
    sidebar: document.getElementById('sidebar'),
    backdrop: document.getElementById('sidebarBackdrop'),
    btnSidebar: document.getElementById('btnToggleSidebar'),
    btnTheme: document.getElementById('btnToggleTheme'),
    themeIcon: document.getElementById('themeIcon'),
    btnRefresh: document.getElementById('btnRefresh'),
    btnRetry: document.getElementById('btnRetry'),
    toolbar: document.getElementById('toolbar'),
    summaryCount: document.getElementById('summaryCount'),
    summaryUpdated: document.getElementById('summaryUpdated'),
    searchInput: document.getElementById('searchInput'),
    stateLoading: document.getElementById('stateLoading'),
    stateError: document.getElementById('stateError'),
    stateEmpty: document.getElementById('stateEmpty'),
    stateNoMatch: document.getElementById('stateNoMatch'),
    errorTitle: document.getElementById('errorTitle'),
    errorDesc: document.getElementById('errorDesc'),
    grid: document.getElementById('priceGrid')
  };

  const UNKNOWN_TIME = 'Chưa xác định';
  const priceFormatter = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2
  });

  let allPrices = [];
  let requestSeq = 0;

  /* ---------- Format ---------- */

  function formatPrice(value) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    const number = Number(value);
    return Number.isFinite(number) ? priceFormatter.format(number) : '—';
  }

  function parseDate(value) {
    if (!value) return null;
    // Java LocalDateTime có thể có tới 9 chữ số phần giây; rút còn 3 để mọi trình duyệt parse được.
    const normalized = typeof value === 'string'
      ? value.replace(/(\.\d{3})\d+/, '$1')
      : value;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDateTime(value) {
    const date = parseDate(value);
    if (!date) return UNKNOWN_TIME;

    const pad = function (n) { return String(n).padStart(2, '0'); };

    return pad(date.getDate()) + '/' +
      pad(date.getMonth() + 1) + '/' +
      date.getFullYear() + ' ' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes());
  }

  function textOrDash(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : '—';
  }

  /* ---------- Trạng thái hiển thị ---------- */

  function showOnly(name) {
    els.stateLoading.hidden = name !== 'loading';
    els.stateError.hidden = name !== 'error';
    els.stateEmpty.hidden = name !== 'empty';
    els.stateNoMatch.hidden = name !== 'nomatch';
    els.grid.hidden = name !== 'list';
    els.toolbar.hidden = !(name === 'list' || name === 'nomatch');
  }

  function showError(error) {
    if (error && error.code === 'FALLBACK_ONLY') {
      els.errorTitle.textContent = 'Dữ liệu giá thực tế hiện chưa khả dụng.';
    } else {
      els.errorTitle.textContent = 'Không thể tải dữ liệu giá nông sản.';
    }
    els.errorDesc.textContent = 'Vui lòng thử lại sau.';
    showOnly('error');
  }

  /* ---------- Render (textContent, không dùng innerHTML với dữ liệu API) ---------- */

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function metaRow(iconClass, text) {
    const row = el('div', 'price-meta-row');
    const icon = el('i', 'bi ' + iconClass);
    icon.setAttribute('aria-hidden', 'true');
    row.appendChild(icon);
    row.appendChild(el('span', '', text));
    return row;
  }

  function buildCard(item) {
    const card = el('article', 'price-card');

    const head = el('div', 'price-card-head');
    const iconWrap = el('div', 'price-icon');
    const icon = el('i', 'bi bi-basket3');
    icon.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(icon);
    head.appendChild(iconWrap);
    head.appendChild(el('h2', 'price-name', textOrDash(item.commodityType)));
    card.appendChild(head);

    const value = el('div', 'price-value');
    value.appendChild(el('span', 'price-amount', formatPrice(item.price)));
    if (typeof item.unit === 'string' && item.unit.trim()) {
      value.appendChild(el('span', 'price-unit', item.unit.trim()));
    }
    card.appendChild(value);

    const meta = el('div', 'price-meta');
    meta.appendChild(metaRow('bi-clock', 'Cập nhật: ' + formatDateTime(item.updatedAt)));

    if (typeof item.source === 'string' && item.source.trim()) {
      const row = metaRow('bi-database', 'Nguồn: ');
      row.lastChild.appendChild(el('span', 'chip', item.source.trim()));
      meta.appendChild(row);
    }
    card.appendChild(meta);

    return card;
  }

  function renderList() {
    const keyword = els.searchInput.value.trim().toLowerCase();

    const filtered = allPrices.filter(function (item) {
      return !keyword ||
        String(item.commodityType || '').toLowerCase().includes(keyword);
    });

    els.grid.replaceChildren();

    if (filtered.length === 0) {
      els.summaryCount.textContent = String(allPrices.length);
      showOnly('nomatch');
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(function (item) {
      fragment.appendChild(buildCard(item));
    });
    els.grid.appendChild(fragment);

    els.summaryCount.textContent = String(allPrices.length);
    showOnly('list');
  }

  function updateSummary() {
    const times = allPrices
      .map(function (item) { return parseDate(item.updatedAt); })
      .filter(Boolean)
      .map(function (date) { return date.getTime(); });

    els.summaryUpdated.textContent = times.length
      ? formatDateTime(new Date(Math.max.apply(null, times)))
      : UNKNOWN_TIME;
  }

  /* ---------- Tải dữ liệu ---------- */

  async function loadPrices() {
    const seq = ++requestSeq;

    els.btnRefresh.disabled = true;
    els.btnRetry.disabled = true;
    showOnly('loading');

    try {
      const data = await window.PriceService.getPrices();

      if (seq !== requestSeq) return; // đã có request mới hơn

      allPrices = data.slice().sort(function (a, b) {
        return String(a.commodityType || '').localeCompare(
          String(b.commodityType || ''), 'vi'
        );
      });

      if (allPrices.length === 0) {
        showOnly('empty');
        return;
      }

      updateSummary();
      renderList();
    } catch (error) {
      if (seq !== requestSeq) return;
      console.error('Không tải được giá nông sản:', error);
      allPrices = [];
      showError(error);
    } finally {
      if (seq === requestSeq) {
        els.btnRefresh.disabled = false;
        els.btnRetry.disabled = false;
      }
    }
  }

  /* ---------- Sidebar / theme ---------- */

  function setSidebar(open) {
    els.sidebar.classList.toggle('open', open);
    els.backdrop.classList.toggle('show', open);
    els.btnSidebar.setAttribute('aria-expanded', String(open));
  }

  function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = !current ? (prefersDark ? 'light' : 'dark') : (current === 'dark' ? 'light' : 'dark');
    root.setAttribute('data-theme', next);
    els.themeIcon.className = next === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  }

  function bindEvents() {
    els.btnRefresh.addEventListener('click', loadPrices);
    els.btnRetry.addEventListener('click', loadPrices);
    els.searchInput.addEventListener('input', function () {
      if (allPrices.length) renderList();
    });
    els.btnTheme.addEventListener('click', toggleTheme);
    els.btnSidebar.addEventListener('click', function () {
      setSidebar(!els.sidebar.classList.contains('open'));
    });
    els.backdrop.addEventListener('click', function () { setSidebar(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setSidebar(false);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    loadPrices();
  });

})();
