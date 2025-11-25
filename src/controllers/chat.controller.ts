// ========================================
// 聊天控制器 - 处理HTTP请求
// ========================================

import { Request, Response, NextFunction } from 'express';
import { getChatService } from '../services/chat.service.factory';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../types';

// 动态获取服务实例
let chatService: any;
getChatService().then(service => {
  chatService = service;
});

class ChatController {
  /**
   * 发送消息
   * POST /api/chat/messages
   */
  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { receiver_id, content, message_type, product_id, order_id } = req.body;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', '未授权');
      }

      const message = await chatService.sendMessage({
        sender_id: userId,
        receiver_id,
        content,
        message_type,
        product_id,
        order_id
      });

      res.status(201).json({
        success: true,
        message: '消息发送成功',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取聊天记录
   * GET /api/chat/history/:otherUserId
   */
  async getChatHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { otherUserId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', '未授权');
      }

      const result = await chatService.getChatHistory(
        userId,
        parseInt(otherUserId),
        page,
        limit
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取会话列表
   * GET /api/chat/conversations
   */
  async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', '未授权');
      }

      const conversations = await chatService.getConversations(userId);

      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 标记消息为已读
   * PUT /api/chat/read/:otherUserId
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { otherUserId } = req.params;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', '未授权');
      }

      const count = await chatService.markAsRead(userId, parseInt(otherUserId));

      res.json({
        success: true,
        message: `已标记 ${count} 条消息为已读`,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除消息
   * DELETE /api/chat/messages/:messageId
   */
  async deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', '未授权');
      }

      await chatService.deleteMessage(parseInt(messageId), userId);

      res.json({
        success: true,
        message: '消息删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取未读消息数
   * GET /api/chat/unread-count
   */
  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', '未授权');
      }

      const count = await chatService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 测试接口 - 不需要认证
   * GET /api/chat/test
   */
  async test(_req: Request, res: Response, next: NextFunction) {
    try {
      const useMockData = process.env.USE_MOCK_DATA === 'true';

      res.json({
        success: true,
        message: '聊天模块运行正常',
        data: {
          mode: useMockData ? 'Mock 数据模式' : '真实数据库模式',
          timestamp: new Date().toISOString(),
          features: [
            '发送消息',
            '获取聊天记录',
            '获取会话列表',
            '标记已读',
            '删除消息',
            '未读消息数统计',
            'Socket.IO 实时通信'
          ]
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();
