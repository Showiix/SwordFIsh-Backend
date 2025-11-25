// ========================================
// 收藏路由配置
// ========================================
// 作用：定义所有收藏相关的API端点

import { Router } from 'express';
import favoriteController from '@/controllers/favorite.controller';
import { requestLogger } from '@/middleware/logger';
import { authenticateToken } from '@/middleware/authenticateToken';

const router = Router();

// ========================================
// 🎯 所有收藏路由都需要认证
// ========================================

/**
 * 获取我的收藏列表
 * GET /api/favorites
 *
 * Query 参数：
 * - page: 页码（默认1）
 * - limit: 每页数量（默认20）
 */
router.get(
  '/',
  requestLogger,
  authenticateToken,
  favoriteController.getMyFavorites.bind(favoriteController)
);

/**
 * 收藏商品
 * POST /api/favorites
 *
 * Body 参数：
 * - product_id: 商品ID（必填）
 */
router.post(
  '/',
  requestLogger,
  authenticateToken,
  favoriteController.addFavorite.bind(favoriteController)
);

/**
 * 检查是否收藏某个商品
 * GET /api/favorites/check/:productId
 */
router.get(
  '/check/:productId',
  requestLogger,
  authenticateToken,
  favoriteController.checkFavorited.bind(favoriteController)
);

/**
 * 批量检查收藏状态
 * POST /api/favorites/batch-check
 *
 * Body 参数：
 * - product_ids: 商品ID数组（必填）
 */
router.post(
  '/batch-check',
  requestLogger,
  authenticateToken,
  favoriteController.batchCheckFavorited.bind(favoriteController)
);

/**
 * 取消收藏商品
 * DELETE /api/favorites/:productId
 */
router.delete(
  '/:productId',
  requestLogger,
  authenticateToken,
  favoriteController.removeFavorite.bind(favoriteController)
);

export default router;
