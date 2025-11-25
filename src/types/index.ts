// ========================================
// 类型定义文件
// ========================================
// 🤔 为什么单独一个文件？
// 答：类型是整个项目的"字典"
//     集中管理，方便维护

// ========================================
// 🎯 第1组：API请求和响应的类型
// ========================================

/**
 * 注册请求体
 * 🤔 对应前端发送的数据
 */

export interface RegisterRequestBody {
    username: string; // 用户名
    email: string; // 邮箱
    password: string; // 密码
    student_id: string; // 学号
}


// 🤔 为什么没有confirmPassword？
// 答：那是前端验证用的，不需要发到后端


// 登陆请求体

export interface LoginRequestBody {
    email: string; // 邮箱
    password: string; // 密码
}


/**
 * 统一API响应格式
 * 🤔 为什么用泛型<T>？
 * 答：data字段的类型不固定
 *     注册时返回用户信息
 *     登录时返回token
 *     所以用泛型
 */

export interface ApiResponse<T> {
    code: number; // 状态码
    msg: string; // 消息
    data: T | null; // 数据，可能为空
}



// ========================================
// 🎯 第2组：数据库模型类型
// ========================================


/**
 * 用户数据库模型
 * 🤔 对应数据库users表的完整结构
 * 🚨 包含所有字段，包括敏感信息
 */

export interface UserAttributes {
    id: number;                              // 主键
    student_id: string;                      // 学号
    username: string;                        // 用户名
    email: string;                    // 邮箱
    password: string;                        // ⚠️ 加密后的密码
    real_name?: string;                      // 真实姓名（可选）
    phone?: string;                          // 手机号（可选）
    avatar_url?: string;                     // 头像URL
    auth_status: number;                     // 认证状态：0未认证，1已认证
    status: 'active' | 'inactive' | 'banned'; // 账户状态
    last_login?: Date;                       // 最后登录时间
    verification_token?: string;             // ⚠️ 邮箱验证令牌
    is_verified: boolean;                    // 是否已验证邮箱
    created_at: Date;                        // 创建时间
    updated_at: Date;                        // 更新时间
}

/**
 * 用户公开信息
 * 🤔 为什么要单独定义？
 * 答：返回给前端时，要排除敏感信息
 *     如 password、verification_token
 */
export interface UserResponseData {
    user_id: number;                              // 主键
    student_id: string;                      // 学号
    email: string;                    // 邮箱
    auth_status: number;                     // 认证状态：0未认证，1已认证
    status: 'active' | 'inactive' | 'banned'; // 账户状态
    is_verified: boolean;                    // 是否已验证邮箱
}



// ========================================
// 🎯 第3组：Express扩展类型
// ========================================


import { Request } from "express";


export interface AuthRequest extends Request {
    user?: UserAttributes;
}

// ========================================
// 🎯 获取个人信息相关类型
// ========================================

/**
 * 获取用户信息的响应数据
 * 🤔 为什么要单独定义？
 * 答：和注册返回的数据不同，这里包含更多信息（如头像、手机号、信用分数等）
 */
export interface UserInfoResponseData {
    user_id: number;              // 用户ID
    student_id: string;           // 学号
    email: string;                // 邮箱
    real_name?: string;           // 真实姓名（可选）
    phone?: string;               // 手机号（可选）
    avatar_url?: string;          // 头像URL（可选）
    auth_status: number;          // 认证状态：0=未认证，1=已认证
    credit_score: number;         // 信用分数
    status: 'active' | 'inactive' | 'banned';  // 账户状态
    created_at: Date;             // 注册时间
}

/**
 * 扩展 Express Request 类型（用于JWT认证）
 * 🤔 为什么要扩展？
 * 答：JWT 中间件会把解析出的用户信息放到 req.user
 *     但默认的 Request 类型没有 user 属性
 *     所以需要扩展，让 TypeScript 知道有这个属性
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;           // 从 Token 解析出的用户ID
        student_id: string;   // 从 Token 解析出的学号
        email: string;        // 从 Token 解析出的邮箱
    };
    // Multer 的文件类型定义（支持多种格式）
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    file?: Express.Multer.File;     // Multer 上传的单个文件
}

// ========================================
// 🎯 第4组：聊天模块类型定义
// ========================================

/**
 * 消息类型枚举
 */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * 消息数据库模型
 */
export interface MessageAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id?: number;
  order_id?: number;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  read_at?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * 发送消息请求体
 */
export interface SendMessageRequest {
  receiver_id: number;
  content: string;
  message_type?: MessageType;
  product_id?: number;
  order_id?: number;
}

/**
 * 聊天会话信息
 */
export interface ConversationInfo {
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  lastMessage: MessageAttributes;
  unreadCount: number;
}
