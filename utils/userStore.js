/**
 * 用户管理工具
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = '/tmp/data';
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

const memoryCache = new Map();

export function getUser(userId) {
  if (memoryCache.has(userId)) {
    return { ...memoryCache.get(userId), userId };
  }

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
  memoryCache.set(userId, users[userId]);
  return user;
}

export function updateUser(userId, updates) {
  const users = loadUsers();
  users[userId] = { ...(users[userId] || {}), ...updates };
  saveUsers(users);
  memoryCache.set(userId, users[userId]);
  return { ...users[userId], userId };
}
