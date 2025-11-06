//  ### **思路：**

// - Service 只负责**纯业务逻辑**
// - 不依赖 `req`、`res`（可以在任何地方调用）
// - 返回数据，不返回 HTTP 响应

//==============================================
// 认证服务层
//==============================================


import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { RegisterRequestBody, UserResponseData, UserInfoResponseData } from "@/types";
import { AppError } from "@/utils/AppError";
import config from "@/config";

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
            username,
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

    // ========================================
    // 🎯 获取用户个人信息
    // ========================================
    /**
     * 根据用户ID获取用户信息
     * 🤔 为什么要单独写一个方法？
     * 答：1. Service 层只负责业务逻辑，不处理 HTTP
     *     2. 这个方法可以被其他地方复用
     */
    async getUserInfo(userId: number): Promise<UserInfoResponseData> {
        console.log(`🔍 查询用户信息，用户ID: ${userId}`);

        // ========================================
        // 1️⃣ 查询数据库
        // ========================================
        // 🤔 User.findByPk 是什么？
        // 答：Sequelize 提供的方法，通过主键（Primary Key）查询
        //     相当于 SQL: SELECT * FROM users WHERE id = ?
        
        const user = await User.findByPk(userId, {
            // 指定要查询的字段（排除敏感信息）
            attributes: [
                'id',
                'student_id',
                'email',
                'real_name',
                'phone',
                'avatar_url',
                'auth_status',
                'status',
                'created_at'
            ]
        });

        // ========================================
        // 2️⃣ 检查用户是否存在
        // ========================================
        if (!user) {
            console.log('❌ 用户不存在');
            throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
        }

        // ========================================
        // 3️⃣ 获取信用分数
        // ========================================
        // 🤔 为什么要单独查信用分数？
        // 答：信用分数在 user_credit 表，需要关联查询
        //     或者在 User Model 定义关联关系（更优雅）
        
        // 简化版：先返回默认值 500
        // TODO: 后续可以关联查询 user_credit 表
        const creditScore = 500;

        // ========================================
        // 4️⃣ 返回格式化的数据
        // ========================================
        return {
            user_id: user.id,
            student_id: user.student_id,
            email: user.email,
            real_name: user.real_name || undefined,  // null 转为 undefined
            phone: user.phone || undefined,
            avatar_url: user.avatar_url || undefined,
            auth_status: user.auth_status,
            credit_score: creditScore,
            status: user.status,
            created_at: user.created_at
        };
    }

    // ========================================
    // 🎯 用户登录
    // ========================================
    /**
     * 用户登录
     * 🤔 这个方法做什么？
     * 答：1. 验证邮箱和密码
     *     2. 生成 JWT Token
     *     3. 返回 Token 和用户信息
     */
    async login(email: string, password: string): Promise<{
        token: string;
        user: UserInfoResponseData;
    }> {
        console.log(`🔐 用户登录，邮箱: ${email}`);

        // ========================================
        // 1️⃣ 查找用户
        // ========================================
        const user = await User.findOne({ 
            where: { email } 
        });

        if (!user) {
            console.log('❌ 用户不存在');
            throw new AppError(401, 'LOGIN_FAILED', '邮箱或密码错误');
        }

        // ========================================
        // 2️⃣ 验证密码
        // ========================================
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ 密码错误');
            throw new AppError(401, 'LOGIN_FAILED', '邮箱或密码错误');
        }

        // ========================================
        // 3️⃣ 生成 JWT Token
        // ========================================
        const payload = {
            id: user.id,
            student_id: user.student_id,
            email: user.email
        };
        
        // @ts-ignore - JWT类型定义的已知问题
        const token: string = jwt.sign(
            payload, 
            config.jwt.secret, 
            { expiresIn: config.jwt.expiresIn }
        );

        console.log(`✅ 登录成功，用户ID: ${user.id}`);

        // ========================================
        // 4️⃣ 获取用户完整信息
        // ========================================
        const userInfo = await this.getUserInfo(user.id);

        return {
            token,
            user: userInfo
        };
    }

}
export default new AuthService();  


