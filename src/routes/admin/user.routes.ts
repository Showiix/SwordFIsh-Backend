import { Router } from 'express';
import adminUserController from '../../controllers/admin/user.controller';
import { authenticateToken } from '../../middleware/authenticateToken';
import { checkAdmin } from '../../middleware/checkAdmin';

const router = Router();

// 所有路由都需要登录和管理员权限
router.use(authenticateToken, checkAdmin);

// 获取用户列表
router.get('/', adminUserController.getUserList);

// 获取用户详情
router.get('/:id', adminUserController.getUserDetail);

// 获取用户订单记录
router.get('/:id/orders', adminUserController.getUserOrders);

// 获取用户信用记录
router.get('/:id/credits', adminUserController.getUserCredits);

// 更新用户状态（封禁/解封）
router.put('/:id/status', adminUserController.updateUserStatus);

// 更新认证状态
router.put('/:id/auth-status', adminUserController.updateAuthStatus);

// 调整信用分
router.post('/:id/credit', adminUserController.adjustCreditScore);

export default router;
