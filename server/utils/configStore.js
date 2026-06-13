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
  const envConfig = {
    apiEndpoint: process.env.API_ENDPOINT,
    apiKey: process.env.API_KEY,
    model: process.env.API_MODEL || 'deepseek-chat',
    pricePerUse: process.env.PRICE_PER_USE ? parseFloat(process.env.PRICE_PER_USE) : 2.99,
    defaultFreeCount: process.env.DEFAULT_FREE_COUNT ? parseInt(process.env.DEFAULT_FREE_COUNT, 10) : 1
  };

  if (envConfig.apiKey) {
    return envConfig;
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
    return { ...DEFAULT_CONFIG };
  }
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(updates) {
  const config = loadConfig();
  Object.assign(config, updates);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  return config;
}

module.exports = { loadConfig, saveConfig };
