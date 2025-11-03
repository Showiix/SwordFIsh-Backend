// ========================================
// 错误处理中间件
// ========================================
// 🤔 这个文件的职责：
// 答：捕获所有错误，统一返回给前端

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';  // ✅ 导入错误类
import { ApiResponse } from '../types';
import { url } from 'inspector';

/**
 * 错误处理中间件
 * 🤔 为什么要统一处理？
 * 答：1. 统一错误格式
 *     2. 统一日志记录
 *     3. 区分开发/生产环境
 */


export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction
):void 
{
    console.error("错误发生",{
        message: err.message,
        url: req.originalUrl,
        method: req.method,
        stack: err.stack,
    })


  // ========================================
  // 情况1：我们自己抛出的业务错误（AppError）
  // ========================================
  if (err instanceof AppError) {
    const response : ApiResponse<null> = {
        code: err.statusCode,
        msg: err.message,
        data: null,
    };
    res.status(err.statusCode).json(response);
    return;
}
  // ========================================
  // 情况2：Sequelize 数据库错误
  // ========================================
  if (err.name === 'SequelizeConstraintError') {
    const response : ApiResponse<null> = {
        code: 409,
        msg: "数据已存在",
        data: null,
    };
    res.status(500).json(response);
    return;
  }

  if(err.name === 'SequelizeValidationError')
  {
    const response : ApiResponse<null> = {
        code: 400,
        msg: "数据验证失败",
        data: null,
    };
    res.status(400).json(response);
    return;
  }
    // ========================================
  // 情况3：JWT 认证错误
  // ========================================

  if(err.name === 'JsonWebTokenError')
  {
    const response : ApiResponse<null> = {
        code: 401,
        msg: "认证失败",
        data: null,
    };
    res.status(401).json(response);
    return;
  }
  // ========================================
  // 情况4：其他未知错误
  // ========================================
  const response : ApiResponse<null> = {
    code: 500,
    msg: "服务器错误",
    data: null,
  };
  res.status(500).json(response);



}

export function notFoundHandler(
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction
):void 
{
    const response : ApiResponse<null> = {
        code: 404,
        msg: `未找到资源: ${req.method} ${req.originalUrl}`,
        data: null,
    };
    res.status(404).json(response);
}   