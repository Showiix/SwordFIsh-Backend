const Redis = require('redis');
const config = require('./index');

// 创建Redis客户端
const redisClient = Redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false
});

// Redis连接事件监听
redisClient.on('connect', () => {
  console.log('✅ Redis连接成功');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis连接失败:', error.message);
});

redisClient.on('ready', () => {
  console.log('✅ Redis准备就绪');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis重新连接中...');
});

// 初始化Redis连接
const initRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis初始化失败:', error.message);
    // 在开发环境中，Redis连接失败不应该阻止应用启动
    if (config.app.env === 'production') {
      process.exit(1);
    }
  }
};

// Redis操作封装
const redisOperations = {
  // 设置键值对
  async set(key, value, expiration = null) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (expiration) {
        return await redisClient.setEx(key, expiration, stringValue);
      }
      return await redisClient.set(key, stringValue);
    } catch (error) {
      console.error('Redis SET操作失败:', error.message);
      return null;
    }
  },

  // 获取键值
  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis GET操作失败:', error.message);
      return null;
    }
  },

  // 删除键
  async del(key) {
    try {
      return await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL操作失败:', error.message);
      return 0;
    }
  },

  // 检查键是否存在
  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Redis EXISTS操作失败:', error.message);
      return 0;
    }
  },

  // 设置过期时间
  async expire(key, seconds) {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error) {
      console.error('Redis EXPIRE操作失败:', error.message);
      return 0;
    }
  },

  // 获取剩余过期时间
  async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis TTL操作失败:', error.message);
      return -1;
    }
  }
};

module.exports = {
  redisClient,
  redisOperations,
  initRedis
};