/**
 * 用户管理工具 - Vercel Serverless 优化版
 * 使用内存缓存 + 文件备份
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel Serverless 环境使用 /tmp 目录
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // 忽略
    }
  }
}

export function loadUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveUsers(users) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // 忽略写入失败
  }
}

// 进程内缓存 - 用于单次请求内的快速访问
const memoryCache = new Map();

export function getUser(userId) {
  // 优先从内存缓存获取
  if (memoryCache.has(userId)) {
    const cached = memoryCache.get(userId);
    // 添加时间戳来跟踪缓存时间
    return { ...cached };
  }

  // 从文件加载
  const users = loadUsers();
  if (!users[userId]) {
    users[userId] = {
      createdAt: new Date().toISOString(),
      freeUsed: false,
      paidCount: 0,
      totalGenerated: 0
    };
    saveUsers(users);
  }

  const user = { ...users[userId], userId };
  // 存入内存缓存
  memoryCache.set(userId, { ...users[userId] });
  return user;
}

export function updateUser(userId, updates) {
  // 先从文件加载最新数据
  const users = loadUsers();

  // 合并更新
  users[userId] = { ...(users[userId] || {}), ...updates };

  // 保存到文件（持久化）
  saveUsers(users);

  // 更新内存缓存
  memoryCache.set(userId, { ...users[userId] });

  return { ...users[userId], userId };
}