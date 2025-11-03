// ========================================
// 自定义错误类
// ========================================
// 🤔 这个文件的职责：
// 答：定义业务错误的数据结构
//     可以在任何地方使用

/**
 * 应用错误类
 * 🤔 为什么要自定义？
 * 答：1. 携带额外信息（状态码、业务错误码）
 *     2. 区分业务错误和系统错误
 *     3. 统一错误格式
 */

export class AppError extends Error {
    public statusCode: number;
    public errorCode: string;
    public isOperational: boolean;

    constructor(statusCode: number, errorCode: string, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this); // 保持正确的堆栈跟踪（调试用）

    }

}