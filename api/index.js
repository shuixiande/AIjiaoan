/**
 * Vercel 入口函数
 * 处理根路径并代理 API 请求
 */

import statusHandler from './status.js';
import generateHandler from './generate.js';
import configHandler from './config.js';
import paymentHandler from './confirm-payment.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试多个可能的路径
const possiblePaths = [
  path.join(__dirname, '..', 'public', 'index.html'),
  path.join(process.cwd(), 'public', 'index.html'),
  path.join(__dirname, 'public', 'index.html'),
];

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

  // 根路径 - 返回 index.html
  if (url === '/' || url === '/index.html') {
    const fs = await import('fs');

    // 尝试所有可能的路径
    let html = null;
    for (const htmlPath of possiblePaths) {
      try {
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf-8');
          console.log('Found index.html at:', htmlPath);
          break;
        }
      } catch (e) {
        console.log('Failed path:', htmlPath, e.message);
      }
    }

    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }

    console.error('index.html not found. Checked paths:', possiblePaths);
    return res.status(500).send('index.html not found');
  }

  // 其他路径返回 404
  return res.status(404).send('Not found');
}