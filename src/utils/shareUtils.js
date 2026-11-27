// 1-Tap Native Mobile Share (LINE / Android Share Sheet) with Clipboard Fallback

export async function shareTextOrCopy({ title, text, url }) {
  const fullMessage = url ? `${text}\n${url}` : text;

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: title || 'EV Plug Scout',
        text,
        ...(url ? { url } : {})
      });
      return { ok: true, method: 'native', message: 'เปิดหน้าต่างแชร์เข้า LINE / แชทเรียบร้อย' };
    }
  } catch (err) {
    // User cancelled native share sheet
    if (err && err.name === 'AbortError') {
      return { ok: false, method: 'cancelled', message: '' };
    }
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullMessage);
      return { ok: true, method: 'clipboard', message: 'คัดลอกข้อความพร้อมลิงก์ Google Maps แล้ว ส่งวางใน LINE ได้ทันที' };
    }
  } catch {
    // fallback below
  }

  return { ok: false, method: 'unsupported', message: 'อุปกรณ์นี้ไม่รองรับการแชร์อัตโนมัติ' };
}
