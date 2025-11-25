// ========================================
// 聊天路由
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import chatController from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/authenticateToken';
import { ApiResponse } from '../types';

const router = Router();

// ========================================
// 自定义验证中间件
// ========================================

/**
 * 验证发送消息请求
 */
function validateSendMessage(req: Request, res: Response, next: NextFunction): void {
  const { receiver_id, content } = req.body;

  if (!receiver_id || typeof receiver_id !== 'number' || receiver_id < 1) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '接收者ID必须是正整数',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '消息内容不能为空',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  if (content.length > 5000) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '消息内容不能超过5000字',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  next();
}

/**
 * 验证用户ID参数
 */
function validateUserIdParam(req: Request, res: Response, next: NextFunction): void {
  const { otherUserId } = req.params;
  const id = parseInt(otherUserId);

  if (isNaN(id) || id < 1) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '用户ID必须是正整数',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  next();
}

/**
 * 验证消息ID参数
 */
function validateMessageIdParam(req: Request, res: Response, next: NextFunction): void {
  const { messageId } = req.params;
  const id = parseInt(messageId);

  if (isNaN(id) || id < 1) {
    const response: ApiResponse<null> = {
      code: 400,
      msg: '消息ID必须是正整数',
      data: null
    };
    res.status(400).json(response);
    return;
  }

  next();
}

// ========================================
// 所有聊天路由都需要认证
// ========================================
// router.use(authenticateToken);  // 注释掉,让测试接口可以公开访问

// ========================================
// 测试接口 - 无需认证,公开访问
// GET /api/chat/test
// ========================================
router.get(
  '/test',
  chatController.test
);

// ========================================
// 以下路由需要认证
// ========================================
router.use(authenticateToken);

// ========================================
// 发送消息
// POST /api/chat/messages
// ========================================
router.post(
  '/messages',
  validateSendMessage,
  chatController.sendMessage
);

// ========================================
// 获取会话列表
// GET /api/chat/conversations
// ========================================
router.get(
  '/conversations',
  chatController.getConversations
);

// ========================================
// 获取与某用户的聊天记录
// GET /api/chat/history/:otherUserId
// ========================================
router.get(
  '/history/:otherUserId',
  validateUserIdParam,
  chatController.getChatHistory
);

// ========================================
// 标记与某用户的消息为已读
// PUT /api/chat/read/:otherUserId
// ========================================
router.put(
  '/read/:otherUserId',
  validateUserIdParam,
  chatController.markAsRead
);

// ========================================
// 删除消息
// DELETE /api/chat/messages/:messageId
// ========================================
router.delete(
  '/messages/:messageId',
  validateMessageIdParam,
  chatController.deleteMessage
);

// ========================================
// 获取未读消息数
// GET /api/chat/unread-count
// ========================================
router.get(
  '/unread-count',
  chatController.getUnreadCount
);

export default router;
