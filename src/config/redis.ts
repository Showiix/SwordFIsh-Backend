// ========================================
// Redis 配置文件 (TypeScript 版本)
// ========================================

import { createClient, RedisClientType } from 'redis';
import config from './index';

// ========================================
// 创建 Redis 客户端
// ========================================
const redisClient: RedisClientType = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port
  },
  password: config.redis.password || undefined
});

// ========================================
// Redis 连接事件监听
// ========================================
redisClient.on('connect', () => {
  console.log('✅ Redis连接成功');
});

redisClient.on('error', (error: Error) => {
  console.error('❌ Redis连接失败:', error.message);
});

redisClient.on('ready', () => {
  console.log('✅ Redis准备就绪');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis重新连接中...');
});

// ========================================
// 初始化 Redis 连接
// ========================================
const initRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error: any) {
    console.error('Redis初始化失败:', error.message);
    // 在开发环境中，Redis连接失败不应该阻止应用启动
    if (config.app.env === 'production') {
      process.exit(1);
    }
  }
};

// ========================================
// Redis 操作封装
// ========================================
interface RedisOperations {
  set(key: string, value: any, expiration?: number | null): Promise<string | null>;
  get<T = any>(key: string): Promise<T | string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

const redisOperations: RedisOperations = {
  // 设置键值对
  async set(key: string, value: any, expiration: number | null = null): Promise<string | null> {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (expiration) {
        return await redisClient.setEx(key, expiration, stringValue);
      }
      return await redisClient.set(key, stringValue);
    } catch (error: any) {
      console.error('Redis SET操作失败:', error.message);
      return null;
    }
  },

  // 获取键值
  async get<T = any>(key: string): Promise<T | string | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value;
      }
    } catch (error: any) {
      console.error('Redis GET操作失败:', error.message);
      return null;
    }
  },

  // 删除键
  async del(key: string): Promise<number> {
    try {
      return await redisClient.del(key);
    } catch (error: any) {
      console.error('Redis DEL操作失败:', error.message);
      return 0;
    }
  },

  // 检查键是否存在
  async exists(key: string): Promise<number> {
    try {
      return await redisClient.exists(key);
    } catch (error: any) {
      console.error('Redis EXISTS操作失败:', error.message);
      return 0;
    }
  },

  // 设置过期时间
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error: any) {
      console.error('Redis EXPIRE操作失败:', error.message);
      return false;
    }
  },

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error: any) {
      console.error('Redis TTL操作失败:', error.message);
      return -1;
    }
  }
};

// ========================================
// 导出
// ========================================
export { redisClient, redisOperations, initRedis };
export type { RedisOperations };
