// ========================================
// 测试全局设置
// ========================================

export default async (): Promise<void> => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';

  console.log('🧪 测试环境初始化完成');
};
