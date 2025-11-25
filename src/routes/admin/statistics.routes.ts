import { Router } from 'express';
import adminStatisticsController from '../../controllers/admin/statistics.controller';
import { authenticateToken } from '../../middleware/authenticateToken';
import { checkAdmin } from '../../middleware/checkAdmin';

const router = Router();

// 所有路由都需要登录和管理员权限
router.use(authenticateToken, checkAdmin);

// 获取仪表盘数据
router.get('/dashboard', adminStatisticsController.getDashboardData);

// 获取用户增长趋势
router.get('/user-growth', adminStatisticsController.getUserGrowthTrend);

// 获取交易额统计
router.get('/sales', adminStatisticsController.getSalesTrend);

export default router;
