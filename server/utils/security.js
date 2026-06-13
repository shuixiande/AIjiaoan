/**
 * 安全工具 — User-ID 签名、请求验证、频率限制
 */

const crypto = require('crypto');
const { USER_ID_SECRET, PAYMENT_SECRET } = require('./securityConfig');

// ============ User-ID 签名 ============

/**
 * 为 userId 生成签名
 * @param {string} userId
 * @returns {string} base64 签名
 */
function signUserId(userId) {
  return crypto.createHmac('sha256', USER_ID_SECRET).update(userId).digest('base64');
}

/**
 * 验证 userId 签名是否有效
 * @param {string} userId
 * @param {string} signature
 * @returns {boolean}
 */
function verifyUserId(userId, signature) {
  if (!userId || !signature) return false;
  const expected = signUserId(userId);
  // 使用 timingSafeEqual 防止时序攻击
  try {
    const sigBuf = Buffer.from(signature, 'base64');
    const expBuf = Buffer.from(expected, 'base64');
    return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * 从请求中提取并验证 userId
 * 返回 { userId, valid }，如果签名无效则 userId 为新生成的随机 ID
 */
function getVerifiedUserId(req) {
  const userId = req.headers['x-user-id'];
  const signature = req.headers['x-user-sig'];

  if (userId && signature && verifyUserId(userId, signature)) {
    return { userId, valid: true };
  }

  // 签名无效或缺失，生成新的随机 ID
  const newId = 'u_' + crypto.randomBytes(12).toString('hex');
  return { userId: newId, valid: false };
}

// ============ 支付请求签名 ============

/**
 * 生成支付确认签名
 * 前端在展示付款弹窗时，向后端请求一个带时间戳的签名
 * @param {string} userId
 * @returns {string} 支付 token
 */
function generatePaymentToken(userId) {
  const timestamp = Date.now().toString();
  const payload = `${userId}:${timestamp}`;
  const sig = crypto.createHmac('sha256', PAYMENT_SECRET).update(payload).digest('base64');
  return Buffer.from(`${timestamp}:${sig}`).toString('base64');
}

/**
 * 验证支付 token
 * @param {string} userId
 * @param {string} token
 * @param {number} maxAgeMs — token 最大有效期（默认 5 分钟）
 * @returns {boolean}
 */
function verifyPaymentToken(userId, token, maxAgeMs = 5 * 60 * 1000) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [timestampStr, sig] = decoded.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return false;
    if (Date.now() - timestamp > maxAgeMs) return false; // token 过期

    const payload = `${userId}:${timestampStr}`;
    const expected = crypto.createHmac('sha256', PAYMENT_SECRET).update(payload).digest('base64');

    const sigBuf = Buffer.from(sig, 'base64');
    const expBuf = Buffer.from(expected, 'base64');
    return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

// ============ 频率限制（内存级） ============

const rateLimitStore = new Map();

/**
 * 检查是否超过频率限制
 * @param {string} key — 限制键（如 userId + 接口名）
 * @param {number} maxRequests — 最大请求数
 * @param {number} windowMs — 时间窗口（毫秒）
 * @returns {boolean} true = 允许通过
 */
function checkRateLimit(key, maxRequests = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    // 窗口已过，重置
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// 定期清理过期的 rate limit 记录（每 10 分钟）
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

// ============ 管理员验证中间件 ============

const { ADMIN_PASSWORD } = require('./securityConfig');

/**
 * 管理员身份验证中间件
 * 通过 Header X-Admin-Password 验证
 */
function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({
      success: false,
      error: 'admin_not_configured',
      message: '管理员密码未配置，无法修改系统配置'
    });
  }

  const provided = req.headers['x-admin-password'];
  if (!provided) {
    return res.status(401).json({
      success: false,
      error: 'admin_auth_required',
      message: '需要提供管理员密码'
    });
  }

  // 使用 timingSafeEqual 防止时序攻击
  try {
    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(ADMIN_PASSWORD);
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return res.status(403).json({
        success: false,
        error: 'admin_auth_failed',
        message: '管理员密码错误'
      });
    }
  } catch {
    return res.status(403).json({
      success: false,
      error: 'admin_auth_failed',
      message: '管理员密码错误'
    });
  }

  next();
}

module.exports = {
  signUserId,
  verifyUserId,
  getVerifiedUserId,
  generatePaymentToken,
  verifyPaymentToken,
  checkRateLimit,
  requireAdmin
};
