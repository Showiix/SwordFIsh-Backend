// ========================================
// 认证控制器
// ========================================
// 🤔 这个文件的职责：
//  处理http，捕获Service抛出的错误

import { Request, Response, NextFunction } from "express";
import { RegisterRequestBody, LoginRequestBody, ApiResponse, UserResponseData, UserInfoResponseData, AuthenticatedRequest } from "../types";
import authService from "../services/auth.service";


class AuthController{
    async register(
        req: Request<{}, {}, RegisterRequestBody>,
        res: Response<ApiResponse<UserResponseData>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userData = await authService.registerUser(req.body);
            //调用service层的注册用户的方法，传入一个req的body属性

            res.status(201).json({
                code: 201,
                msg: "注册成功",
                data: userData,
            });
        }
        catch (error) {
            next(error);
        }
    }

    // ========================================
    // 🎯 获取用户个人信息
    // ========================================
    /**
     * 获取用户个人信息
     * 🤔 这个方法做什么？
     * 答：1. 从 req.user 获取用户ID（中间件已解析）
     *     2. 调用 Service 查询用户信息
     *     3. 返回结果给前端
     */
    async getUserInfo(
        req: AuthenticatedRequest,
        res: Response<ApiResponse<UserInfoResponseData>>,
        next: NextFunction
    ): Promise<void> {
        try {
            // ========================================
            // 1️⃣ 获取用户ID
            // ========================================
            // 🤔 为什么这里直接用 req.user.id？
            // 答：authenticateToken 中间件已经把用户信息放到 req.user 了
            
            const userId = req.user!.id;  // ! 表示确定不为 undefined
            
            console.log(`📝 获取用户信息，用户ID: ${userId}`);

            // ========================================
            // 2️⃣ 调用 Service 层
            // ========================================
            const userInfo = await authService.getUserInfo(userId);

            // ========================================
            // 3️⃣ 返回成功响应
            // ========================================
            res.status(200).json({
                code: 200,
                msg: '获取成功',
                data: userInfo
            });
            
        } catch (error) {
            // ========================================
            // 4️⃣ 错误处理（交给全局错误处理中间件）
            // ========================================
            next(error);
        }
    }

    // ========================================
    // 🎯 用户登录
    // ========================================
    /**
     * 用户登录
     * 🤔 这个方法做什么？
     * 答：1. 接收邮箱和密码
     *     2. 调用 Service 验证并生成 Token
     *     3. 返回 Token 和用户信息
     */
    async login(
        req: Request<{}, {}, LoginRequestBody>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password } = req.body;
            
            console.log(`📝 用户登录请求，邮箱: ${email}`);

            // 调用 Service 层
            const result = await authService.login(email, password);

            // 返回成功响应
            res.status(200).json({
                code: 200,
                msg: '登录成功',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();


