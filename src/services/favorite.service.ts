// ========================================
// 收藏服务层
// ========================================
// 🤔 职责：
// - 处理商品收藏相关的业务逻辑
// - 不依赖 HTTP 请求/响应对象
// - 返回数据，抛出错误由 Controller 捕获

import Favorite from '@/models/Favorite';
import { AppError } from '@/utils/AppError';
import { Op } from 'sequelize';

const { Product } = require('@/models/Product');
const User = require('@/models/User').default;

class FavoriteService {
  // ========================================
  // 🎯 收藏商品
  // ========================================
  /**
   * 收藏商品
   * 🤔 为什么要检查商品是否属于自己？
   * 答：不能收藏自己的商品，这不符合业务逻辑
   */
  async addFavorite(userId: number, productId: number): Promise<void> {
    console.log(`❤️ 收藏商品，用户ID: ${userId}，商品ID: ${productId}`);

    try {
      // 1️⃣ 验证商品存在
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
      }

      // 2️⃣ 不能收藏自己的商品
      if (product.seller_id === userId) {
        throw new AppError(400, 'CANNOT_FAVORITE_OWN', '不能收藏自己的商品');
      }

      // 3️⃣ 检查是否已收藏
      const existing = await Favorite.findOne({
        where: { user_id: userId, product_id: productId }
      });

      if (existing) {
        throw new AppError(400, 'ALREADY_FAVORITED', '已收藏该商品');
      }

      // 4️⃣ 创建收藏记录
      await Favorite.create({
        user_id: userId,
        product_id: productId
      });

      // 5️⃣ 增加商品收藏数
      await Product.increment('favorite_count', {
        where: { id: productId }
      });

      console.log(`✅ 收藏成功，用户ID: ${userId}，商品ID: ${productId}`);
    } catch (error) {
      console.error('❌ 收藏失败:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 取消收藏
  // ========================================
  /**
   * 取消收藏商品
   */
  async removeFavorite(userId: number, productId: number): Promise<void> {
    console.log(`💔 取消收藏，用户ID: ${userId}，商品ID: ${productId}`);

    try {
      const favorite = await Favorite.findOne({
        where: { user_id: userId, product_id: productId }
      });

      if (!favorite) {
        throw new AppError(404, 'NOT_FAVORITED', '未收藏该商品');
      }

      // 删除收藏记录
      await favorite.destroy();

      // 减少商品收藏数
      await Product.decrement('favorite_count', {
        where: { id: productId }
      });

      console.log(`✅ 取消收藏成功，用户ID: ${userId}，商品ID: ${productId}`);
    } catch (error) {
      console.error('❌ 取消收藏失败:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 获取我的收藏列表
  // ========================================
  /**
   * 获取用户收藏的所有商品
   * 🤔 为什么要关联查询商品和卖家信息？
   * 答：前端需要显示商品详情和卖家信息
   */
  async getMyFavorites(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    console.log(`🔍 查询我的收藏，用户ID: ${userId}`);

    try {
      const offset = (page - 1) * limit;

      const { rows, count } = await Favorite.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Product,
            as: 'product',
            required: true,  // INNER JOIN（只返回商品still存在的收藏）
            where: {
              status: { [Op.ne]: 'removed' }  // 不显示已删除的商品
            },
            include: [
              {
                model: User,
                as: 'seller',
                attributes: ['id', 'username', 'avatar_url']
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        favorites: rows.map((fav: any) => ({
          id: fav.id,
          created_at: fav.created_at,
          product: fav.product
        })),
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('❌ 获取收藏列表失败:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 检查是否收藏
  // ========================================
  /**
   * 检查用户是否收藏了指定商品
   * 🤔 用途是什么？
   * 答：前端在商品详情页显示收藏按钮时，需要知道是否已收藏
   */
  async isFavorited(userId: number, productId: number): Promise<boolean> {
    const favorite = await Favorite.findOne({
      where: { user_id: userId, product_id: productId }
    });
    return !!favorite;
  }

  // ========================================
  // 🎯 批量检查收藏状态
  // ========================================
  /**
   * 批量检查多个商品的收藏状态
   * 🤔 为什么需要批量检查？
   * 答：商品列表页需要显示每个商品的收藏状态
   */
  async batchCheckFavorited(
    userId: number,
    productIds: number[]
  ): Promise<Record<number, boolean>> {
    const favorites = await Favorite.findAll({
      where: {
        user_id: userId,
        product_id: { [Op.in]: productIds }
      },
      attributes: ['product_id']
    });

    const favoritedSet = new Set(favorites.map((f: any) => f.product_id));

    const result: Record<number, boolean> = {};
    productIds.forEach(id => {
      result[id] = favoritedSet.has(id);
    });

    return result;
  }
}

export default new FavoriteService();
