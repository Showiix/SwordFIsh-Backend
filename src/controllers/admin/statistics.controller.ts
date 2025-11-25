import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import adminStatisticsService from '../../services/admin/statistics.service';

class AdminStatisticsController {
  /**
   * 获取仪表盘数据
   * GET /api/admin/statistics/dashboard
   */
  async getDashboardData(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminStatisticsService.getDashboardData();

      res.json({
        code: 200,
        msg: '获取成功',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户增长趋势
   * GET /api/admin/statistics/user-growth
   */
  async getUserGrowthTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 7;
      const data = await adminStatisticsService.getUserGrowthTrend(days);

      res.json({
        code: 200,
        msg: '获取成功',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取交易额统计
   * GET /api/admin/statistics/sales
   */
  async getSalesTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date, group_by } = req.query;

      const params: any = {
        groupBy: (group_by as string) || 'day'
      };

      if (start_date) {
        params.startDate = new Date(start_date as string);
      }

      if (end_date) {
        params.endDate = new Date(end_date as string);
      }

      const data = await adminStatisticsService.getSalesTrend(params);

      res.json({
        code: 200,
        msg: '获取成功',
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminStatisticsController();
