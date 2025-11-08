// ========================================
// 请求验证中间件
// ========================================
// 🤔 这个文件的职责：
// 答：验证请求数据的格式
//     在进入 Controller 之前拦截无效请求

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, RegisterRequestBody, LoginRequestBody } from '../types';

// ========================================
// 🎯 验证工具函数
// ========================================

/**
 * 验证邮箱格式
 * 🎯 校园邮箱规则：必须以 .edu.cn 结尾
 * 示例：zhangsan@xxx.edu.cn
 */
export function isValidEmail(email: string): boolean {
  // 限制为校园邮箱（.edu.cn 结尾）
  const campusEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.edu\.cn$/;
  return campusEmailRegex.test(email);

  // 如果需要支持所有邮箱，使用以下正则：
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // return emailRegex.test(email);
}

/**
 * 验证密码强度
 * 🎯 密码要求：
 * - 至少8位
 * - 至少包含一个大写字母
 * - 至少包含一个小写字母
 * - 至少包含一个数字
 */
export function isValidPassword(password: string): boolean {
  // 强密码规则：至少8位，包含大小写字母和数字
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

/**
 * 验证学号格式
 * 🤔 学号要求：至少5位
 */
export function isValidStudentId(studentId: string): boolean {
  return studentId.length >= 5;
  
  // 更严格的规则（可选）：
  // const studentIdRegex = /^\d{8}$/;  // 必须是8位数字
  // return studentIdRegex.test(studentId);
}

/**
 * 验证用户名格式
 * 🤔 用户名要求：2-20位
 */
export function isValidUsername(username: string): boolean {
  return username.length >= 2 && username.length <= 20;
}

// ========================================
// 🎯 注册请求验证中间件
// ========================================
/**
 * 验证注册数据
 * 🤔 为什么要用中间件验证？
 * 答：1. Controller 更简洁
 *     2. 验证逻辑可复用
 *     3. 验证失败不进入 Controller，节省性能
 */
export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('🔍 开始验证注册数据...');
  
  const { username, email, password, student_id } = req.body as RegisterRequestBody;

  // ========================================
  // 1️⃣ 检查必填字段
  // ========================================
  if (!username || !email || !password || !student_id) {
    console.log('❌ 验证失败: 缺少必填字段');
    
    const response: ApiResponse<null> = {
      code: 400,
      msg: '缺少必填字段',
      data: null
    };
    
    res.status(400).json(response);
    return;
  }

  // ========================================
  // 2️⃣ 验证用户名
  // ========================================
  if (!isValidUsername(username)) {
    console.log('❌ 验证失败: 用户名长度必须在2-20位之间');
    
    const response: ApiResponse<null> = {
      code: 400,
      msg: '用户名长度必须在2-20位之间',
      data: null
    };
    
    res.status(400).json(response);
    return;
  }

  // ========================================
  // 3️⃣ 验证邮箱格式
  // ========================================
  if (!isValidEmail(email)) {
    console.log('❌ 验证失败: 必须使用校园邮箱（.edu.cn）');

    const response: ApiResponse<null> = {
      code: 400,
      msg: '必须使用校园邮箱（.edu.cn）',
      data: null
    };

    res.status(400).json(response);
    return;
  }

  // ========================================
  // 4️⃣ 验证密码强度
  // ========================================
  if (!isValidPassword(password)) {
    console.log('❌ 验证失败: 密码必须至少8位，且包含大小写字母和数字');

    const response: ApiResponse<null> = {
      code: 400,
      msg: '密码必须至少8位，且包含大小写字母和数字',
      data: null
    };

    res.status(400).json(response);
    return;
  }

  // ========================================
  // 5️⃣ 验证学号格式
  // ========================================
  if (!isValidStudentId(student_id)) {
    console.log('❌ 验证失败: 学号长度至少5位');
    
    const response: ApiResponse<null> = {
      code: 400,
      msg: '学号长度至少5位',
      data: null
    };
    
    res.status(400).json(response);
    return;
  }

  // ========================================
  // ✅ 验证通过，继续执行
  // ========================================
  console.log('✅ 数据验证通过');
  next();
}

// ========================================
// 🎯 登录请求验证中间件
// ========================================
export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('🔍 开始验证登录数据...');
  
  const { email, password } = req.body as LoginRequestBody;

  // 检查必填字段
  if (!email || !password) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '邮箱和密码不能为空',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 验证邮箱格式
  if (!isValidEmail(email)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '必须使用校园邮箱（.edu.cn）',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  console.log('✅ 登录数据验证通过');
  next();
}