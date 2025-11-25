// ========================================
// 聊天服务工厂 - 根据环境切换服务
// ========================================

/**
 * 获取聊天服务实例
 * 根据环境变量决定使用真实服务还是 Mock 服务
 */
export async function getChatService() {
  const useMockData = process.env.USE_MOCK_DATA === 'true';

  if (useMockData) {
    console.log('🔧 使用 Mock 数据服务');
    const mockService = await import('./chat.service.mock');
    return mockService.default;
  } else {
    console.log('🔧 使用真实数据库服务');
    const realService = await import('./chat.service');
    return realService.default;
  }
}
