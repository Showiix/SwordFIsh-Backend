// ========================================
// 认证路由配置
// ========================================
// 作用：定义所有认证相关的API端点
// 就像餐厅的菜单：列出所有可点的菜

import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validateRegister, validateLogin } from "../middleware/validateRequest";
import { requestLogger } from "../middleware/logger";
import { authenticateToken } from "../middleware/authenticateToken";
import { authLimiter, createAccountLimiter } from "../middleware/rateLimiter";
// ↑ 导入的是 AuthController 的实例和认证中间件

const router = Router(); // 创建一个路由实例


// ========================================
// 🎯 注册路由
// ========================================
// 🤔 中间件执行顺序：
// 1. createAccountLimiter → 限制注册频率（1小时最多3次）
// 2. requestLogger → 记录请求日志
// 3. validateRegister → 验证数据格式
// 4. authController.register → 处理业务逻辑
// 5. errorHandler → 捕获错误（在 app.ts 中全局配置）

router.post(
    '/register',
    createAccountLimiter,                    // 1️⃣ 注册限流
    requestLogger,                           // 2️⃣ 记录日志
    validateRegister,                        // 3️⃣ 验证数据
    authController.register.bind(authController)  // 4️⃣ 处理业务
  );

  // ========================================
  // 🎯 登录路由
  // ========================================
  router.post(
    '/login',
    authLimiter,                             // 1️⃣ 登录限流
    requestLogger,                           // 2️⃣ 记录日志
    validateLogin,                           // 3️⃣ 验证数据
    authController.login.bind(authController)     // 4️⃣ 处理业务
  );
  
  // ========================================
  // 🎯 登出路由（待实现）
  // ========================================
  // router.post(
  //   '/logout',
  //   requestLogger,                           // 1️⃣ 记录日志
  //   // TODO: 添加认证中间件（验证用户是否登录）
  //   authController.logout.bind(authController)    // 2️⃣ 处理业务
  // );
  
  // ========================================
  // 🎯 获取个人信息路由
  // ========================================
  // 🤔 中间件执行顺序：
  // 1. requestLogger → 记录请求日志
  // 2. authenticateToken → 验证 Token，提取用户信息
  // 3. authController.getUserInfo → 处理业务逻辑
  // 4. errorHandler → 捕获错误（全局配置）
  
  router.get(
    '/user/info',
    requestLogger,                                      // 1️⃣ 记录日志
    authenticateToken,                                  // 2️⃣ 验证身份
    authController.getUserInfo.bind(authController)     // 3️⃣ 处理业务
  );
  
  export default router;