// ========================================
// 收藏控制器
// ========================================
// 🤔 职责：
// - 处理 HTTP 请求和响应
// - 调用 Service 层处理业务逻辑
// - 捕获错误并传递给错误处理中间件

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import favoriteService from '@/services/favorite.service';

class FavoriteController {
  // ========================================
  // 🎯 收藏商品
  // ========================================
  /**
   * 收藏商品
   * POST /api/favorites
   */
  async addFavorite(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { product_id } = req.body;

      if (!product_id) {
        res.status(400).json({
          code: 400,
          msg: '缺少 product_id 参数',
          data: null
        });
        return;
      }

      console.log(`❤️ 收藏商品请求，用户ID: ${userId}，商品ID: ${product_id}`);

      await favoriteService.addFavorite(userId, parseInt(product_id));

      res.status(201).json({
        code: 201,
        msg: '收藏成功',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 取消收藏
  // ========================================
  /**
   * 取消收藏商品
   * DELETE /api/favorites/:productId
   */
  async removeFavorite(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);

      console.log(`💔 取消收藏请求，用户ID: ${userId}，商品ID: ${productId}`);

      await favoriteService.removeFavorite(userId, productId);

      res.status(200).json({
        code: 200,
        msg: '取消收藏成功',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 获取我的收藏列表
  // ========================================
  /**
   * 获取当前用户的收藏列表
   * GET /api/favorites
   */
  async getMyFavorites(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      console.log(`🔍 查询我的收藏请求，用户ID: ${userId}`);

      const result = await favoriteService.getMyFavorites(userId, page, limit);

      res.status(200).json({
        code: 200,
        msg: '获取成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 检查收藏状态
  // ========================================
  /**
   * 检查是否收藏了某个商品
   * GET /api/favorites/check/:productId
   */
  async checkFavorited(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<{ is_favorited: boolean }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);

      const isFavorited = await favoriteService.isFavorited(userId, productId);

      res.status(200).json({
        code: 200,
        msg: '查询成功',
        data: { is_favorited: isFavorited }
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 批量检查收藏状态
  // ========================================
  /**
   * 批量检查多个商品的收藏状态
   * POST /api/favorites/batch-check
   */
  async batchCheckFavorited(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<Record<number, boolean>>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { product_ids } = req.body;

      if (!Array.isArray(product_ids) || product_ids.length === 0) {
        res.status(400).json({
          code: 400,
          msg: 'product_ids 必须是非空数组',
          data: {} as any
        });
        return;
      }

      const result = await favoriteService.batchCheckFavorited(userId, product_ids);

      res.status(200).json({
        code: 200,
        msg: '查询成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FavoriteController();
