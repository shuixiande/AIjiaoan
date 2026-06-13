/**
 * 配置管理工具
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

const DEFAULT_CONFIG = {
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  pricePerUse: 2.99,
  defaultFreeCount: 1
};

export function loadConfig() {
  if (process.env.API_KEY) {
    return {
      ...DEFAULT_CONFIG,
      apiEndpoint: process.env.API_ENDPOINT || DEFAULT_CONFIG.apiEndpoint,
      apiKey: process.env.API_KEY,
      model: process.env.API_MODEL || DEFAULT_CONFIG.model
    };
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

export function saveConfig(updates) {
  const config = loadConfig();
  Object.assign(config, updates);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  return config;
}
