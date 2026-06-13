/**
 * 安全配置 — 环境变量与常量
 *
 * 所有敏感配置应从环境变量读取，避免硬编码
 */

// 从环境变量读取，避免硬编码在代码中
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// 用于签名 User-ID 的密钥（应从环境变量读取，如未设置则每次启动随机生成）
// 注意：随机生成会导致重启后所有用户的 userId 失效，生产环境应设置固定值
const USER_ID_SECRET = process.env.USER_ID_SECRET || require('crypto').randomBytes(32).toString('hex');

// 支付签名密钥（用于验证付款确认请求）
const PAYMENT_SECRET = process.env.PAYMENT_SECRET || require('crypto').randomBytes(32).toString('hex');

module.exports = {
  ADMIN_PASSWORD,
  USER_ID_SECRET,
  PAYMENT_SECRET
};
