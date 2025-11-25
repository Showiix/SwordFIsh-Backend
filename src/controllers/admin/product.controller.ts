import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import adminProductService from '../../services/admin/product.service';

class AdminProductController {
  /**
   * 获取商品列表
   * GET /api/admin/products
   */
  async getProductList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, category_id, keyword } = req.query;

      const result = await adminProductService.getProductList({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        category_id: category_id ? Number(category_id) : undefined,
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
   * 获取商品详情
   * GET /api/admin/products/:id
   */
  async getProductDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const product = await adminProductService.getProductDetail(productId);

      res.json({
        code: 200,
        msg: '获取成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 审核商品
   * PUT /api/admin/products/:id/review
   */
  async reviewProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const { status, reason } = req.body;
      const adminId = req.user!.id;

      const product = await adminProductService.reviewProduct(productId, status, reason, adminId);

      res.json({
        code: 200,
        msg: '审核成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新商品状态
   * PUT /api/admin/products/:id/status
   */
  async updateProductStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const { status } = req.body;
      const adminId = req.user!.id;

      const product = await adminProductService.updateProductStatus(productId, status, adminId);

      res.json({
        code: 200,
        msg: '更新成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除商品
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const adminId = req.user!.id;

      const result = await adminProductService.deleteProduct(productId, adminId);

      res.json({
        code: 200,
        msg: '删除成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminProductController();
