// ========================================
// Socket.IO 配置 - 实时通信
// ========================================

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './index';
import chatService from '../services/chat.service';

// ========================================
// 扩展 Socket 接口,添加 userId
// ========================================
interface AuthSocket extends Socket {
  userId?: number;
}

// ========================================
// Socket 服务类
// ========================================
export class SocketService {
  private io: SocketIOServer;
  private userSockets: Map<number, string> = new Map(); // userId -> socketId 映射

  constructor(httpServer: HTTPServer) {
    // 创建 Socket.IO 服务器
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // 生产环境应该设置具体的域名
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * 设置中间件 - 用于身份验证
   */
  private setupMiddleware() {
    this.io.use((socket: AuthSocket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('未提供认证令牌'));
        }

        // 验证 JWT Token
        const decoded = jwt.verify(token, config.jwt.secret) as { id: number };
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('无效的认证令牌'));
      }
    });
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthSocket) => {
      console.log(`✅ 用户 ${socket.userId} 已连接, Socket ID: ${socket.id}`);

      // 记录用户的 socket ID
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);

        // 通知用户连接成功
        socket.emit('connected', {
          message: '连接成功',
          userId: socket.userId
        });
      }

      // ========================================
      // 发送消息事件
      // ========================================
      socket.on('send_message', async (data) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: '用户未认证' });
            return;
          }

          // 保存消息到数据库
          const message = await chatService.sendMessage({
            sender_id: socket.userId,
            receiver_id: data.receiver_id,
            content: data.content,
            message_type: data.message_type || 'text',
            product_id: data.product_id,
            order_id: data.order_id
          });

          // 发送给接收者(如果在线)
          const receiverSocketId = this.userSockets.get(data.receiver_id);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('new_message', message);
          }

          // 确认发送成功
          socket.emit('message_sent', message);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '消息发送失败';
          socket.emit('error', { message: errorMessage });
        }
      });

      // ========================================
      // 标记消息为已读事件
      // ========================================
      socket.on('mark_as_read', async (data) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: '用户未认证' });
            return;
          }

          await chatService.markAsRead(socket.userId, data.other_user_id);

          // 通知发送者消息已读
          const otherSocketId = this.userSockets.get(data.other_user_id);
          if (otherSocketId) {
            this.io.to(otherSocketId).emit('messages_read', {
              user_id: socket.userId
            });
          }

          // 确认已读操作成功
          socket.emit('marked_as_read', {
            other_user_id: data.other_user_id
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '标记已读失败';
          socket.emit('error', { message: errorMessage });
        }
      });

      // ========================================
      // 用户正在输入事件
      // ========================================
      socket.on('typing', (data) => {
        const receiverSocketId = this.userSockets.get(data.receiver_id);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('user_typing', {
            user_id: socket.userId
          });
        }
      });

      // ========================================
      // 用户停止输入事件
      // ========================================
      socket.on('stop_typing', (data) => {
        const receiverSocketId = this.userSockets.get(data.receiver_id);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('user_stop_typing', {
            user_id: socket.userId
          });
        }
      });

      // ========================================
      // 断开连接事件
      // ========================================
      socket.on('disconnect', () => {
        console.log(`❌ 用户 ${socket.userId} 已断开连接`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });
  }

  /**
   * 获取 IO 实例
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * 获取在线用户数
   */
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * 检查用户是否在线
   */
  public isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }
}

export default SocketService;
