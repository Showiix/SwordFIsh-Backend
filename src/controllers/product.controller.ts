// ========================================
// 商品控制器
// ========================================
// 🤔 职责：
// - 处理 HTTP 请求和响应
// - 调用 Service 层处理业务逻辑
// - 捕获错误并传递给错误处理中间件

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse } from "@/types";
import productService from "@/services/product.service";

class ProductController {
  // ========================================
  // 🎯 发布商品
  // ========================================
  /**
   * 创建新商品
   * POST /api/products
   */
  async createProduct(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      console.log(`📝 发布商品请求，用户ID: ${userId}`);

      // 调用 Service 层
      const product = await productService.createProduct({
        seller_id: userId,
        ...req.body
      });

      res.status(201).json({
        code: 201,
        msg: '商品发布成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 更新商品信息
  // ========================================
  /**
   * 更新商品
   * PUT /api/products/:id
   */
  async updateProduct(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.id);

      console.log(`📝 更新商品请求，商品ID: ${productId}，用户ID: ${userId}`);

      const product = await productService.updateProduct(
        productId,
        userId,
        req.body
      );

      res.status(200).json({
        code: 200,
        msg: '商品更新成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 删除商品
  // ========================================
  /**
   * 删除商品（软删除）
   * DELETE /api/products/:id
   */
  async deleteProduct(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.id);

      console.log(`🗑️ 删除商品请求，商品ID: ${productId}，用户ID: ${userId}`);

      await productService.deleteProduct(productId, userId);

      res.status(200).json({
        code: 200,
        msg: '商品已删除',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 获取商品详情
  // ========================================
  /**
   * 获取商品详情
   * GET /api/products/:id
   */
  async getProductDetail(
    req: Request,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.id);

      // 获取当前用户ID（如果已登录）
      const viewerId = (req as AuthenticatedRequest).user?.id;

      console.log(`🔍 查询商品详情，商品ID: ${productId}`);

      const product = await productService.getProductById(productId, viewerId);

      res.status(200).json({
        code: 200,
        msg: '获取成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 获取商品列表
  // ========================================
  /**
   * 获取商品列表（支持筛选、分页、排序）
   * GET /api/products
   *
   * Query 参数：
   * - page: 页码（默认1）
   * - limit: 每页数量（默认20）
   * - category_id: 分类ID
   * - product_type: 商品类型
   * - condition_level: 成色
   * - min_price: 最低价格
   * - max_price: 最高价格
   * - keyword: 搜索关键词
   * - sort: 排序字段（created_at/price/view_count）
   * - order: 排序方向（ASC/DESC）
   */
  async getProductList(
    req: Request,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(`🔍 查询商品列表`);

      // 从查询参数构建查询对象
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
        product_type: req.query.product_type as string,
        condition_level: req.query.condition_level as string,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        keyword: req.query.keyword as string,
        sort: (req.query.sort as any) || 'created_at',
        order: (req.query.order as any) || 'DESC',
        status: req.query.status as string || 'available'
      };

      const result = await productService.getProductList(query);

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
  // 🎯 获取我的商品
  // ========================================
  /**
   * 获取当前用户发布的所有商品
   * GET /api/products/my
   */
  async getMyProducts(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      console.log(`🔍 查询我的商品，用户ID: ${userId}`);

      const result = await productService.getMyProducts(userId, page, limit);

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
  // 🎯 修改商品状态
  // ========================================
  /**
   * 修改商品状态（上架/下架等）
   * PATCH /api/products/:id/status
   */
  async updateProductStatus(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.id);
      const { status } = req.body;

      console.log(`📝 更新商品状态，商品ID: ${productId}，新状态: ${status}`);

      const product = await productService.updateProduct(
        productId,
        userId,
        { status }
      );

      res.status(200).json({
        code: 200,
        msg: '状态更新成功',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
