/**
 * API 端点 — /api/status
 * 获取用户使用状态
 */

import crypto from 'crypto';
import { getUser } from '../utils/userStore.js';
import { loadConfig } from '../utils/configStore.js';

function getUserId(req) {
  const headers = req.headers || {};
  return headers['x-user-id'] || 'u_' + crypto.randomBytes(12).toString('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserId(req);
    const config = loadConfig();
    const user = getUser(userId);

    res.json({
      userId,
      freeUsed: user.freeUsed,
      paidCount: user.paidCount,
      totalGenerated: user.totalGenerated,
      freeCount: user.freeUsed ? 0 : config.defaultFreeCount,
      pricePerUse: config.pricePerUse,
      hasSystemApiKey: !!config.apiKey && config.apiKey !== 'sk-your-key-here'
    });
  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
