import { Op, fn, col } from 'sequelize';
import User from '../../models/User';
import { AppError } from '../../utils/AppError';

const Order = require('../../models/Order');
const { Product } = require('../../models/Product');

class AdminOrderService {
  /**
   * 获取订单列表（分页、筛选）
   */
  async getOrderList(params: {
    page?: number;
    limit?: number;
    order_status?: string;
    payment_status?: string;
    keyword?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      order_status,
      payment_status,
      keyword
    } = params;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (order_status) {
      where.order_status = order_status;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (keyword) {
      where.order_no = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'student_id', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'student_id', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'price', 'images']
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
   * 获取订单详情
   */
  async getOrderDetail(orderId: number) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: { exclude: ['password', 'verification_token'] }
        },
        {
          model: User,
          as: 'seller',
          attributes: { exclude: ['password', 'verification_token'] }
        },
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', '订单不存在');
    }

    return order;
  }

  /**
   * 订单统计数据
   */
  async getOrderStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 总订单数
    const totalOrders = await Order.count();

    // 总交易额（已支付的订单）
    const totalAmountResult = await Order.findOne({
      attributes: [[fn('SUM', col('total_amount')), 'total']],
      where: {
        payment_status: 'paid'
      }
    });
    const totalAmount = totalAmountResult?.get('total') || 0;

    // 今日订单数
    const todayOrders = await Order.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    // 今日交易额
    const todayAmountResult = await Order.findOne({
      attributes: [[fn('SUM', col('total_amount')), 'total']],
      where: {
        created_at: { [Op.gte]: today },
        payment_status: 'paid'
      }
    });
    const todayAmount = todayAmountResult?.get('total') || 0;

    // 待处理订单数（已支付但未完成）
    const pendingOrders = await Order.count({
      where: {
        payment_status: 'paid',
        order_status: { [Op.in]: ['paid', 'shipped'] }
      }
    });

    return {
      totalOrders,
      totalAmount: Number(totalAmount),
      todayOrders,
      todayAmount: Number(todayAmount),
      pendingOrders
    };
  }
}

export default new AdminOrderService();
