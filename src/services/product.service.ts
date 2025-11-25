// ========================================
// 商品服务层
// ========================================
// 🤔 职责：
// - 处理商品相关的业务逻辑
// - 不依赖 HTTP 请求/响应对象
// - 返回数据，抛出错误由 Controller 捕获

import { AppError } from "@/utils/AppError";
import { Op, literal } from "sequelize";
import { minioClient, BUCKETS, getPublicUrl } from '@/config/minio';
import crypto from 'crypto';

// 导入模型 (TypeScript 版本)
import { Product, Category } from "@/models/Product";
import User from "@/models/User";

// ========================================
// 🎯 接口定义
// ========================================

interface CreateProductData {
  seller_id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  condition_level: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  product_type?: 'physical' | 'service' | 'skill_exchange';
  images?: string[];
  location?: string;
}

interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  category_id?: number;
  condition_level?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  product_type?: 'physical' | 'service' | 'skill_exchange';
  images?: string[];
  location?: string;
  status?: 'draft' | 'pending' | 'available' | 'reserved' | 'sold' | 'removed';
}

interface ProductListQuery {
  page?: number;
  limit?: number;
  category_id?: number;
  product_type?: string;
  condition_level?: string;
  min_price?: number;
  max_price?: number;
  keyword?: string;
  sort?: 'created_at' | 'price' | 'view_count';
  order?: 'ASC' | 'DESC';
  status?: string;
}

class ProductService {
  // ========================================
  // 🎯 发布商品
  // ========================================
  /**
   * 创建新商品
   * 🤔 为什么要检查分类？
   * 答：确保分类存在且状态为 active
   */
  async createProduct(data: CreateProductData): Promise<any> {
    console.log(`📝 创建商品，卖家ID: ${data.seller_id}`);

    // 1️⃣ 验证分类是否存在
    const category = await Category.findByPk(data.category_id);
    if (!category || category.status !== 'active') {
      throw new AppError(400, 'INVALID_CATEGORY', '无效的商品分类');
    }

    // 2️⃣ 创建商品
    const product = await Product.create({
      ...data,
      images: data.images ?? null,
      status: 'pending', // 默认待审核
      view_count: 0,
      favorite_count: 0,
      is_featured: false
    });

    console.log(`✅ 商品创建成功，ID: ${product.id}`);
    return this.formatProductResponse(product);
  }

  // ========================================
  // 🎯 更新商品信息
  // ========================================
  /**
   * 更新商品
   * 🤔 为什么要验证所有者？
   * 答：只有卖家本人才能修改自己的商品
   */
  async updateProduct(
    productId: number,
    userId: number,
    data: UpdateProductData
  ): Promise<any> {
    console.log(`📝 更新商品，商品ID: ${productId}，用户ID: ${userId}`);

    // 1️⃣ 查找商品
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    // 2️⃣ 验证权限
    if (product.seller_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权修改此商品');
    }

    // 3️⃣ 如果修改分类，验证新分类
    if (data.category_id && data.category_id !== product.category_id) {
      const category = await Category.findByPk(data.category_id);
      if (!category || category.status !== 'active') {
        throw new AppError(400, 'INVALID_CATEGORY', '无效的商品分类');
      }
    }

    // 4️⃣ 处理图片数组
    const updateData = { ...data };
    if (data.images) {
      updateData.images = JSON.stringify(data.images) as any;
    }

    // 5️⃣ 更新商品
    await product.update(updateData);

    console.log(`✅ 商品更新成功，ID: ${productId}`);
    return this.formatProductResponse(product);
  }

  // ========================================
  // 🎯 删除商品（软删除）
  // ========================================
  /**
   * 删除商品
   * 🤔 为什么是软删除？
   * 答：保留数据用于统计和审计，只是标记为 removed
   */
  async deleteProduct(productId: number, userId: number): Promise<void> {
    console.log(`🗑️ 删除商品，商品ID: ${productId}，用户ID: ${userId}`);

    const product = await Product.findByPk(productId);
    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    // 验证权限
    if (product.seller_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权删除此商品');
    }

    // 软删除：标记为 removed
    await product.update({ status: 'removed' });

    console.log(`✅ 商品已删除，ID: ${productId}`);
  }

  // ========================================
  // 🎯 获取商品详情
  // ========================================
  /**
   * 根据ID获取商品详情
   * 🤔 为什么要关联查询卖家信息？
   * 答：前端需要显示卖家昵称、头像、信用分数等
   */
  async getProductById(productId: number, viewerId?: number): Promise<any> {
    console.log(`🔍 查询商品详情，商品ID: ${productId}`);

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'avatar_url', 'auth_status']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    // 如果不是卖家本人查看，且状态不是 available，则不允许查看
    if (
      viewerId !== product.seller_id &&
      !['available', 'reserved'].includes(product.status)
    ) {
      throw new AppError(403, 'FORBIDDEN', '商品不可访问');
    }

    // 增加浏览次数（异步执行，不等待结果）
    if (viewerId !== product.seller_id) {
      product.increment('view_count').catch((err: Error) => {
        console.error('增加浏览次数失败:', err);
      });
    }

    return this.formatProductResponse(product);
  }

  // ========================================
  // 🎯 获取商品列表（分页、筛选、排序）
  // ========================================
  /**
   * 获取商品列表
   * 🤔 为什么这么复杂？
   * 答：支持多种筛选条件、分页、排序，是核心功能
   */
  async getProductList(query: ProductListQuery): Promise<{
    products: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 20,
      category_id,
      product_type,
      condition_level,
      min_price,
      max_price,
      keyword,
      sort = 'created_at',
      order = 'DESC',
      status = 'available'
    } = query;

    console.log(`🔍 查询商品列表，页码: ${page}，每页: ${limit}`);

    // 构建查询条件
    const where: any = { status };

    if (category_id) where.category_id = category_id;
    if (product_type) where.product_type = product_type;
    if (condition_level) where.condition_level = condition_level;

    // 价格范围筛选
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) where.price[Op.gte] = min_price;
      if (max_price !== undefined) where.price[Op.lte] = max_price;
    }

    // 关键词搜索（使用全文索引优化）
    // 🤔 为什么要同时支持全文搜索和 LIKE 搜索？
    // 答：全文索引性能更好，但需要 MySQL 5.7+ 且需要创建索引
    //     LIKE 作为后备方案，确保兼容性
    let replacements: any = {};

    if (keyword) {
      // 使用全文索引搜索（推荐方式）
      // MATCH...AGAINST 语法支持中文分词和相关性排序
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        literal(`MATCH(title, description) AGAINST(:keyword IN NATURAL LANGUAGE MODE)`)
      );
      replacements.keyword = keyword;
    }

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 构建查询选项
    const queryOptions: any = {
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'avatar_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit,
      offset,
      distinct: true
    };

    // 如果有关键词搜索，添加 replacements
    if (keyword) {
      queryOptions.replacements = replacements;
    }

    // 排序逻辑
    // 🤔 为什么搜索时要特殊处理排序？
    // 答：全文搜索有内置的相关性评分，按相关性排序效果更好
    if (keyword && sort === 'created_at') {
      // 有关键词时，优先按相关性排序
      queryOptions.order = [
        [literal('MATCH(title, description) AGAINST(:keyword IN NATURAL LANGUAGE MODE)'), 'DESC'],
        [sort, order]
      ];
    } else {
      queryOptions.order = [[sort, order]];
    }

    // 查询商品
    const { count, rows } = await Product.findAndCountAll(queryOptions);

    console.log(`✅ 查询成功，共 ${count} 条记录`);

    return {
      products: rows.map((p: any) => this.formatProductResponse(p)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // ========================================
  // 🎯 获取我的商品
  // ========================================
  /**
   * 获取用户发布的所有商品
   * 🤔 和 getProductList 有什么区别？
   * 答：这里可以看到所有状态的商品（包括草稿、已下架）
   */
  async getMyProducts(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    console.log(`🔍 查询我的商品，用户ID: ${userId}`);

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        seller_id: userId,
        status: { [Op.ne]: 'removed' } // 不显示已删除的
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      products: rows.map((p: any) => this.formatProductResponse(p)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // ========================================
  // 🎯 上传商品图片
  // ========================================
  /**
   * 上传商品图片到 MinIO
   * 🤔 为什么要验证商品所有者？
   * 答：只有卖家本人才能上传自己商品的图片
   */
  async uploadProductImages(
    productId: number,
    sellerId: number,
    files: Express.Multer.File[]
  ): Promise<string[]> {
    console.log(`📸 上传商品图片到 MinIO，商品ID: ${productId}，图片数量: ${files.length}`);

    try {
      // 1️⃣ 验证商品存在且属于当前用户
      const product = await Product.findByPk(productId);

      if (!product) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
      }

      if (product.seller_id !== sellerId) {
        throw new AppError(403, 'FORBIDDEN', '无权上传此商品图片');
      }

      // 2️⃣ 上传文件到 MinIO 并生成 URL 列表
      const imageUrls: string[] = [];

      for (const file of files) {
        // 生成唯一文件名：时间戳 + 随机字符串 + 原扩展名
        const timestamp = Date.now();
        const randomStr = crypto.randomBytes(6).toString('hex');
        const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
        const objectName = `product-${productId}-${timestamp}-${randomStr}${ext}`;

        // 上传到 MinIO
        await minioClient.putObject(
          BUCKETS.PRODUCTS,
          objectName,
          file.buffer,
          file.size,
          {
            'Content-Type': file.mimetype,
            'x-amz-meta-product-id': productId.toString(),
            'x-amz-meta-seller-id': sellerId.toString(),
          }
        );

        // 生成公开访问 URL
        const imageUrl = getPublicUrl(BUCKETS.PRODUCTS, objectName);
        imageUrls.push(imageUrl);

        console.log(`✅ 图片已上传: ${objectName}`);
      }

      // 3️⃣ 更新商品图片（追加到现有图片）
      const currentImages = product.images || [];
      const newImages = [...currentImages, ...imageUrls];

      // 限制最多10张图片
      if (newImages.length > 10) {
        // 删除刚上传的文件
        for (const url of imageUrls) {
          const objectName = url.substring(url.lastIndexOf('/') + 1);
          await minioClient.removeObject(BUCKETS.PRODUCTS, objectName).catch((err: Error) => {
            console.error(`删除文件失败: ${objectName}`, err);
          });
        }
        throw new AppError(400, 'TOO_MANY_IMAGES', '商品图片最多10张');
      }

      await product.update({
        images: newImages
      });

      console.log(`✅ 商品图片上传成功，商品ID: ${productId}`);
      return imageUrls;
    } catch (error) {
      console.error('❌ 上传商品图片失败:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 删除商品图片
  // ========================================
  /**
   * 删除商品图片（从 MinIO 和数据库）
   * 🤔 为什么要删除物理文件？
   * 答：避免对象存储空间浪费
   */
  async deleteProductImage(
    productId: number,
    sellerId: number,
    imageUrl: string
  ): Promise<void> {
    console.log(`🗑️ 删除商品图片，商品ID: ${productId}，图片: ${imageUrl}`);

    try {
      // 1️⃣ 验证权限
      const product = await Product.findByPk(productId);

      if (!product) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
      }

      if (product.seller_id !== sellerId) {
        throw new AppError(403, 'FORBIDDEN', '无权删除此商品图片');
      }

      // 2️⃣ 从数据库移除图片URL
      const currentImages = product.images || [];
      const newImages = currentImages.filter((img: string) => img !== imageUrl);

      if (currentImages.length === newImages.length) {
        throw new AppError(404, 'IMAGE_NOT_FOUND', '图片不存在');
      }

      await product.update({
        images: newImages
      });

      // 3️⃣ 从 MinIO 删除文件
      // 从 URL 中提取对象名称（最后一个 / 后面的部分）
      const objectName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

      await minioClient.removeObject(BUCKETS.PRODUCTS, objectName);

      console.log(`✅ 商品图片删除成功，商品ID: ${productId}, 对象: ${objectName}`);
    } catch (error) {
      console.error('❌ 删除商品图片失败:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 格式化商品响应数据
  // ========================================
  /**
   * 统一格式化商品数据
   * 🤔 为什么要单独提取？
   * 答：多个方法都需要返回商品数据，统一格式化避免重复代码
   */
  private formatProductResponse(product: any): any {
    const data = product.toJSON ? product.toJSON() : product;

    return {
      id: data.id,
      seller_id: data.seller_id,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      original_price: data.original_price ? parseFloat(data.original_price) : null,
      category_id: data.category_id,
      condition_level: data.condition_level,
      product_type: data.product_type,
      images: data.images,  // Sequelize自动处理JSON类型
      location: data.location,
      status: data.status,
      view_count: data.view_count,
      favorite_count: data.favorite_count,
      is_featured: data.is_featured,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // 关联数据
      seller: data.seller,
      category: data.category
    };
  }
}

export default new ProductService();
