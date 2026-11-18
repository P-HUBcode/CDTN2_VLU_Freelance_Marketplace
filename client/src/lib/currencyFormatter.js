/**
 * Tiện ích tự động định dạng tiền tệ và mức thù lao có dấu chấm phân cách hàng nghìn (Chuẩn Việt Nam)
 * Ví dụ: 9000000 -> 9.000.000
 *        9000000 - 12000000 -> 9.000.000 – 12.000.000đ/tháng
 */

/**
 * Định dạng số nguyên thuần thành chuỗi có dấu chấm phân cách hàng nghìn
 * @param {string|number} val 
 * @returns {string} ví dụ: 9000000 -> "9.000.000"
 */
export function formatNumberWithDots(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str) return '';

  // Lọc chỉ giữ chữ số
  const clean = str.replace(/\D/g, '');
  if (!clean) return '';

  // Chèn dấu chấm phân cách mỗi 3 chữ số từ phải qua trái
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Định dạng chuỗi mức thù lao / lương (hỗ trợ cả số đơn lẫn khoảng lương có dấu gạch ngang)
 * @param {string|number} input 
 * @param {boolean} addSuffix có gắn thêm 'đ/tháng' hay không
 * @returns {string}
 */
export function formatSalaryInput(input, addSuffix = false) {
  if (!input) return '';
  const str = String(input).trim();
  if (!str) return '';

  // Kiểm tra nếu là khoảng lương có dấu gạch ngang (ví dụ: 3000000 - 5000000)
  if (str.includes('-') || str.includes('–')) {
    const parts = str.split(/[-–]/);
    const formatted = parts.map((p) => {
      const clean = p.replace(/\D/g, '');
      if (!clean) return '';
      return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }).filter(Boolean);

    if (formatted.length === 2) {
      return `${formatted[0]} – ${formatted[1]}${addSuffix || str.includes('tháng') ? 'đ/tháng' : ''}`;
    } else if (formatted.length === 1) {
      return `${formatted[0]}${addSuffix || str.includes('tháng') ? 'đ/tháng' : ''}`;
    }
  }

  // Số đơn lẻ
  const clean = str.replace(/\D/g, '');
  if (!clean) return str;

  const dots = clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (addSuffix || str.includes('tháng')) {
    return `${dots}đ/tháng`;
  }
  return dots;
}

/**
 * Chuyển đổi chuỗi có dấu chấm về dạng số nguyên (để lưu vào database)
 * @param {string|number} val 
 * @returns {number}
 */
export function parseRawNumber(val) {
  if (!val) return 0;
  const clean = String(val).replace(/\D/g, '');
  return parseInt(clean, 10) || 0;
}
