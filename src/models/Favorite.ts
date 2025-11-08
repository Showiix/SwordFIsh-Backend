// ========================================
// 收藏模型
// ========================================

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class Favorite extends Model {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public created_at!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '收藏时间'
    }
  },
  {
    sequelize,
    tableName: 'favorites',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id'],
        name: 'unique_user_product_favorite'
      },
      {
        fields: ['user_id'],
        name: 'idx_favorites_user_id'
      },
      {
        fields: ['product_id'],
        name: 'idx_favorites_product_id'
      }
    ]
  }
);

export default Favorite;
