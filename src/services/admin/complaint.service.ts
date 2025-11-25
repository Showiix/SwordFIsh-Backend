// Op可能在未来筛选功能中使用
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Op } from 'sequelize';
import User from '../../models/User';
import { AppError } from '../../utils/AppError';

const { Complaint } = require('../../models/Review');
const Order = require('../../models/Order');
const { Product } = require('../../models/Product');

class AdminComplaintService {
  /**
   * 获取投诉列表（分页、筛选）
   */
  async getComplaintList(params: {
    page?: number;
    limit?: number;
    status?: string;
    complaint_type?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      complaint_type
    } = params;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (complaint_type) {
      where.complaint_type = complaint_type;
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'complainant',
          attributes: ['id', 'username', 'student_id', 'email']
        },
        {
          model: User,
          as: 'defendant',
          attributes: ['id', 'username', 'student_id', 'email']
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'email'],
          required: false
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_no', 'total_amount'],
          required: false
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'price'],
          required: false
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
   * 获取投诉详情
   */
  async getComplaintDetail(complaintId: number) {
    const complaint = await Complaint.findByPk(complaintId, {
      include: [
        {
          model: User,
          as: 'complainant',
          attributes: { exclude: ['password', 'verification_token'] }
        },
        {
          model: User,
          as: 'defendant',
          attributes: { exclude: ['password', 'verification_token'] }
        },
        {
          model: User,
          as: 'admin',
          attributes: { exclude: ['password', 'verification_token'] },
          required: false
        },
        {
          model: Order,
          as: 'order',
          required: false
        },
        {
          model: Product,
          as: 'product',
          required: false
        }
      ]
    });

    if (!complaint) {
      throw new AppError(404, 'COMPLAINT_NOT_FOUND', '投诉不存在');
    }

    return complaint;
  }

  /**
   * 处理投诉
   */
  async handleComplaint(params: {
    complaintId: number;
    status: string;
    adminNote: string;
    adminId: number;
  }) {
    const { complaintId, status, adminNote, adminId } = params;

    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      throw new AppError(404, 'COMPLAINT_NOT_FOUND', '投诉不存在');
    }

    // 只能处理待处理或处理中的投诉
    if (!['pending', 'processing'].includes(complaint.status)) {
      throw new AppError(400, 'INVALID_STATUS', '该投诉已处理，无法再次处理');
    }

    await complaint.update({
      status,
      admin_id: adminId,
      admin_note: adminNote,
      resolved_at: status === 'resolved' ? new Date() : null
    });

    return complaint;
  }
}

export default new AdminComplaintService();
