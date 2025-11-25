import { Op } from 'sequelize';
import User from '../../models/User';
import { AppError } from '../../utils/AppError';

const UserCredit = require('../../models/UserCredit');
const Order = require('../../models/Order');
const { Product } = require('../../models/Product');

class AdminUserService {
  /**
   * 获取用户列表（分页、筛选）
   */
  async getUserList(params: {
    page?: number;
    limit?: number;
    status?: string;
    auth_status?: number;
    keyword?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      auth_status,
      keyword
    } = params;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (auth_status !== undefined && auth_status !== null) {
      where.auth_status = auth_status;
    }

    if (keyword) {
      where[Op.or] = [
        { student_id: { [Op.like]: `%${keyword}%` } },
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
        { real_name: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'verification_token'] },
      include: [
        {
          model: UserCredit,
          as: 'credits',
          limit: 1,
          order: [['created_at', 'DESC']],
          required: false,
          separate: true
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // 处理信用分数
    const list = rows.map((user: any) => {
      const userData = user.toJSON();
      const latestCredit = userData.credits && userData.credits.length > 0
        ? userData.credits[0].credit_score
        : 500;

      return {
        ...userData,
        credit_score: latestCredit,
        credits: undefined
      };
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      list
    };
  }

  /**
   * 获取用户详情
   */
  async getUserDetail(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verification_token'] }
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    // 获取最新信用分数
    const latestCredit = await UserCredit.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    const userData: any = user.toJSON();
    userData.credit_score = latestCredit ? latestCredit.credit_score : 500;

    return userData;
  }

  /**
   * 获取用户订单记录（购买和销售）
   */
  async getUserOrders(userId: number, type?: 'purchase' | 'sales') {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    const where: any = {};

    if (type === 'purchase') {
      where.buyer_id = userId;
    } else if (type === 'sales') {
      where.seller_id = userId;
    } else {
      where[Op.or] = [
        { buyer_id: userId },
        { seller_id: userId }
      ];
    }

    const orders = await Order.findAll({
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
      order: [['created_at', 'DESC']]
    });

    return orders;
  }

  /**
   * 获取用户信用记录
   */
  async getUserCredits(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    const credits = await UserCredit.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return credits;
  }

  /**
   * 更新用户状态（封禁/解封）
   */
  async updateUserStatus(userId: number, status: 'active' | 'inactive' | 'banned', _adminId: number) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    // 不能修改管理员状态
    if (user.role === 'admin') {
      throw new AppError(403, 'PERMISSION_DENIED', '不能修改管理员账户状态');
    }

    await user.update({ status });

    // 如果封禁，可以扣除信用分
    if (status === 'banned') {
      const latestCredit = await UserCredit.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      const currentScore = latestCredit ? latestCredit.credit_score : 500;
      const newScore = Math.max(0, currentScore - 100);

      await UserCredit.create({
        user_id: userId,
        credit_score: newScore,
        credit_desc: '账户被封禁',
        change_amount: -100,
        change_type: 'admin_adjust'
      });
    }

    return user;
  }

  /**
   * 更新用户认证状态
   */
  async updateAuthStatus(userId: number, authStatus: number, _adminId: number) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    await user.update({ auth_status: authStatus });

    // 如果通过认证，增加信用分
    if (authStatus === 1 && user.auth_status !== 1) {
      const latestCredit = await UserCredit.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      const currentScore = latestCredit ? latestCredit.credit_score : 500;
      const newScore = Math.min(1000, currentScore + 50);

      await UserCredit.create({
        user_id: userId,
        credit_score: newScore,
        credit_desc: '完成实名认证',
        change_amount: 50,
        change_type: 'admin_adjust'
      });
    }

    return user;
  }

  /**
   * 调整用户信用分
   */
  async adjustCreditScore(params: {
    userId: number;
    changeAmount: number;
    reason: string;
    adminId: number;
  }) {
    const { userId, changeAmount, reason } = params;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }

    // 获取当前信用分
    const latestCredit = await UserCredit.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    const currentScore = latestCredit ? latestCredit.credit_score : 500;
    const newScore = Math.max(0, Math.min(1000, currentScore + changeAmount));

    await UserCredit.create({
      user_id: userId,
      credit_score: newScore,
      credit_desc: reason,
      change_amount: changeAmount,
      change_type: 'admin_adjust'
    });

    return {
      currentScore,
      newScore,
      changeAmount
    };
  }
}

export default new AdminUserService();
