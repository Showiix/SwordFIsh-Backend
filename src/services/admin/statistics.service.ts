import { Op, fn, col } from 'sequelize';
import User from '../../models/User';

const Order = require('../../models/Order');
const { Product } = require('../../models/Product');
const { Complaint } = require('../../models/Review');

class AdminStatisticsService {
  /**
   * 仪表盘概览数据
   */
  async getDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 用户统计
    const totalUsers = await User.count();
    const newUsersToday = await User.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });
    const activeUsers = await User.count({
      where: {
        status: 'active'
      }
    });

    // 商品统计
    const totalProducts = await Product.count();
    const pendingProducts = await Product.count({
      where: {
        status: 'pending'
      }
    });
    const availableProducts = await Product.count({
      where: {
        status: 'available'
      }
    });

    // 订单统计
    const totalOrders = await Order.count();
    const todayOrdersCount = await Order.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    const todayAmountResult = await Order.findOne({
      attributes: [[fn('SUM', col('total_amount')), 'total']],
      where: {
        created_at: { [Op.gte]: today },
        payment_status: 'paid'
      }
    });
    const todayAmount = todayAmountResult?.get('total') || 0;

    // 投诉统计
    const totalComplaints = await Complaint.count();
    const pendingComplaints = await Complaint.count({
      where: {
        status: 'pending'
      }
    });

    return {
      userStats: {
        total: totalUsers,
        newToday: newUsersToday,
        active: activeUsers
      },
      productStats: {
        total: totalProducts,
        pending: pendingProducts,
        available: availableProducts
      },
      orderStats: {
        total: totalOrders,
        todayCount: todayOrdersCount,
        todayAmount: Number(todayAmount)
      },
      complaintStats: {
        total: totalComplaints,
        pending: pendingComplaints
      }
    };
  }

  /**
   * 用户增长趋势（最近7天或30天）
   */
  async getUserGrowthTrend(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const userGrowth = await User.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    return userGrowth;
  }

  /**
   * 交易额统计（按日期）
   */
  async getSalesTrend(params: {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'month';
  }) {
    const { startDate, endDate, groupBy = 'day' } = params;

    const where: any = {
      payment_status: 'paid'
    };

    if (startDate) {
      where.created_at = { [Op.gte]: startDate };
    }

    if (endDate) {
      if (where.created_at) {
        where.created_at[Op.lte] = endDate;
      } else {
        where.created_at = { [Op.lte]: endDate };
      }
    }

    // 如果没有指定日期范围，默认查询最近30天
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      where.created_at = { [Op.gte]: thirtyDaysAgo };
    }

    const dateFormat = groupBy === 'day' ? 'DATE' : 'DATE_FORMAT';
    const dateFormatArg = groupBy === 'day'
      ? [col('created_at')]
      : [col('created_at'), '%Y-%m'];

    const salesData = await Order.findAll({
      attributes: [
        [fn(dateFormat, ...dateFormatArg), 'date'],
        [fn('SUM', col('total_amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'orderCount']
      ],
      where,
      group: [fn(dateFormat, ...dateFormatArg)],
      order: [[fn(dateFormat, ...dateFormatArg), 'ASC']],
      raw: true
    });

    return salesData.map((item: any) => ({
      date: item.date,
      totalAmount: Number(item.totalAmount),
      orderCount: Number(item.orderCount)
    }));
  }
}

export default new AdminStatisticsService();
