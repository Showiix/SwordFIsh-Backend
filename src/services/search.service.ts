// ========================================
// 搜索服务层
// ========================================

import SearchHistory from '@/models/SearchHistory';
import { Op } from 'sequelize';
import { sequelize } from '@/config/database';

class SearchService {
  // ========================================
  // 🎯 记录搜索历史
  // ========================================
  /**
   * 记录用户搜索行为
   */
  async recordSearchHistory(
    keyword: string,
    resultCount: number,
    userId?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await SearchHistory.create({
        user_id: userId,
        keyword: keyword.trim(),
        result_count: resultCount,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    } catch (error) {
      // 搜索历史记录失败不应该影响搜索功能
      console.error('❌ 记录搜索历史失败:', error);
    }
  }

  // ========================================
  // 🎯 获取用户搜索历史
  // ========================================
  /**
   * 获取用户的搜索历史（去重）
   */
  async getUserSearchHistory(userId: number, limit: number = 10): Promise<string[]> {
    try {
      const results = await SearchHistory.findAll({
        where: { user_id: userId },
        attributes: ['keyword'],
        group: ['keyword'],
        order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
        limit,
        raw: true
      });

      return results.map((r: any) => r.keyword);
    } catch (error) {
      console.error('❌ 获取搜索历史失败:', error);
      return [];
    }
  }

  // ========================================
  // 🎯 清空用户搜索历史
  // ========================================
  /**
   * 清空用户的所有搜索历史
   */
  async clearUserSearchHistory(userId: number): Promise<void> {
    try {
      await SearchHistory.destroy({
        where: { user_id: userId }
      });
    } catch (error) {
      console.error('❌ 清空搜索历史失败:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 获取热门搜索词
  // ========================================
  /**
   * 获取最近一段时间的热门搜索词
   */
  async getHotSearchKeywords(
    days: number = 7,
    limit: number = 10
  ): Promise<Array<{ keyword: string; count: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const results = await SearchHistory.findAll({
        attributes: [
          'keyword',
          [sequelize.fn('COUNT', sequelize.col('keyword')), 'count']
        ],
        where: {
          created_at: { [Op.gte]: startDate },
          keyword: { [Op.ne]: '' }  // 排除空关键词
        },
        group: ['keyword'],
        order: [[sequelize.fn('COUNT', sequelize.col('keyword')), 'DESC']],
        limit,
        raw: true
      });

      return results.map((r: any) => ({
        keyword: r.keyword,
        count: parseInt(r.count)
      }));
    } catch (error) {
      console.error('❌ 获取热门搜索失败:', error);
      return [];
    }
  }

  // ========================================
  // 🎯 获取搜索建议
  // ========================================
  /**
   * 根据输入获取搜索建议（自动补全）
   */
  async getSearchSuggestions(
    prefix: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      if (!prefix || prefix.length < 2) {
        return [];
      }

      const results = await SearchHistory.findAll({
        attributes: ['keyword'],
        where: {
          keyword: { [Op.like]: `${prefix}%` }
        },
        group: ['keyword'],
        order: [[sequelize.fn('COUNT', sequelize.col('keyword')), 'DESC']],
        limit,
        raw: true
      });

      return results.map((r: any) => r.keyword);
    } catch (error) {
      console.error('❌ 获取搜索建议失败:', error);
      return [];
    }
  }
}

export default new SearchService();
