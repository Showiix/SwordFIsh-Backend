// ========================================
// 搜索历史模型
// ========================================

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class SearchHistory extends Model {
  public id!: number;
  public user_id?: number;
  public keyword!: string;
  public result_count!: number;
  public ip_address?: string;
  public user_agent?: string;
  public created_at!: Date;
}

SearchHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID（可选）'
    },
    keyword: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '搜索关键词'
    },
    result_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '搜索结果数量'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      comment: 'IP地址'
    },
    user_agent: {
      type: DataTypes.STRING(500),
      comment: '用户代理'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '搜索时间'
    }
  },
  {
    sequelize,
    tableName: 'search_history',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_search_history_user_id'
      },
      {
        fields: ['keyword'],
        name: 'idx_search_history_keyword'
      },
      {
        fields: ['created_at'],
        name: 'idx_search_history_created_at'
      }
    ]
  }
);

export default SearchHistory;
