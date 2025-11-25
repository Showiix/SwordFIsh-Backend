import { Router } from 'express';
import adminOrderController from '../../controllers/admin/order.controller';
import { authenticateToken } from '../../middleware/authenticateToken';
import { checkAdmin } from '../../middleware/checkAdmin';

const router = Router();

// 所有路由都需要登录和管理员权限
router.use(authenticateToken, checkAdmin);

// 获取订单统计数据（需要放在 /:id 之前）
router.get('/statistics', adminOrderController.getOrderStatistics);

// 获取订单列表
router.get('/', adminOrderController.getOrderList);

// 获取订单详情
router.get('/:id', adminOrderController.getOrderDetail);

export default router;
