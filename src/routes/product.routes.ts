// ========================================
// 商品路由配置
// ========================================
// 作用：定义所有商品相关的API端点
// 🤔 路由设计原则：
// - RESTful 风格
// - 需要认证的路由使用 authenticateToken 中间件
// - 所有写操作（POST/PUT/DELETE）都需要认证

import { Router } from "express";
import productController from "@/controllers/product.controller";
import { requestLogger } from "@/middleware/logger";
import { authenticateToken } from "@/middleware/authenticateToken";
import { apiLimiter } from "@/middleware/rateLimiter";
import { validateCreateProduct, validateUpdateProduct, validateUpdateStatus } from "@/middleware/validateProduct";
import { upload } from "@/config/upload";

const router = Router();

// ========================================
// 🎯 公开路由（无需认证）
// ========================================

/**
 * 获取商品列表
 * GET /api/products
 *
 * Query 参数：
 * - page: 页码
 * - limit: 每页数量
 * - category_id: 分类ID
 * - product_type: 商品类型
 * - condition_level: 成色
 * - min_price: 最低价格
 * - max_price: 最高价格
 * - keyword: 搜索关键词
 * - sort: 排序字段
 * - order: 排序方向
 */
router.get(
  '/',
  requestLogger,
  productController.getProductList.bind(productController)
);

/**
 * 获取商品详情
 * GET /api/products/:id
 */
router.get(
  '/:id',
  requestLogger,
  productController.getProductDetail.bind(productController)
);

// ========================================
// 🎯 需要认证的路由
// ========================================

/**
 * 获取我的商品
 * GET /api/products/my/list
 *
 * 🤔 为什么路径是 /my/list？
 * 答：因为 /my 会和 /:id 冲突（Express会把 my 当作 id）
 *     所以需要把 /my/list 放在 /:id 之前，或者使用不同的路径
 */
router.get(
  '/my/list',
  requestLogger,
  authenticateToken,
  productController.getMyProducts.bind(productController)
);

/**
 * 发布商品
 * POST /api/products
 *
 * Body 参数：
 * - title: 商品标题（必填）
 * - description: 商品描述
 * - price: 价格（必填）
 * - original_price: 原价
 * - category_id: 分类ID（必填）
 * - condition_level: 成色（必填）
 * - product_type: 商品类型
 * - images: 图片数组
 * - location: 交易地点
 */
router.post(
  '/',
  apiLimiter,                    // 限流
  requestLogger,
  authenticateToken,             // 验证身份
  validateCreateProduct,         // 验证商品数据
  productController.createProduct.bind(productController)
);

/**
 * 更新商品信息
 * PUT /api/products/:id
 */
router.put(
  '/:id',
  requestLogger,
  authenticateToken,
  validateUpdateProduct,         // 验证更新数据
  productController.updateProduct.bind(productController)
);

/**
 * 修改商品状态
 * PATCH /api/products/:id/status
 *
 * Body 参数：
 * - status: 新状态（draft/available/reserved/sold）
 */
router.patch(
  '/:id/status',
  requestLogger,
  authenticateToken,
  validateUpdateStatus,          // 验证状态数据
  productController.updateProductStatus.bind(productController)
);

/**
 * 删除商品（软删除）
 * DELETE /api/products/:id
 */
router.delete(
  '/:id',
  requestLogger,
  authenticateToken,
  productController.deleteProduct.bind(productController)
);

// ========================================
// 🎯 图片管理路由
// ========================================

/**
 * 上传商品图片
 * POST /api/products/:id/images
 *
 * 🤔 为什么使用 memoryStorage？
 * 答：因为要上传到 MinIO，不需要先保存到本地磁盘
 */
router.post(
  '/:id/images',
  requestLogger,
  authenticateToken,
  upload.array('images', 10),  // 最多10张图片
  productController.uploadImages.bind(productController)
);

/**
 * 删除商品图片
 * DELETE /api/products/:id/images
 *
 * Body 参数：
 * - imageUrl: 要删除的图片URL
 */
router.delete(
  '/:id/images',
  requestLogger,
  authenticateToken,
  productController.deleteImage.bind(productController)
);

// ========================================
// 🎯 TODO: 待实现的路由
// ========================================

// /**
//  * 收藏/取消收藏商品
//  * POST /api/products/:id/favorite
//  */
// router.post(
//   '/:id/favorite',
//   requestLogger,
//   authenticateToken,
//   productController.toggleFavorite.bind(productController)
// );

export default router;
