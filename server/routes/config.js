/**
 * API 路由 — /api/config
 * 管理员配置接口（受密码保护）
 */

const express = require('express');
const router = express.Router();

const { loadConfig, saveConfig } = require('../utils/configStore');
const { requireAdmin } = require('../utils/security');

/**
 * GET /api/config
 * 读取系统配置（只返回非敏感信息）
 */
router.get('/', (req, res) => {
  const config = loadConfig();
  res.json({
    apiEndpoint: config.apiEndpoint,
    model: config.model,
    pricePerUse: config.pricePerUse,
    defaultFreeCount: config.defaultFreeCount,
    hasApiKey: !!config.apiKey && config.apiKey !== 'sk-your-key-here'
  });
});

/**
 * POST /api/config
 * 保存系统配置（需要管理员密码）
 */
router.post('/', requireAdmin, (req, res) => {
  const { apiEndpoint, apiKey, model } = req.body;
  saveConfig({ apiEndpoint, apiKey, model });
  res.json({ success: true, message: '配置已保存' });
});

module.exports = router;
