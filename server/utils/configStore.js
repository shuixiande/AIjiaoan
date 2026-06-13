/**
 * 配置管理工具 - 读取系统配置
 * 优先级：环境变量 > 默认配置
 * 注意：Vercel 环境下只读取环境变量，不写文件
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../config.json');

const DEFAULT_CONFIG = {
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  pricePerUse: 2.99,
  defaultFreeCount: 1
};

function loadConfig() {
  // 优先读取环境变量
  const envConfig = {
    apiEndpoint: process.env.API_ENDPOINT,
    apiKey: process.env.API_KEY,
    model: process.env.API_MODEL || 'deepseek-chat',
    pricePerUse: process.env.PRICE_PER_USE ? parseFloat(process.env.PRICE_PER_USE) : 2.99,
    defaultFreeCount: process.env.DEFAULT_FREE_COUNT ? parseInt(process.env.DEFAULT_FREE_COUNT, 10) : 1
  };

  // 如果有环境变量 API Key，使用环境变量
  if (envConfig.apiKey) {
    return envConfig;
  }

  // Vercel 环境下不尝试写文件，直接返回默认配置
  if (process.env.VERCEL || !fs.existsSync(CONFIG_FILE)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(updates) {
  // Vercel 环境下不支持保存配置
  if (process.env.VERCEL) {
    console.warn('Vercel 环境不支持保存配置');
    return loadConfig();
  }
  
  const config = loadConfig();
  Object.assign(config, updates);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  return config;
}

module.exports = { loadConfig, saveConfig };
