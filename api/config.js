/**
 * API 端点 — /api/config
 * 管理员配置接口
 */

import { loadConfig, saveConfig } from '../utils/configStore.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiEndpoint, apiKey, model } = req.body || {};
    saveConfig({ apiEndpoint, apiKey, model });
    res.json({ success: true, message: '配置已保存' });
  } catch (error) {
    console.error('Config API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
