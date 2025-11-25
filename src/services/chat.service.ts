// ========================================
// 聊天服务层 - 业务逻辑
// ========================================

import Message from '../models/Message';
import User from '../models/User';
import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import { SendMessageRequest } from '../types';

class ChatService {
  /**
   * 发送消息
   */
  async sendMessage(data: SendMessageRequest & { sender_id: number }) {
    // 1. 验证接收者是否存在
    const receiver = await User.findByPk(data.receiver_id);
    if (!receiver) {
      throw new AppError(404, 'USER_NOT_FOUND', '接收者不存在');
    }

    // 2. 不能给自己发消息
    if (data.sender_id === data.receiver_id) {
      throw new AppError(400, 'INVALID_REQUEST', '不能给自己发送消息');
    }

    // 3. 创建消息
    const message = await Message.create({
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      content: data.content,
      message_type: data.message_type || 'text',
      product_id: data.product_id,
      order_id: data.order_id,
      is_read: false,
      is_deleted: false
    });

    return message;
  }

  /**
   * 获取聊天记录
   */
  async getChatHistory(userId: number, otherUserId: number, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // 查询与某人的所有聊天记录
    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          {
            sender_id: userId,
            receiver_id: otherUserId
          },
          {
            sender_id: otherUserId,
            receiver_id: userId
          }
        ],
        is_deleted: false
      },
      order: [['created_at', 'DESC']], // 最新的消息在前
      limit,
      offset
    });

    return {
      messages: messages.rows.reverse(), // 反转顺序,让最老的消息在前
      total: messages.count,
      page,
      pages: Math.ceil(messages.count / limit)
    };
  }

  /**
   * 获取会话列表
   */
  async getConversations(userId: number) {
    // 获取所有与该用户相关的消息
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ],
        is_deleted: false
      },
      order: [['created_at', 'DESC']]
    });

    // 按对话分组
    const conversationsMap = new Map();

    for (const message of messages) {
      const otherUserId = message.sender_id === userId
        ? message.receiver_id
        : message.sender_id;

      // 如果这个用户还没有在 Map 中
      if (!conversationsMap.has(otherUserId)) {
        // 获取对方的用户信息
        const otherUser = await User.findByPk(otherUserId, {
          attributes: ['id', 'username', 'avatar_url']
        });

        if (otherUser) {
          conversationsMap.set(otherUserId, {
            user: {
              id: otherUser.id,
              username: otherUser.username,
              avatar_url: otherUser.avatar_url
            },
            lastMessage: message,
            unreadCount: 0
          });
        }
      }

      // 统计未读消息数
      if (message.receiver_id === userId && !message.is_read) {
        const conv = conversationsMap.get(otherUserId);
        if (conv) {
          conv.unreadCount++;
        }
      }
    }

    return Array.from(conversationsMap.values());
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(userId: number, otherUserId: number) {
    const [affectedCount] = await Message.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          sender_id: otherUserId,
          receiver_id: userId,
          is_read: false
        }
      }
    );

    return affectedCount;
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: number, userId: number) {
    const message = await Message.findByPk(messageId);

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', '消息不存在');
    }

    // 只有发送者可以删除消息
    if (message.sender_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权删除此消息');
    }

    message.is_deleted = true;
    await message.save();

    return message;
  }

  /**
   * 获取未读消息数
   */
  async getUnreadCount(userId: number) {
    const count = await Message.count({
      where: {
        receiver_id: userId,
        is_read: false,
        is_deleted: false
      }
    });

    return count;
  }
}

export default new ChatService();
