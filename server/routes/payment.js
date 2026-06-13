/**
 * API 路由 — /api/confirm-payment
 * 用户扫码后确认付款
 */

const express = require('express');
const router = express.Router();

const { getUser, updateUser } = require('../utils/userStore');
const { loadConfig } = require('../utils/configStore');
const { getVerifiedUserId, verifyPaymentToken, checkRateLimit } = require('../utils/security');

/**
 * GET /api/payment-token
 * 获取支付确认 token（前端在展示收款码前调用）
 */
router.get('/token', (req, res) => {
  const { getVerifiedUserId, generatePaymentToken } = require('../utils/security');
  const { userId } = getVerifiedUserId(req);

  // 频率限制：每小时最多请求 10 次 token
  if (!checkRateLimit(`paytoken:${userId}`, 10, 60 * 60 * 1000)) {
    return res.status(429).json({
      success: false,
      error: 'rate_limited',
      message: '请求过于频繁，请稍后再试'
    });
  }

  const token = generatePaymentToken(userId);
  res.json({ success: true, token });
});

/**
 * POST /api/confirm-payment
 *
 * 请求头:
 *   X-User-Id: 用户ID
 *   X-User-Sig: 用户ID签名
 *
 * 请求体:
 * {
 *   token: string  // 从 /api/payment-token 获取的支付 token
 * }
 */
router.post('/', (req, res) => {
  const { userId } = getVerifiedUserId(req);
  const { token } = req.body || {};

  // 频率限制：每个用户每分钟最多确认 3 次
  if (!checkRateLimit(`pay:${userId}`, 3, 60 * 1000)) {
    return res.status(429).json({
      success: false,
      error: 'rate_limited',
      message: '操作过于频繁，请稍后再试'
    });
  }

  // 验证支付 token
  if (!token || !verifyPaymentToken(userId, token)) {
    return res.status(403).json({
      success: false,
      error: 'invalid_token',
      message: '付款确认无效或已过期，请重新扫码'
    });
  }

  const config = loadConfig();
  const user = getUser(userId);

  // 增加一次付费次数
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
});

module.exports = router;
