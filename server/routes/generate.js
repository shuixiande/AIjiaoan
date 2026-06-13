/**
 * API 路由 — /api/generate
 * 统一的教案生成入口，系统 API 和自有 API 都通过此接口
 */

const express = require('express');
const router = express.Router();

const { buildPrompt } = require('../services/promptBuilder');
const { validateForm } = require('../services/validator');
const { callAI } = require('../services/aiService');
const { cleanHtml } = require('../utils/htmlCleaner');
const { getUser, updateUser } = require('../utils/userStore');
const { loadConfig } = require('../utils/configStore');
const { getVerifiedUserId, checkRateLimit } = require('../utils/security');

/**
 * POST /api/generate
 *
 * 请求头:
 *   X-User-Id: 用户ID
 *   X-User-Sig: 用户ID签名（从 /api/status 获取）
 *
 * 请求体:
 * {
 *   apiSource: 'system' | 'own',
 *   formData: { courseName, topicName, ... },
 *   ownApiConfig: { apiEndpoint, apiKey, apiModel }  // 仅 apiSource='own' 时需要
 * }
 *
 * 响应:
 * {
 *   success: boolean,
 *   html?: string,       // 清理后的教案 HTML
 *   fileName?: string,   // 建议的文件名
 *   remaining?: { free, paid },
 *   error?: string,
 *   errors?: string[]    // 验证错误列表
 * }
 */
router.post('/', async (req, res) => {
  const { apiSource = 'system', formData = {}, ownApiConfig = {} } = req.body;
  const { userId } = getVerifiedUserId(req);

  // ---- 0. 频率限制 ----
  const rateKey = `gen:${userId}`;
  if (!checkRateLimit(rateKey, 5, 60 * 1000)) {
    return res.status(429).json({
      success: false,
      error: 'rate_limited',
      message: '请求过于频繁，请稍后再试（每分钟最多 5 次）'
    });
  }

  // ---- 1. 输入验证 ----
  const validation = validateForm(formData, apiSource);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'validation_failed',
      errors: validation.errors
    });
  }

  // ---- 2. 权限检查（系统 API 模式） ----
  let config = null;
  if (apiSource === 'system') {
    config = loadConfig();

    // 检查系统 API Key 是否已配置
    if (!config.apiKey || config.apiKey === 'sk-your-key-here') {
      return res.status(500).json({
        success: false,
        error: 'system_config',
        message: '服务器尚未配置系统 API Key'
      });
    }

    // 检查剩余次数
    const user = getUser(userId);
    const hasFree = !user.freeUsed;
    const hasPaid = user.paidCount > 0;

    if (!hasFree && !hasPaid) {
      return res.status(403).json({
        success: false,
        error: 'no_quota',
        message: '免费次数已用完，请付费后继续使用',
        pricePerUse: config.pricePerUse
      });
    }
  }

  // ---- 3. 构建提示词（服务端完成） ----
  const prompt = buildPrompt(formData);

  // ---- 4. 调用 AI API ----
  try {
    let aiResult;

    if (apiSource === 'own') {
      // 自有 API 模式：后端代理调用
      aiResult = await callAI({
        apiEndpoint: ownApiConfig.apiEndpoint,
        apiKey: ownApiConfig.apiKey,
        model: ownApiConfig.apiModel,
        prompt
      });
    } else {
      // 系统 API 模式
      aiResult = await callAI({
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey,
        model: config.model,
        prompt
      });
    }

    // ---- 5. 清理 HTML（服务端完成） ----
    const html = cleanHtml(aiResult);

    // ---- 6. 扣减次数（系统 API 模式） ----
    let remaining = null;
    if (apiSource === 'system') {
      const user = getUser(userId);
      const updates = { totalGenerated: (user.totalGenerated || 0) + 1 };
      if (!user.freeUsed) {
        updates.freeUsed = true;
      } else {
        updates.paidCount = Math.max(0, (user.paidCount || 0) - 1);
      }
      const updated = updateUser(userId, updates);
      remaining = {
        free: updated.freeUsed ? 0 : config.defaultFreeCount,
        paid: updated.paidCount
      };
    }

    // ---- 7. 生成文件名 ----
    const course = (formData.courseName || '').trim() || '教案';
    const topic = (formData.topicName || '').trim() || '课题';
    const fileName = `${course}-${topic}-教学设计.html`;

    res.json({
      success: true,
      html,
      fileName,
      remaining
    });

  } catch (err) {
    console.error('AI 调用失败:', err.message);

    // 安全地处理错误信息，避免泄露内部细节
    let errorCode = 'ai_call_failed';
    let errorMessage = 'AI 服务调用失败，请稍后重试';

    if (err.statusCode === 401 || err.message.includes('unauthorized')) {
      errorCode = 'api_key_invalid';
      errorMessage = apiSource === 'own' ? '自有 API Key 无效' : '系统 API Key 无效，请联系管理员';
    } else if (err.statusCode === 429) {
      errorCode = 'rate_limited';
      errorMessage = 'API 调用过于频繁，请稍后重试';
    } else if (err.statusCode === 402) {
      errorCode = 'insufficient_balance';
      errorMessage = apiSource === 'own' ? 'API 余额不足，请充值' : '系统 API 余额不足，请联系管理员';
    } else if (err.statusCode >= 500) {
      errorMessage = 'AI 服务器内部错误，请稍后重试';
    }

    res.status(500).json({
      success: false,
      error: errorCode,
      message: errorMessage
    });
  }
});

module.exports = router;
