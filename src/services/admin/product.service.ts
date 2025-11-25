// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Op } from 'sequelize';
import User from '../../models/User';
import { AppError } from '../../utils/AppError';

const { Product, Category } = require('../../models/Product');

class AdminProductService {
  /**
   * 获取商品列表（分页、筛选）
   */
  async getProductList(params: {
    page?: number;
    limit?: number;
    status?: string;
    category_id?: number;
    keyword?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      category_id,
      keyword
    } = params;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'student_id', 'email']
        },
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
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      list: rows
    };
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: number) {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: { exclude: ['password', 'verification_token'] }
        },
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    return product;
  }

  /**
   * 审核商品（通过/拒绝）
   */
  async reviewProduct(productId: number, status: string, _reason?: string, _adminId?: number) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    // 只能审核待审核的商品
    if (product.status !== 'pending') {
      throw new AppError(400, 'INVALID_STATUS', '只能审核待审核状态的商品');
    }

    await product.update({ status });

    // 如果拒绝，可以记录原因（这里简化处理，实际可能需要额外的表）
    // 这里仅返回结果

    return product;
  }

  /**
   * 更新商品状态（上下架）
   */
  async updateProductStatus(productId: number, status: string, _adminId: number) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    await product.update({ status });

    return product;
  }

  /**
   * 删除商品
   */
  async deleteProduct(productId: number, _adminId: number) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', '商品不存在');
    }

    // 软删除：设置状态为removed
    await product.update({ status: 'removed' });

    return { success: true };
  }
}

export default new AdminProductService();
