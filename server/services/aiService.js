/**
 * AI 调用服务 — 封装所有对 AI API 的调用
 * 支持系统 API 和用户自有 API
 */

const SYSTEM_PROMPT = '你是一位资深的学科教学专家和HTML设计师。请严格按照用户要求生成标准教学设计HTML代码，直接输出完整可用代码，不要添加任何解释或额外的标记。';

/**
 * 调用 AI API（统一入口）
 * @param {Object} options
 * @param {string} options.apiEndpoint - API 地址
 * @param {string} options.apiKey - API Key
 * @param {string} options.model - 模型名称
 * @param {string} options.prompt - 用户提示词
 * @returns {Promise<string>} AI 返回的原始内容
 */
async function callAI({ apiEndpoint, apiKey, model, prompt }) {
  let endpoint = apiEndpoint.replace(/\/+$/, '');

  // 构建完整 API URL
  if (!endpoint.endsWith('/v1') && !endpoint.endsWith('/chat/completions')) {
    endpoint += '/chat/completions';
  } else if (endpoint.endsWith('/v1')) {
    endpoint += '/chat/completions';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    const error = new Error(`AI API 错误 (${response.status}): ${errText.slice(0, 300)}`);
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error('AI 返回格式异常');
  }

  return data.choices[0].message.content;
}

module.exports = { callAI };
