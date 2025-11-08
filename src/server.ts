// ========================================
// 服务器启动文件
// ========================================

import app from './app';
import config from './config';
import { sequelize } from './config/database';
// @ts-ignore - Redis配置文件使用JS
import { initRedis } from './config/redis';
import { initMinIO } from './config/minio';

const PORT = config.app.port || 3000;

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 初始化Redis连接
    await initRedis();

    // 初始化MinIO
    await initMinIO();

    // 启动服务器
    app.listen(PORT, () => {
      console.log('====================================');
      console.log('✅ 服务器启动成功');
      console.log(`🚀 运行在: http://localhost:${PORT}`);
      console.log(`📝 环境: ${config.app.env}`);
      console.log('====================================');
      console.log('');
      console.log('可用的接口:');
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
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

