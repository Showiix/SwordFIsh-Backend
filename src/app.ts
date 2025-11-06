// ========================================
// 主应用入口
// ========================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger, detailedLogger } from './middleware/logger';
import config from './config';

const app: Application = express();

// ========================================
// 1️⃣ 安全相关中间件
// ========================================
app.use(helmet());  // 设置安全 HTTP 头
app.use(cors());    // 允许跨域

// ========================================
// 2️⃣ 请求解析中间件
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// 3️⃣ 日志中间件（全局）
// ========================================
// 🤔 为什么在这里使用？
// 答：记录所有请求，包括静态文件、健康检查等

if (config.app.env === 'development') {
  app.use(detailedLogger);  // 开发环境：详细日志
} else {
  app.use(requestLogger);   // 生产环境：简洁日志
}

// ========================================
// 4️⃣ API 路由
// ========================================
app.use('/api/auth', authRoutes);
// 每个路由内部还可以有自己的中间件

// ========================================
// 5️⃣ 健康检查
// ========================================
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========================================
// 6️⃣ 错误处理中间件（必须放在最后）
// ========================================
app.use(notFoundHandler);   // 处理 404
app.use(errorHandler);      // 处理所有错误

export default app;