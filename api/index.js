/**
 * API 端点 — 处理根路径请求
 * 返回静态 HTML 页面
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 查找 index.html 的可能路径
const possiblePaths = [
  path.join(__dirname, '..', 'public', 'index.html'),
  path.join(__dirname, '..', 'index.html'),
];

function getIndexHtml() {
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    } catch (e) {
      // 继续尝试下一个
    }
  }
  return null;
}

export default async function handler(req, res) {
  const url = req.url || '';

  // 只处理根路径
  if (url === '/' || url === '/index.html') {
    const html = getIndexHtml();

    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0');
      return res.send(html);
    }

    return res.status(404).send('Index not found');
  }

  // 其他路径返回 404
  return res.status(404).send('Not found');
}