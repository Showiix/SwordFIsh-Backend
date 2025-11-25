// ========================================
// Mock 聊天服务 - 用于无数据库开发
// ========================================

import { AppError } from '../utils/AppError';
import { SendMessageRequest, MessageAttributes, ConversationInfo } from '../types';

// ========================================
// Mock 数据存储
// ========================================
class MockDataStore {
  private messages: MessageAttributes[] = [];
  private messageIdCounter = 1;

  // 预置测试用户数据
  private mockUsers = [
    { id: 1, username: '张三', avatar_url: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, username: '李四', avatar_url: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, username: '王五', avatar_url: 'https://i.pravatar.cc/150?img=3' }
  ];

  constructor() {
    // 初始化一些测试消息
    this.initMockMessages();
  }

  private initMockMessages() {
    const now = new Date();

    // 用户1和用户2之间的对话
    this.messages.push({
      id: this.messageIdCounter++,
      sender_id: 1,
      receiver_id: 2,
      content: '你好,这个商品还在吗?',
      message_type: 'text',
      is_read: true,
      read_at: new Date(now.getTime() - 3600000),
      is_deleted: false,
      created_at: new Date(now.getTime() - 7200000),
      updated_at: new Date(now.getTime() - 7200000)
    });

    this.messages.push({
      id: this.messageIdCounter++,
      sender_id: 2,
      receiver_id: 1,
      content: '在的,你需要吗?',
      message_type: 'text',
      is_read: true,
      read_at: new Date(now.getTime() - 3500000),
      is_deleted: false,
      created_at: new Date(now.getTime() - 3600000),
      updated_at: new Date(now.getTime() - 3600000)
    });

    this.messages.push({
      id: this.messageIdCounter++,
      sender_id: 1,
      receiver_id: 2,
      content: '价格可以优惠吗?',
      message_type: 'text',
      is_read: false,
      is_deleted: false,
      created_at: new Date(now.getTime() - 1800000),
      updated_at: new Date(now.getTime() - 1800000)
    });

    // 用户1和用户3之间的对话
    this.messages.push({
      id: this.messageIdCounter++,
      sender_id: 3,
      receiver_id: 1,
      content: '你好',
      message_type: 'text',
      is_read: false,
      is_deleted: false,
      created_at: new Date(now.getTime() - 900000),
      updated_at: new Date(now.getTime() - 900000)
    });
  }

  getMessages() {
    return this.messages;
  }

  addMessage(message: MessageAttributes) {
    this.messages.push(message);
  }

  getMessageById(id: number) {
    return this.messages.find(msg => msg.id === id);
  }

  updateMessage(id: number, updates: Partial<MessageAttributes>) {
    const index = this.messages.findIndex(msg => msg.id === id);
    if (index !== -1) {
      this.messages[index] = { ...this.messages[index], ...updates };
      return this.messages[index];
    }
    return null;
  }

  getNextMessageId() {
    return this.messageIdCounter++;
  }

  getUserById(id: number) {
    return this.mockUsers.find(user => user.id === id);
  }
}

// 单例模式
const dataStore = new MockDataStore();

// ========================================
// Mock 聊天服务类
// ========================================
class ChatServiceMock {
  /**
   * 发送消息
   */
  async sendMessage(data: SendMessageRequest & { sender_id: number }) {
    // 1. 验证接收者是否存在
    const receiver = dataStore.getUserById(data.receiver_id);
    if (!receiver) {
      throw new AppError(404, 'USER_NOT_FOUND', '接收者不存在');
    }

    // 2. 不能给自己发消息
    if (data.sender_id === data.receiver_id) {
      throw new AppError(400, 'INVALID_REQUEST', '不能给自己发送消息');
    }

    // 3. 创建消息
    const message: MessageAttributes = {
      id: dataStore.getNextMessageId(),
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      content: data.content,
      message_type: data.message_type || 'text',
      product_id: data.product_id,
      order_id: data.order_id,
      is_read: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    dataStore.addMessage(message);
    return message;
  }

  /**
   * 获取聊天记录
   */
  async getChatHistory(userId: number, otherUserId: number, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // 筛选与某人的所有聊天记录
    const messages = dataStore.getMessages().filter(msg =>
      !msg.is_deleted && (
        (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
        (msg.sender_id === otherUserId && msg.receiver_id === userId)
      )
    );

    // 排序:最新的在前
    messages.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    // 分页
    const paginatedMessages = messages.slice(offset, offset + limit);

    return {
      messages: paginatedMessages.reverse(), // 反转顺序,让最老的消息在前
      total: messages.length,
      page,
      pages: Math.ceil(messages.length / limit)
    };
  }

  /**
   * 获取会话列表
   */
  async getConversations(userId: number) {
    const messages = dataStore.getMessages().filter(msg =>
      !msg.is_deleted && (msg.sender_id === userId || msg.receiver_id === userId)
    );

    // 按对话分组
    const conversationsMap = new Map<number, ConversationInfo>();

    messages.forEach(message => {
      const otherUserId = message.sender_id === userId
        ? message.receiver_id
        : message.sender_id;

      if (!conversationsMap.has(otherUserId)) {
        const otherUser = dataStore.getUserById(otherUserId);
        if (otherUser) {
          conversationsMap.set(otherUserId, {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0
          });
        }
      }

      // 更新最新消息
      const conv = conversationsMap.get(otherUserId);
      if (conv && message.created_at > conv.lastMessage.created_at) {
        conv.lastMessage = message;
      }

      // 统计未读消息数
      if (message.receiver_id === userId && !message.is_read && conv) {
        conv.unreadCount++;
      }
    });

    return Array.from(conversationsMap.values());
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(userId: number, otherUserId: number) {
    const messages = dataStore.getMessages();
    let affectedCount = 0;

    messages.forEach(msg => {
      if (msg.sender_id === otherUserId &&
          msg.receiver_id === userId &&
          !msg.is_read) {
        msg.is_read = true;
        msg.read_at = new Date();
        affectedCount++;
      }
    });

    return affectedCount;
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: number, userId: number) {
    const message = dataStore.getMessageById(messageId);

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', '消息不存在');
    }

    // 只有发送者可以删除消息
    if (message.sender_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权删除此消息');
    }

    message.is_deleted = true;
    message.updated_at = new Date();

    return message;
  }

  /**
   * 获取未读消息数
   */
  async getUnreadCount(userId: number) {
    const count = dataStore.getMessages().filter(msg =>
      msg.receiver_id === userId &&
      !msg.is_read &&
      !msg.is_deleted
    ).length;

    return count;
  }
}

export default new ChatServiceMock();
