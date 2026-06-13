/**
 * AI 教学设计生成器 — 主服务入口
 *
 * 架构：前后端完全分离
 * - 前端：纯 UI（表单收集 + 结果展示），无业务逻辑
 * - 后端：所有业务逻辑、数据处理、AI 调用、验证
 *
 * 模块结构:
 *   server/
 *     routes/     → API 路由（HTTP 层）
 *     services/   → 业务逻辑（prompt 构建、验证、AI 调用）
 *     utils/      → 工具（HTML 清理、用户存储、配置管理、安全）
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ 中间件 ============
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS — 只允许同源访问，防止跨域攻击
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // 允许同源请求（开发环境 localhost）
  if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-User-Sig, X-Admin-Password');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============ API 路由注册 ============
app.use('/api/status',           require('./server/routes/status'));
app.use('/api/generate',         require('./server/routes/generate'));
app.use('/api/confirm-payment',  require('./server/routes/payment'));
app.use('/api/config',           require('./server/routes/config'));

// ============ 健康检查 ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ============ 启动 ============
app.listen(PORT, () => {
  const { loadConfig } = require('./server/utils/configStore');
  const { ADMIN_PASSWORD, USER_ID_SECRET } = require('./server/utils/securityConfig');
  const config = loadConfig();

  console.log('');
  console.log('='.repeat(55));
  console.log('  📝 AI 教学设计生成器 — 前后端分离架构');
  console.log(`  📡 地址: http://localhost:${PORT}`);
  console.log(`  🔑 系统 API Key: ${config.apiKey ? '已配置 ✅' : '❌ 未配置'}`);
  console.log(`  📦 架构: 前端(纯UI) + 后端(全部业务逻辑)`);
  console.log(`  🔒 安全: User-ID 签名 ${USER_ID_SECRET ? '已启用' : '未配置'}`);
  console.log(`  🔒 安全: 管理员密码 ${ADMIN_PASSWORD ? '已配置' : '未配置'}`);

  if (!ADMIN_PASSWORD) {
    console.log('');
    console.log('  ⚠️  如需在线修改系统配置，请设置环境变量 ADMIN_PASSWORD');
    console.log('     示例: set ADMIN_PASSWORD=your_admin_pass && node server.js');
  }
  if (!config.apiKey || config.apiKey === 'sk-your-key-here') {
    console.log('');
    console.log('  ⚠️  请编辑 config.json 填入系统 API Key 后重启');
  }
  console.log('='.repeat(55));
  console.log('');
});
