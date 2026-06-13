/**
 * API 端点 — /api/confirm-payment
 * 用户扫码后确认付款
 */

import crypto from 'crypto';
import { getUser, updateUser } from '../utils/userStore.js';
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserId(req);
    const user = getUser(userId);
    const config = loadConfig();

    const updated = updateUser(userId, {
      paidCount: (user.paidCount || 0) + 1
    });

    res.json({
      success: true,
      message: '付款已确认',
      remaining: {
        free: updated.freeUsed ? 0 : config.defaultFreeCount,
        paid: updated.paidCount
      }
    });
  } catch (error) {
    console.error('Payment API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
