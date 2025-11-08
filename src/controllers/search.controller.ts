// ========================================
// 搜索控制器
// ========================================

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import searchService from '@/services/search.service';

class SearchController {
  // ========================================
  // 🎯 获取用户搜索历史
  // ========================================
  /**
   * 获取当前用户的搜索历史
   * GET /api/search/history
   */
  async getSearchHistory(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<string[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await searchService.getUserSearchHistory(userId, limit);

      res.status(200).json({
        code: 200,
        msg: '获取成功',
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 清空搜索历史
  // ========================================
  /**
   * 清空当前用户的搜索历史
   * DELETE /api/search/history
   */
  async clearSearchHistory(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      await searchService.clearUserSearchHistory(userId);

      res.status(200).json({
        code: 200,
        msg: '清空成功',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 获取热门搜索
  // ========================================
  /**
   * 获取热门搜索词
   * GET /api/search/hot
   */
  async getHotSearch(
    req: Request,
    res: Response<ApiResponse<Array<{ keyword: string; count: number }>>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 10;

      const hotKeywords = await searchService.getHotSearchKeywords(days, limit);

      res.status(200).json({
        code: 200,
        msg: '获取成功',
        data: hotKeywords
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // 🎯 获取搜索建议
  // ========================================
  /**
   * 获取搜索建议（自动补全）
   * GET /api/search/suggest?q=iPhone
   */
  async getSearchSuggestions(
    req: Request,
    res: Response<ApiResponse<string[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!query) {
        res.status(400).json({
          code: 400,
          msg: '缺少查询参数 q',
          data: []
        });
        return;
      }

      const suggestions = await searchService.getSearchSuggestions(query, limit);

      res.status(200).json({
        code: 200,
        msg: '获取成功',
        data: suggestions
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
