import { Router } from 'express';
import adminComplaintController from '../../controllers/admin/complaint.controller';
import { authenticateToken } from '../../middleware/authenticateToken';
import { checkAdmin } from '../../middleware/checkAdmin';

const router = Router();

// 所有路由都需要登录和管理员权限
router.use(authenticateToken, checkAdmin);

// 获取投诉列表
router.get('/', adminComplaintController.getComplaintList);

// 获取投诉详情
router.get('/:id', adminComplaintController.getComplaintDetail);

// 处理投诉
router.put('/:id/handle', adminComplaintController.handleComplaint);

export default router;
