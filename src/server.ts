// ========================================
// 服务器启动文件
// ========================================

import app from './app';
import config from './config';
import { sequelize } from './config/database';

const PORT = config.app.port || 3000;

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 启动服务器
    app.listen(PORT, () => {
      console.log('====================================');
      console.log('✅ 服务器启动成功');
      console.log(`🚀 运行在: http://localhost:${PORT}`);
      console.log(`📝 环境: ${config.app.env}`);
      console.log('====================================');
      console.log('');
      console.log('可用的接口:');
      console.log(`  - POST   /api/auth/register  注册`);
      console.log(`  - POST   /api/auth/login     登录`);
      console.log(`  - GET    /api/auth/user/info 获取个人信息`);
      console.log(`  - GET    /health             健康检查`);
      console.log('====================================');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

