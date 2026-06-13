/**
 * 用户管理工具 - 内存存储（适配 Vercel Serverless）
 * 注意：Serverless 环境下内存数据不会持久化
 */

// 内存存储
const users = new Map();

function loadUsers() {
  // Vercel 环境不使用文件存储
  return Object.fromEntries(users);
}

function saveUsers() {
  // Vercel 环境不使用文件存储
}

function getUser(userId) {
  if (!users.has(userId)) {
    users.set(userId, {
      createdAt: new Date().toISOString(),
      freeUsed: false,
      paidCount: 1,
      totalGenerated: 0
    });
  }
  return { ...users.get(userId), userId };
}

function updateUser(userId, updates) {
  const current = getUser(userId);
  const updated = { ...current, ...updates };
  users.set(userId, updated);
  return updated;
}

module.exports = { loadUsers, saveUsers, getUser, updateUser };
