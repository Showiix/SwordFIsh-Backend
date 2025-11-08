// ========================================
// 商品模块类型定义
// ========================================

// 商品成色枚举
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

// 商品类型枚举
export type ProductType = 'physical' | 'service' | 'skill_exchange';

// 商品状态枚举
export type ProductStatus = 'draft' | 'pending' | 'available' | 'reserved' | 'sold' | 'removed';

// ========================================
// 请求类型定义
// ========================================

/**
 * 发布商品请求体
 */
export interface CreateProductRequest {
  title: string;                    // 商品标题
  description: string;              // 商品描述
  price: number;                    // 商品价格
  original_price?: number;          // 原价（可选）
  category_id: number;              // 分类ID
  condition_level: ProductCondition; // 商品成色
  product_type: ProductType;        // 商品类型
  images?: string[];                // 图片URL数组
  location?: string;                // 交易地点
}

/**
 * 更新商品请求体（所有字段可选）
 */
export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  category_id?: number;
  condition_level?: ProductCondition;
  product_type?: ProductType;
  images?: string[];
  location?: string;
  status?: ProductStatus;
}

/**
 * 商品查询参数
 */
export interface ProductQuery {
  // 分页参数
  page?: number;                    // 页码，默认1
  limit?: number;                   // 每页数量，默认20

  // 筛选参数
  category_id?: number;             // 分类ID
  condition_level?: ProductCondition; // 商品成色
  product_type?: ProductType;       // 商品类型
  status?: ProductStatus;           // 商品状态
  seller_id?: number;               // 卖家ID

  // 价格范围
  min_price?: number;               // 最低价格
  max_price?: number;               // 最高价格

  // 搜索
  keyword?: string;                 // 关键词（搜索标题和描述）

  // 排序
  sort_by?: 'created_at' | 'price' | 'view_count' | 'favorite_count'; // 排序字段
  order?: 'ASC' | 'DESC';           // 排序方向

  // 特殊筛选
  is_featured?: boolean;            // 是否推荐商品
}

/**
 * 更新商品状态请求体
 */
export interface UpdateProductStatusRequest {
  status: ProductStatus;
}

// ========================================
// 响应类型定义
// ========================================

/**
 * 卖家信息（简化版）
 */
export interface SellerInfo {
  id: number;
  username: string;
  avatar?: string;
  credit_score?: number;            // 信用分数
}

/**
 * 分类信息（简化版）
 */
export interface CategoryInfo {
  id: number;
  name: string;
  parent_id?: number;
  icon?: string;
}

/**
 * 商品详情响应
 */
export interface ProductResponse {
  id: number;
  seller_id: number;
  seller?: SellerInfo;              // 卖家信息（关联查询）

  title: string;
  description: string;
  price: number;
  original_price?: number;

  category_id: number;
  category?: CategoryInfo;          // 分类信息（关联查询）

  condition_level: ProductCondition;
  product_type: ProductType;
  images?: string[];
  location?: string;

  status: ProductStatus;
  view_count: number;
  favorite_count: number;
  is_featured: boolean;

  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * 商品列表响应
 */
export interface ProductListResponse {
  products: ProductResponse[];     // 商品列表
  pagination: {
    page: number;                   // 当前页码
    limit: number;                  // 每页数量
    total: number;                  // 总记录数
    totalPages: number;             // 总页数
  };
}

/**
 * 商品统计信息
 */
export interface ProductStats {
  total_products: number;           // 总商品数
  available_products: number;       // 可售商品数
  sold_products: number;            // 已售商品数
  total_views: number;              // 总浏览量
  total_favorites: number;          // 总收藏量
}
