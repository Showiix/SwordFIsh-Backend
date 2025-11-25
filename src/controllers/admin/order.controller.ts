import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import adminOrderService from '../../services/admin/order.service';

class AdminOrderController {
  /**
   * 获取订单列表
   * GET /api/admin/orders
   */
  async getOrderList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, order_status, payment_status, keyword } = req.query;

      const result = await adminOrderService.getOrderList({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        order_status: order_status as string,
        payment_status: payment_status as string,
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
   * 获取订单详情
   * GET /api/admin/orders/:id
   */
  async getOrderDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderId = Number(req.params.id);
      const order = await adminOrderService.getOrderDetail(orderId);

      res.json({
        code: 200,
        msg: '获取成功',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取订单统计数据
   * GET /api/admin/orders/statistics
   */
  async getOrderStatistics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const statistics = await adminOrderService.getOrderStatistics();

      res.json({
        code: 200,
        msg: '获取成功',
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminOrderController();
