import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import adminUserService from '../../services/admin/user.service';

class AdminUserController {
  /**
   * 获取用户列表
   * GET /api/admin/users
   */
  async getUserList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, auth_status, keyword } = req.query;

      const result = await adminUserService.getUserList({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        auth_status: auth_status ? Number(auth_status) : undefined,
        keyword: keyword as string
      });

      res.json({
        code: 200,
        msg: '获取成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户详情
   * GET /api/admin/users/:id
   */
  async getUserDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const user = await adminUserService.getUserDetail(userId);

      res.json({
        code: 200,
        msg: '获取成功',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户订单记录
   * GET /api/admin/users/:id/orders
   */
  async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const type = req.query.type as 'purchase' | 'sales' | undefined;

      const orders = await adminUserService.getUserOrders(userId, type);

      res.json({
        code: 200,
        msg: '获取成功',
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户信用记录
   * GET /api/admin/users/:id/credits
   */
  async getUserCredits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const credits = await adminUserService.getUserCredits(userId);

      res.json({
        code: 200,
        msg: '获取成功',
        data: credits
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户状态
   * PUT /api/admin/users/:id/status
   */
  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const { status } = req.body;
      const adminId = req.user!.id;

      const user = await adminUserService.updateUserStatus(userId, status, adminId);

      res.json({
        code: 200,
        msg: '更新成功',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新认证状态
   * PUT /api/admin/users/:id/auth-status
   */
  async updateAuthStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const { auth_status } = req.body;
      const adminId = req.user!.id;

      const user = await adminUserService.updateAuthStatus(userId, auth_status, adminId);

      res.json({
        code: 200,
        msg: '更新成功',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 调整信用分
   * POST /api/admin/users/:id/credit
   */
  async adjustCreditScore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const { change_amount, reason } = req.body;
      const adminId = req.user!.id;

      const result = await adminUserService.adjustCreditScore({
        userId,
        changeAmount: change_amount,
        reason,
        adminId
      });

      res.json({
        code: 200,
        msg: '调整成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminUserController();
