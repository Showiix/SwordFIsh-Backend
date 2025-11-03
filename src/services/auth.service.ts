//  ### **思路：**

// - Service 只负责**纯业务逻辑**
// - 不依赖 `req`、`res`（可以在任何地方调用）
// - 返回数据，不返回 HTTP 响应

//==============================================
// 认证服务层
//==============================================

import bcrypt from "bcrypt";
import User from "@/models/User";
import { RegisterRequestBody,UserResponseData } from "@/types";
import { AppError } from "@/utils/AppError";

class AuthService{
    async registerUser(data: RegisterRequestBody): Promise<UserResponseData> {
        const { username, email, password, student_id } = data;

        const existUserByEmail = await User.findOne({ where: { email } });
        if (existUserByEmail) {
            throw new AppError(400, "EMAIL_EXISTS", "邮箱已存在");
        }


        // 检查学号是否存在
        const existUserByStudentId = await User.findOne({ where: { student_id } });
        if (existUserByStudentId) {
            throw new AppError(400, "STUDENT_ID_EXISTS", "学号已存在");
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);


        // 创建用户
        // 这个是model层定义的User 
        // 是sequelize 库提供的create方法不用自己写sql语句
        const newUser = await User.create({
            student_id,
            email,
            password: hashedPassword,
            real_name: username,
            auth_status: 0,
            status: 'active',
            is_verified: false,
        });

        return {
            user_id: newUser.id,
            student_id: newUser.student_id,
            email: newUser.email,
            auth_status: newUser.auth_status,
            status: newUser.status,
            is_verified: newUser.is_verified,
        }

    }

}
export default new AuthService();  


