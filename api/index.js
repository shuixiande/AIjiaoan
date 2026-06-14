/**
 * Vercel 入口函数
 * 处理根路径并代理 API 请求
 */

import statusHandler from './status.js';
import generateHandler from './generate.js';
import configHandler from './config.js';
import paymentHandler from './confirm-payment.js';

export default async function handler(req, res) {
  const url = req.url || '';

  // API 路由 - 代理到对应的处理器
  if (url === '/api/status' || url.startsWith('/api/status?')) {
    return statusHandler(req, res);
  }
  if (url === '/api/generate' || url.startsWith('/api/generate?')) {
    return generateHandler(req, res);
  }
  if (url === '/api/config' || url.startsWith('/api/config?')) {
    return configHandler(req, res);
  }
  if (url === '/api/confirm-payment' || url.startsWith('/api/confirm-payment')) {
    return paymentHandler(req, res);
  }

  // 根路径 - 通过 API 返回静态 HTML 的内容
  if (url === '/' || url === '/index.html') {
    // 导入公共模块来读取文件
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');

    try {
      const html = fs.readFileSync(htmlPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (e) {
      console.error('Failed to read index.html:', e.message);
      return res.status(500).send('Internal server error');
    }
  }

  // 其他路径返回 404
  return res.status(404).send('Not found');
}