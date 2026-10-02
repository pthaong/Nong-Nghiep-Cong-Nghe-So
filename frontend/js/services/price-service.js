/* AgriSmart Price Service
   Backend API integration:
   GET /api/prices   -> List<CommodityPriceResponse>
     { id, commodityType, price, unit, updatedAt, source }

   Service chỉ chịu trách nhiệm: gọi API, kiểm tra HTTP status,
   parse JSON, kiểm tra dữ liệu hợp lệ và ném lỗi có mã rõ ràng.
   Không có dữ liệu mock trong file này.
*/

(function (global) {
  'use strict';

  const REQUEST_TIMEOUT_MS = 15000;
  const FALLBACK_SOURCE = 'fallback/sample';

  function getBaseUrl() {
    const base =
      (global.APP_CONFIG && global.APP_CONFIG.API_BASE_URL) ||
      'http://localhost:8080/api';

    // Bỏ dấu "/" cuối để không tạo URL dạng ".../api//prices"
    return String(base).replace(/\/+$/, '');
  }

  function createError(code, message, extra) {
    const error = new Error(message);
    error.code = code;
    return Object.assign(error, extra || {});
  }

  function isFallbackItem(item) {
    return !!item &&
      typeof item.source === 'string' &&
      item.source.trim().toLowerCase() === FALLBACK_SOURCE;
  }

  /**
   * Lấy danh sách giá nông sản từ Backend.
   * @param {{commodityType?: string, signal?: AbortSignal}} [options]
   * @returns {Promise<Array>} mảng CommodityPriceResponse (giữ nguyên tên field Backend)
   */
  async function getPrices(options) {
    const opts = options || {};

    let url = getBaseUrl() + '/prices';

    if (opts.commodityType && String(opts.commodityType).trim()) {
      url += '?commodityType=' +
        encodeURIComponent(String(opts.commodityType).trim());
    }

    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    let response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
    } catch (cause) {
      throw createError(
        'NETWORK',
        'Không kết nối được tới Backend.',
        { cause: cause }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw createError(
        'HTTP',
        'Backend trả về lỗi HTTP ' + response.status + '.',
        { status: response.status }
      );
    }

    let data;

    try {
      data = await response.json();
    } catch (cause) {
      throw createError(
        'INVALID_JSON',
        'Dữ liệu Backend trả về không phải JSON hợp lệ.',
        { cause: cause }
      );
    }

    if (!Array.isArray(data)) {
      throw createError(
        'INVALID_SHAPE',
        'Backend không trả về danh sách giá nông sản.'
      );
    }

    // Dữ liệu fallback/sample không phải dữ liệu thật -> loại bỏ.
    const realItems = data.filter(function (item) {
      return item && typeof item === 'object' && !isFallbackItem(item);
    });

    if (data.length > 0 && realItems.length === 0) {
      throw createError(
        'FALLBACK_ONLY',
        'Dữ liệu giá thực tế hiện chưa khả dụng.'
      );
    }

    return realItems;
  }

  global.PriceService = {
    getPrices: getPrices
  };

})(window);
