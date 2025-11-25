import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import adminComplaintService from '../../services/admin/complaint.service';

class AdminComplaintController {
  /**
   * 获取投诉列表
   * GET /api/admin/complaints
   */
  async getComplaintList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, complaint_type } = req.query;

      const result = await adminComplaintService.getComplaintList({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        complaint_type: complaint_type as string
      });

      res.json({
        code: 200,
        msg: '获取成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取投诉详情
   * GET /api/admin/complaints/:id
   */
  async getComplaintDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const complaintId = Number(req.params.id);
      const complaint = await adminComplaintService.getComplaintDetail(complaintId);

      res.json({
        code: 200,
        msg: '获取成功',
        data: complaint
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 处理投诉
   * PUT /api/admin/complaints/:id/handle
   */
  async handleComplaint(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const complaintId = Number(req.params.id);
      const { status, admin_note } = req.body;
      const adminId = req.user!.id;

      const complaint = await adminComplaintService.handleComplaint({
        complaintId,
        status,
        adminNote: admin_note,
        adminId
      });

      res.json({
        code: 200,
        msg: '处理成功',
        data: complaint
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminComplaintController();
