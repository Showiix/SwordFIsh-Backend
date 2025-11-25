import { Router } from 'express';
import adminProductController from '../../controllers/admin/product.controller';
import { authenticateToken } from '../../middleware/authenticateToken';
import { checkAdmin } from '../../middleware/checkAdmin';

const router = Router();

// 所有路由都需要登录和管理员权限
router.use(authenticateToken, checkAdmin);

// 获取商品列表
router.get('/', adminProductController.getProductList);

// 获取商品详情
router.get('/:id', adminProductController.getProductDetail);

// 审核商品
router.put('/:id/review', adminProductController.reviewProduct);

// 更新商品状态（上下架）
router.put('/:id/status', adminProductController.updateProductStatus);

// 删除商品
router.delete('/:id', adminProductController.deleteProduct);

export default router;
