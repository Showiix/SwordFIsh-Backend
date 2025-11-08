// ========================================
// 搜索路由配置
// ========================================

import { Router } from 'express';
import searchController from '@/controllers/search.controller';
import { requestLogger } from '@/middleware/logger';
import { authenticateToken } from '@/middleware/authenticateToken';

const router = Router();

// ========================================
// 🎯 公开路由
// ========================================

/**
 * 获取热门搜索词
 * GET /api/search/hot
 *
 * Query 参数：
 * - days: 统计最近N天（默认7天）
 * - limit: 返回数量（默认10）
 */
router.get(
  '/hot',
  requestLogger,
  searchController.getHotSearch.bind(searchController)
);

/**
 * 获取搜索建议（自动补全）
 * GET /api/search/suggest?q=keyword
 *
 * Query 参数：
 * - q: 搜索前缀（必填）
 * - limit: 返回数量（默认5）
 */
router.get(
  '/suggest',
  requestLogger,
  searchController.getSearchSuggestions.bind(searchController)
);

// ========================================
// 🎯 需要认证的路由
// ========================================

/**
 * 获取我的搜索历史
 * GET /api/search/history
 *
 * Query 参数：
 * - limit: 返回数量（默认10）
 */
router.get(
  '/history',
  requestLogger,
  authenticateToken,
  searchController.getSearchHistory.bind(searchController)
);

/**
 * 清空我的搜索历史
 * DELETE /api/search/history
 */
router.delete(
  '/history',
  requestLogger,
  authenticateToken,
  searchController.clearSearchHistory.bind(searchController)
);

export default router;
