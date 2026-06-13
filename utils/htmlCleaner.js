/**
 * HTML 清理工具
 */

export function cleanHtml(rawHtml) {
  if (!rawHtml) return '';

  let html = rawHtml;

  const match = html.match(/```html?\s*([\s\S]*?)```/);
  if (match) {
    html = match[1].trim();
  }

  if (!html.includes('<!DOCTYPE')) {
    html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' + html;
  }
  if (!html.includes('</html>')) {
    html += '\n</html>';
  }

  return html;
}
