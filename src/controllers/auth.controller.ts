// ========================================
// 认证控制器
// ========================================
// 🤔 这个文件的职责：
//  处理http，捕获Service抛出的错误

import { Request, Response, NextFunction } from "express";
import { RegisterRequestBody, ApiResponse, UserResponseData } from "../types";
import authService from "../services/auth.service";


class AuthController{
    async register(
        req: Request<{}, {}, RegisterRequestBody>,
        res: Response<ApiResponse<UserResponseData>>,
        next: NextFunction
    ): Promise<void> {
    {
        try {

            const userData = await authService.registerUser(req.body);

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

}
}

export default new AuthController();


