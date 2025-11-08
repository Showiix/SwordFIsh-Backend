// ========================================
// 商品验证中间件
// ========================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductCondition,
  ProductType,
  ProductStatus
} from '@/types/product.types';

// ========================================
// 验证工具函数
// ========================================

/**
 * 验证商品标题
 */
function isValidTitle(title: string): boolean {
  return title && title.length >= 2 && title.length <= 200;
}

/**
 * 验证商品描述
 */
function isValidDescription(description: string): boolean {
  return description && description.length <= 2000;
}

/**
 * 验证价格
 */
function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0.01 && price <= 100000;
}

/**
 * 验证分类ID
 */
function isValidCategoryId(categoryId: number): boolean {
  return Number.isInteger(categoryId) && categoryId > 0;
}

/**
 * 验证商品成色
 */
function isValidCondition(condition: string): boolean {
  const validConditions: ProductCondition[] = ['new', 'like_new', 'good', 'fair', 'poor'];
  return validConditions.includes(condition as ProductCondition);
}

/**
 * 验证商品类型
 */
function isValidProductType(type: string): boolean {
  const validTypes: ProductType[] = ['physical', 'service', 'skill_exchange'];
  return validTypes.includes(type as ProductType);
}

/**
 * 验证商品状态
 */
function isValidStatus(status: string): boolean {
  const validStatuses: ProductStatus[] = ['draft', 'pending', 'available', 'reserved', 'sold', 'removed'];
  return validStatuses.includes(status as ProductStatus);
}

/**
 * 验证图片数组
 */
function isValidImages(images: any): boolean {
  if (!images) return true; // 可选字段
  if (!Array.isArray(images)) return false;
  if (images.length > 10) return false; // 最多10张图片

  // 验证每个URL格式
  const urlRegex = /^https?:\/\/.+/;
  return images.every((img: string) => typeof img === 'string' && urlRegex.test(img));
}

// ========================================
// 发布商品验证中间件
// ========================================

export function validateCreateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const {
    title,
    description,
    price,
    original_price,
    category_id,
    condition_level,
    product_type,
    images,
    location
  } = req.body as CreateProductRequest;

  // 1. 验证必填字段
  if (!title || !description || price === undefined || !category_id || !condition_level || !product_type) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '缺少必填字段（title, description, price, category_id, condition_level, product_type）',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 2. 验证标题
  if (!isValidTitle(title)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品标题长度必须在 2-200 字符之间',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 3. 验证描述
  if (!isValidDescription(description)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品描述不能为空，且长度不能超过 2000 字符',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 4. 验证价格
  if (!isValidPrice(price)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品价格必须在 0.01 - 100000 之间',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 5. 验证原价（如果提供）
  if (original_price !== undefined && !isValidPrice(original_price)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '原价格式不正确',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 6. 验证原价应该大于等于售价
  if (original_price !== undefined && original_price < price) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '原价不能低于售价',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 7. 验证分类ID
  if (!isValidCategoryId(category_id)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '分类ID格式不正确',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 8. 验证商品成色
  if (!isValidCondition(condition_level)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品成色必须是以下之一：new, like_new, good, fair, poor',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 9. 验证商品类型
  if (!isValidProductType(product_type)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品类型必须是以下之一：physical, service, skill_exchange',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 10. 验证图片数组
  if (images && !isValidImages(images)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '图片格式不正确（最多10张，必须是有效的URL）',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 11. 验证地点长度
  if (location && location.length > 100) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '交易地点长度不能超过 100 字符',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 验证通过，继续执行
  console.log('✅ 商品数据验证通过');
  next();
}

// ========================================
// 更新商品验证中间件
// ========================================

export function validateUpdateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const {
    title,
    description,
    price,
    original_price,
    category_id,
    condition_level,
    product_type,
    images,
    location,
    status
  } = req.body as UpdateProductRequest;

  // 更新时所有字段都是可选的，但如果提供了就要验证

  // 1. 验证标题
  if (title !== undefined && !isValidTitle(title)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品标题长度必须在 2-200 字符之间',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 2. 验证描述
  if (description !== undefined && !isValidDescription(description)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品描述长度不能超过 2000 字符',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 3. 验证价格
  if (price !== undefined && !isValidPrice(price)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品价格必须在 0.01 - 100000 之间',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 4. 验证原价
  if (original_price !== undefined && !isValidPrice(original_price)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '原价格式不正确',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 5. 验证分类ID
  if (category_id !== undefined && !isValidCategoryId(category_id)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '分类ID格式不正确',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 6. 验证商品成色
  if (condition_level !== undefined && !isValidCondition(condition_level)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品成色必须是以下之一：new, like_new, good, fair, poor',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 7. 验证商品类型
  if (product_type !== undefined && !isValidProductType(product_type)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品类型必须是以下之一：physical, service, skill_exchange',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 8. 验证图片
  if (images !== undefined && !isValidImages(images)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '图片格式不正确（最多10张，必须是有效的URL）',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 9. 验证地点
  if (location !== undefined && location.length > 100) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '交易地点长度不能超过 100 字符',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 10. 验证状态
  if (status !== undefined && !isValidStatus(status)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '商品状态必须是以下之一：draft, pending, available, reserved, sold, removed',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 验证通过
  console.log('✅ 更新商品数据验证通过');
  next();
}

// ========================================
// 更新商品状态验证中间件
// ========================================

export function validateUpdateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { status } = req.body;

  // 1. 验证必填字段
  if (!status) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '缺少 status 字段',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 2. 验证状态值
  if (!isValidStatus(status)) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '状态值不正确，必须是：draft, pending, available, reserved, sold, removed',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 验证通过
  next();
}
