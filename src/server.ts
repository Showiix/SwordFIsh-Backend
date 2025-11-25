// ========================================
// 服务器启动文件
// ========================================

import { createServer } from 'http';
import app from './app';
import config from './config';
import { sequelize } from './config/database';
import SocketService from './config/socket';
import { setupAssociations } from './models/associations';

const PORT = config.app.port || 3000;
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

// 启动服务器
async function startServer() {
  try {
    // 根据环境决定是否连接数据库
    if (USE_MOCK_DATA) {
      console.log('⚠️  使用 Mock 数据模式,跳过数据库连接');
    } else {
      // 测试数据库连接
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');

      // 建立模型关联关系
      setupAssociations();
    }

    // 创建 HTTP 服务器
    const httpServer = createServer(app);

    // 初始化 Socket.IO (实例化后自动处理 WebSocket 连接)
    new SocketService(httpServer);
    console.log('✅ Socket.IO 初始化成功');

    // 启动服务器
    httpServer.listen(PORT, () => {
      console.log('====================================');
      console.log('✅ 服务器启动成功');
      console.log(`🚀 HTTP 服务: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket 服务: ws://localhost:${PORT}`);
      console.log(`📝 环境: ${config.app.env}`);
      console.log(`💾 数据模式: ${USE_MOCK_DATA ? 'Mock 数据' : '真实数据库'}`);
      console.log('====================================');
      console.log('');
      console.log('可用的接口:');
      console.log('  【认证模块】');
      console.log(`  - POST   /api/auth/register         注册`);
      console.log(`  - POST   /api/auth/login            登录`);
      console.log(`  - GET    /api/auth/user/info        获取个人信息`);
      console.log('');
      console.log('  【聊天模块】');
      console.log(`  - GET    /api/chat/test             测试接口(无需认证)`);
      console.log(`  - POST   /api/chat/messages         发送消息`);
      console.log(`  - GET    /api/chat/conversations    获取会话列表`);
      console.log(`  - GET    /api/chat/history/:userId  获取聊天记录`);
      console.log(`  - PUT    /api/chat/read/:userId     标记已读`);
      console.log(`  - DELETE /api/chat/messages/:id     删除消息`);
      console.log(`  - GET    /api/chat/unread-count     未读消息数`);
      console.log('');
      console.log('  【其他】');
      console.log(`  - GET    /health                    健康检查`);
      console.log('====================================');
      if (USE_MOCK_DATA) {
        console.log('');
        console.log('💡 提示: 当前使用 Mock 数据,可以直接测试聊天功能');
        console.log('💡 测试接口: http://localhost:' + PORT + '/api/chat/test');
        console.log('');
      }
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

