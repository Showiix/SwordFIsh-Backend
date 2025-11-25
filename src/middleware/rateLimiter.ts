// ========================================
// 限流中间件
// ========================================
// 用途：防止暴力破解、DDoS攻击等恶意行为

import rateLimit from 'express-rate-limit';
import config from '@/config';

// API 通用限流器
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 时间窗口
  max: config.rateLimit.maxRequests, // 最大请求数
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true, // 返回 RateLimit-* 头
  legacyHeaders: false, // 禁用 X-RateLimit-* 头
  // 根据 IP 地址限流
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
  // 跳过成功的请求（可选）
  skipSuccessfulRequests: false,
  // 跳过失败的请求（可选）
  skipFailedRequests: false,
});

// 认证接口严格限流器（针对登录、注册等敏感操作）
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多 5 次请求
  message: {
    success: false,
    message: '登录/注册尝试次数过多，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 优先使用请求体中的邮箱或学号，其次使用IP
    const identifier = req.body?.email || req.body?.student_id || req.ip;
    return identifier || 'unknown';
  },
  skipSuccessfulRequests: true, // 成功的请求不计入限制
});

// 创建账号限流器（更严格）
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 最多 3 次
  message: {
    success: false,
    message: '创建账号次数过多，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
});
