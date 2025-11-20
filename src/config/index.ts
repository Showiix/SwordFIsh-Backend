// ========================================
// 配置文件 (TypeScript 版本)
// ========================================
// 🤔 这个文件干什么？
// 答：集中管理所有环境配置
//     从 .env 文件读取配置项

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// 根据环境加载对应的 .env 文件
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
const defaultEnvFile = '.env';

// 优先加载环境特定的配置文件，如果不存在则使用默认 .env
if (existsSync(resolve(process.cwd(), envFile))) {
  dotenv.config({ path: envFile });
} else if (existsSync(resolve(process.cwd(), defaultEnvFile))) {
  dotenv.config({ path: defaultEnvFile });
} else {
  console.warn('⚠️  WARNING: No .env file found. Using default configuration.');
  dotenv.config(); // 尝试默认加载
}

// ========================================
// 🎯 定义配置对象的类型
// ========================================
interface AppConfig {
  env: string;
  port: number;
  socketPort: number;
}

interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}

interface RedisConfig {
  host: string;
  port: number;
  password: string | null;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

interface PaymentConfig {
  alipay: {
    appId?: string;
    privateKey?: string;
    publicKey?: string;
    gateway: string;
  };
  wechat: {
    appId?: string;
    mchId?: string;
    apiKey?: string;
  };
}

interface EmailConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
}

interface UploadConfig {
  path: string;
  maxSize: number;
  allowedImageTypes: string[];
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface LogConfig {
  level: string;
  maxSize: string;
  maxFiles: string;
}

interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
}

// ========================================
// 🎯 完整的配置接口
// ========================================
export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  payment: PaymentConfig;
  email: EmailConfig;
  upload: UploadConfig;
  rateLimit: RateLimitConfig;
  log: LogConfig;
  minio: MinioConfig;
}

// ========================================
// 🎯 配置对象（有类型保护）
// ========================================
const config: Config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    socketPort: parseInt(process.env.SOCKET_PORT || '3001', 10)
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'campus_secondhand',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456'
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || null
  },

  jwt: {
    secret: (() => {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET must be set in production environment!');
        }
        console.warn('⚠️  WARNING: Using default JWT secret. This is ONLY for development!');
        return 'dev_only_jwt_secret_DO_NOT_USE_IN_PRODUCTION';
      }
      return secret;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  payment: {
    alipay: {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      publicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do'
    },
    wechat: {
      appId: process.env.WECHAT_APP_ID,
      mchId: process.env.WECHAT_MCH_ID,
      apiKey: process.env.WECHAT_API_KEY
    }
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(',')
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d'
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    region: process.env.MINIO_REGION || 'us-east-1'
  }
};

export default config;

