// ========================================
// 数据库配置 (TypeScript 版本)
// ========================================
// 🤔 这个文件干什么？
// 答：创建 Sequelize 实例，连接 MySQL 数据库

import { Sequelize } from 'sequelize';
import config from './index';

// ========================================
// 🎯 创建数据库连接实例
// ========================================
export const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timezone: '+08:00'
    },
    pool: {
      max: 10,        // 最大连接数
      min: 0,         // 最小连接数
      acquire: 30000, // 获取连接的最大等待时间（毫秒）
      idle: 10000     // 连接空闲多久后释放（毫秒）
    },
    logging: config.app.env === 'development' ? console.log : false,
    timezone: '+08:00'
  }
);

// ========================================
// 🎯 测试数据库连接
// ========================================
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('❌ 数据库连接失败:', errorMessage);
    process.exit(1);
  }
};

