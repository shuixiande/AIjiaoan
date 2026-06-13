/**
 * API 端点 — /api/generate
 * 统一的教案生成入口
 */

import crypto from 'crypto';
import { buildPrompt } from '../services/promptBuilder.js';
import { validateForm } from '../services/validator.js';
import { callAI } from '../services/aiService.js';
import { cleanHtml } from '../utils/htmlCleaner.js';
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

  const { apiSource = 'system', formData = {}, ownApiConfig = {} } = req.body || {};
  const userId = getUserId(req);

  // 1. 输入验证
  const validation = validateForm(formData, apiSource);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'validation_failed',
      errors: validation.errors
    });
  }

  // 2. 权限检查
  let config = null;
  if (apiSource === 'system') {
    config = loadConfig();

    if (!config.apiKey || config.apiKey === 'sk-your-key-here') {
      return res.status(500).json({
        success: false,
        error: 'system_config',
        message: '服务器尚未配置系统 API Key'
      });
    }

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

  // 3. 构建提示词
  const prompt = buildPrompt(formData);

  // 4. 调用 AI API
  try {
    let aiResult;

    if (apiSource === 'own') {
      aiResult = await callAI({
        apiEndpoint: ownApiConfig.apiEndpoint,
        apiKey: ownApiConfig.apiKey,
        model: ownApiConfig.apiModel,
        prompt
      });
    } else {
      aiResult = await callAI({
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey,
        model: config.model,
        prompt
      });
    }

    // 5. 清理 HTML
    const html = cleanHtml(aiResult);

    // 6. 扣减次数
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

    // 7. 生成文件名
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

    let errorCode = 'ai_call_failed';
    let errorMessage = err.message;

    if (err.statusCode === 401 || err.message.includes('unauthorized')) {
      errorCode = 'api_key_invalid';
      errorMessage = apiSource === 'own' ? '自有 API Key 无效' : '系统 API Key 无效';
    } else if (err.statusCode === 429) {
      errorCode = 'rate_limited';
      errorMessage = 'API 调用过于频繁，请稍后重试';
    } else if (err.statusCode === 402) {
      errorCode = 'insufficient_balance';
      errorMessage = apiSource === 'own' ? 'API 余额不足，请充值' : '系统 API 余额不足';
    }

    res.status(500).json({
      success: false,
      error: errorCode,
      message: errorMessage
    });
  }
};
