// ========================================
// 日志中间件
// ========================================
// 🤔 这个文件的职责：
// 答：记录所有请求和响应信息
//     方便调试和问题追踪

import { Request, Response, NextFunction } from 'express';

/**
 * 请求日志中间件
 * 🤔 为什么需要日志？
 * 答：1. 追踪问题（哪个接口出错了）
 *     2. 性能监控（哪个接口慢）
 *     3. 安全审计（谁访问了哪些接口）
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  
  // ========================================
  // 1️⃣ 记录请求开始时间
  // ========================================
  const startTime = Date.now();

  // ========================================
  // 2️⃣ 记录请求信息
  // ========================================
  console.log('📥 收到请求:', {
    method: req.method,              // GET, POST, PUT, DELETE 等
    url: req.originalUrl,            // 完整的 URL（含查询参数）
    ip: req.ip,                      // 客户端 IP 地址
    userAgent: req.get('User-Agent'), // 浏览器/客户端信息
    body: req.body,                  // 请求体（POST 数据）
    timestamp: new Date().toISOString()
  });

  // ========================================
  // 3️⃣ 监听响应完成事件
  // ========================================
  // 🤔 为什么用 res.on('finish')？
  // 答：finish 事件在响应完全发送后触发
  //     这时可以计算请求处理耗时
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // 根据状态码决定日志级别
    const isError = res.statusCode >= 400;
    const logLevel = isError ? '❌' : '✅';
    
    console.log(`${logLevel} 响应完成:`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,      // HTTP 状态码
      duration: `${duration}ms`,       // 耗时（毫秒）
      timestamp: new Date().toISOString()
    });

    // 🤔 如果响应慢，发出警告
    if (duration > 1000) {  // 超过1秒
      console.warn('⚠️ 慢请求警告:', {
        url: req.originalUrl,
        duration: `${duration}ms`
      });
    }
  });

  // ========================================
  // 4️⃣ 继续执行下一个中间件
  // ========================================
  next();
}

/**
 * 详细日志中间件（开发环境用）
 * 🤔 与普通日志的区别？
 * 答：记录更详细的信息（请求头、请求体等）
 */
export function detailedLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('🔍 详细请求信息:', {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,        // 所有请求头
    params: req.params,          // 路径参数
    query: req.query,            // 查询参数
    body: req.body,              // 请求体
    ip: req.ip,
    protocol: req.protocol,      // http 或 https
    secure: req.secure,          // 是否 HTTPS
    timestamp: new Date().toISOString()
  });

  next();
}