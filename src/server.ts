// ========================================
// 服务器启动文件
// ========================================

import { createServer } from 'http';
import app from './app';
import config from './config';
import { sequelize } from './config/database';
import SocketService from './config/socket';
import { setupAssociations } from './models/associations';
import { initRedis } from './config/redis';
import { initMinIO } from './config/minio';
// 导入模型关联配置 (必须在使用模型之前导入)
import '@/models/index';

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

    // 初始化Redis连接
    await initRedis();

    // 初始化MinIO（开发环境失败不影响启动）
    try {
      await initMinIO();
    } catch (error: any) {
      console.warn('⚠️  MinIO 初始化失败，文件上传功能将不可用');
      console.warn('💡 提示：如需使用文件上传功能，请启动 MinIO 服务');
      if (config.app.env === 'production') {
        throw error; // 生产环境必须有 MinIO
      }
    }

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
      console.log('');
      console.log('【用户认证】');
      console.log(`  - POST   /api/auth/register     注册`);
      console.log(`  - POST   /api/auth/login        登录`);
      console.log(`  - GET    /api/auth/user/info    获取个人信息`);
      console.log('');
      console.log('【商品管理】');
      console.log(`  - GET    /api/products          获取商品列表`);
      console.log(`  - GET    /api/products/:id      获取商品详情`);
      console.log(`  - POST   /api/products          发布商品`);
      console.log(`  - PUT    /api/products/:id      更新商品`);
      console.log(`  - DELETE /api/products/:id      删除商品`);
      console.log(`  - GET    /api/products/my/list  我的商品`);
      console.log(`  - PATCH  /api/products/:id/status 更新商品状态`);
      console.log(`  - POST   /api/products/:id/images 上传商品图片`);
      console.log(`  - DELETE /api/products/:id/images 删除商品图片`);
      console.log('');
      console.log('【收藏管理】');
      console.log(`  - GET    /api/favorites         获取我的收藏`);
      console.log(`  - POST   /api/favorites         收藏商品`);
      console.log(`  - DELETE /api/favorites/:id     取消收藏`);
      console.log(`  - GET    /api/favorites/check/:id 检查收藏状态`);
      console.log(`  - POST   /api/favorites/batch-check 批量检查收藏`);
      console.log('');
      console.log('【搜索功能】');
      console.log(`  - GET    /api/search/hot        获取热门搜索`);
      console.log(`  - GET    /api/search/suggest    搜索建议`);
      console.log(`  - GET    /api/search/history    我的搜索历史`);
      console.log(`  - DELETE /api/search/history    清空搜索历史`);
      console.log('');
      console.log('【系统】');
      console.log(`  - GET    /health                健康检查`);
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

