/**
 * API 端点 — 主入口
 * 处理根路径和代理 API 请求
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入其他 API 处理器
import statusHandler from './status.js';
import generateHandler from './generate.js';
import configHandler from './config.js';
import paymentHandler from './confirm-payment.js';

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

  // API 路由
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
  if (url === '/api/health' || url.startsWith('/api/health?')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // 根路径 - 返回 index.html
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