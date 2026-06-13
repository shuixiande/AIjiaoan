/**
 * 用户管理工具 — 读写用户数据
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 读取所有用户数据
 * @returns {Object}
 */
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * 保存用户数据
 * @param {Object} users
 */
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

/**
 * 获取或创建用户记录
 * @param {string} userId
 * @returns {Object & { userId: string }}
 */
function getUser(userId) {
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
  return { ...users[userId], userId };
}

/**
 * 更新用户记录
 * @param {string} userId
 * @param {Object} updates
 * @returns {Object & { userId: string }}
 */
function updateUser(userId, updates) {
  const users = loadUsers();
  users[userId] = { ...(users[userId] || {}), ...updates };
  saveUsers(users);
  return { ...users[userId], userId };
}

module.exports = { loadUsers, saveUsers, getUser, updateUser };
