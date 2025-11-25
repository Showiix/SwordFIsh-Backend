import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/AppError';
import User from '../models/User';

/**
 * 验证用户是否为管理员
 * 需要在 authenticateToken 之后使用
 */
export async function checkAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 检查是否已通过Token验证
    if (!req.user) {
      throw new AppError(401, 'AUTH_ERROR', '请先登录');
    }

    // 从数据库查询最新的用户信息（确保role字段是最新的）
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'student_id', 'email', 'role', 'status']
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    // 检查账户状态
    if (user.status === 'banned') {
      throw new AppError(403, 'ACCOUNT_BANNED', '账户已被封禁');
    }

    // 检查是否为管理员
    if (user.role !== 'admin') {
      throw new AppError(403, 'PERMISSION_DENIED', '无权限访问，仅限管理员');
    }

    // 将完整用户信息附加到请求对象
    req.user = {
      id: user.id,
      student_id: user.student_id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
}
