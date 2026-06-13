/**
 * API 路由 — /api/status
 * 获取用户使用状态
 */

const express = require('express');
const router = express.Router();

const { getUser } = require('../utils/userStore');
const { loadConfig } = require('../utils/configStore');
const { getVerifiedUserId, signUserId } = require('../utils/security');

/**
 * GET /api/status
 *
 * 响应:
 * {
 *   freeUsed: boolean,
 *   paidCount: number,
 *   totalGenerated: number,
 *   freeCount: number,     // 剩余免费次数
 *   pricePerUse: number,
 *   hasSystemApiKey: boolean,
 *   userSig: string        // userId 签名，前端需保存并在后续请求中带上
 * }
 */
router.get('/', (req, res) => {
  const { userId, valid } = getVerifiedUserId(req);
  const config = loadConfig();
  const user = getUser(userId);

  res.json({
    freeUsed: user.freeUsed,
    paidCount: user.paidCount,
    totalGenerated: user.totalGenerated,
    freeCount: user.freeUsed ? 0 : config.defaultFreeCount,
    pricePerUse: config.pricePerUse,
    hasSystemApiKey: !!config.apiKey && config.apiKey !== 'sk-your-key-here',
    userSig: signUserId(userId)  // 返回签名，前端保存后在后续请求中带上
  });
});

module.exports = router;
