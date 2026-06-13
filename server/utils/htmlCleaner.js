/**
 * HTML 清理工具 — 从 AI 返回结果中提取干净的 HTML
 */

/**
 * 清理 AI 返回的 HTML 内容
 * - 去除 markdown 代码块标记
 * - 补全缺失的 HTML 骨架
 * @param {string} rawHtml - AI 原始返回内容
 * @returns {string} 清理后的完整 HTML
 */
function cleanHtml(rawHtml) {
  if (!rawHtml) return '';

  let html = rawHtml;

  // 去除 markdown 代码块包裹
  const match = html.match(/```html?\s*([\s\S]*?)```/);
  if (match) {
    html = match[1].trim();
  }

  // 补全 HTML 骨架
  if (!html.includes('<!DOCTYPE')) {
    html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' + html;
  }
  if (!html.includes('</html>')) {
    html += '\n</html>';
  }

  return html;
}

module.exports = { cleanHtml };
