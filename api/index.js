/**
 * Vercel 入口函数
 * 处理根路径、静态资源和 API 请求
 */

import statusHandler from './status.js';
import generateHandler from './generate.js';
import configHandler from './config.js';
import paymentHandler from './confirm-payment.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文件路径配置
const possibleHtmlPaths = [
  path.join(__dirname, '..', 'public', 'index.html'),
  path.join(process.cwd(), 'public', 'index.html'),
  path.join(__dirname, 'public', 'index.html'),
];

const possibleImagePaths = [
  path.join(__dirname, '..', 'public', 'images'),
  path.join(process.cwd(), 'public', 'images'),
  path.join(__dirname, 'public', 'images'),
];

// 静态文件映射
const staticFiles = {
  '/images/qrcode.jpg': 'images/qrcode.jpg',
};

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

  // 静态图片资源
  if (staticFiles[url]) {
    const fileName = staticFiles[url];
    const fs = await import('fs');

    for (const imgDir of possibleImagePaths) {
      const imgPath = path.join(imgDir, fileName);
      try {
        if (fs.existsSync(imgPath)) {
          const ext = path.extname(fileName).toLowerCase();
          const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
          };
          const contentType = contentTypes[ext] || 'application/octet-stream';

          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(fs.readFileSync(imgPath));
        }
      } catch (e) {
        console.log('Failed to read image:', imgPath, e.message);
      }
    }
    return res.status(404).send('Image not found');
  }

  // 根路径 - 返回 index.html
  if (url === '/' || url === '/index.html') {
    const fs = await import('fs');

    let html = null;
    for (const htmlPath of possibleHtmlPaths) {
      try {
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf-8');
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

    console.error('index.html not found. Checked paths:', possibleHtmlPaths);
    return res.status(500).send('index.html not found');
  }

  // 其他路径返回 404
  return res.status(404).send('Not found');
}