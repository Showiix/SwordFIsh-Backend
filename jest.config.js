// ========================================
// Jest 配置文件
// ========================================

module.exports = {
  // 使用 ts-jest 预设处理 TypeScript 文件
  preset: 'ts-jest',

  // 测试环境
  testEnvironment: 'node',

  // 根目录
  rootDir: '.',

  // 测试文件匹配规则
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/__tests__/**/*.test.ts'
  ],

  // 模块路径映射（对应 tsconfig.json 中的 paths）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // 覆盖率收集配置
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts'
  ],

  // 覆盖率报告输出目录
  coverageDirectory: 'coverage',

  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],

  // 测试超时时间（毫秒）
  testTimeout: 10000,

  // 清除 mock
  clearMocks: true,

  // 每次测试后恢复 mock
  restoreMocks: true,

  // 测试执行前的全局设置
  globalSetup: '<rootDir>/tests/setup.ts',

  // 测试执行后的全局清理
  globalTeardown: '<rootDir>/tests/teardown.ts'
};
