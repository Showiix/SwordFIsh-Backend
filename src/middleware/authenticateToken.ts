// ========================================
// JWT Token 验证中间件
// ========================================
// 🤔 这个文件的职责：
// 答：验证用户身份，从 Token 中提取用户信息

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, ApiResponse } from '../types';
import config from '../config';

// ========================================
// 🎯 JWT Token 验证中间件
// ========================================
/**
 * 验证 JWT Token 的中间件
 * 🤔 什么时候使用？
 * 答：所有需要登录才能访问的接口，都要用这个中间件
 * 
 * 🤔 它做了什么？
 * 答：1. 从请求头获取 Token
 *     2. 验证 Token 是否有效
 *     3. 解析出用户信息，放到 req.user
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  console.log('🔐 开始验证 Token...');

  // ========================================
  // 1️⃣ 从请求头获取 Token
  // ========================================
  // 🤔 Token 在哪里？
  // 答：在 HTTP 请求头的 Authorization 字段
  //     格式：Authorization: Bearer <token>
  
  const authHeader = req.headers['authorization'];
  
  // 提取 Token（去掉 "Bearer " 前缀）
  const token = authHeader && authHeader.split(' ')[1];
  
  // 如果没有 Token，返回 401（未授权）
  if (!token) {
    console.log('❌ Token 不存在');
    
    const response: ApiResponse<null> = {
      code: 401,
      msg: '未提供认证令牌，请先登录',
      data: null
    };
    
    res.status(401).json(response);
    return;
  }

  // ========================================
  // 2️⃣ 验证 Token 是否有效
  // ========================================
  try {
    // 🤔 jwt.verify 做了什么？
    // 答：1. 检查 Token 是否被篡改
    //     2. 检查 Token 是否过期
    //     3. 解析出 Payload（用户信息）
    
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: number;
      student_id: string;
      email: string;
    };
    
    // 把用户信息放到 req.user，供后续使用
    req.user = {
      id: decoded.id,
      student_id: decoded.student_id,
      email: decoded.email
    };
    
    console.log(`✅ Token 验证成功，用户ID: ${decoded.id}`);
    
    // 继续执行下一个中间件或 Controller
    next();
    
  } catch (error: any) {
    // Token 无效或过期
    console.log('❌ Token 验证失败:', error.message);
    
    let errorMsg = 'Token 无效';
    
    // 🤔 不同的错误类型
    if (error.name === 'TokenExpiredError') {
      errorMsg = 'Token 已过期，请重新登录';
    } else if (error.name === 'JsonWebTokenError') {
      errorMsg = 'Token 格式错误';
    }
    
    const response: ApiResponse<null> = {
      code: 401,
      msg: errorMsg,
      data: null
    };
    
    res.status(401).json(response);
    return;
  }
}

