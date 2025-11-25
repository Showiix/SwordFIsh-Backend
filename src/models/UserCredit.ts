// ========================================
// 用户信用模型 (TypeScript 版本)
// ========================================

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserCreditAttributes {
  id: number;
  user_id: number;
  credit_score: number;
  credit_desc: string | null;
  change_amount: number;
  change_type: 'initial' | 'trade_complete' | 'good_review' | 'bad_review' | 'complaint' | 'admin_adjust';
  related_order_id: number | null;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreditCreationAttributes extends Optional<
  UserCreditAttributes,
  'id' | 'credit_score' | 'credit_desc' | 'change_amount' | 'change_type' | 'related_order_id' | 'created_at' | 'updated_at'
> {}

export class UserCredit extends Model<UserCreditAttributes, UserCreditCreationAttributes> implements UserCreditAttributes {
  public id!: number;
  public user_id!: number;
  public credit_score!: number;
  public credit_desc!: string | null;
  public change_amount!: number;
  public change_type!: 'initial' | 'trade_complete' | 'good_review' | 'bad_review' | 'complaint' | 'admin_adjust';
  public related_order_id!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserCredit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '信用记录ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '用户ID'
    },
    credit_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500,
      validate: {
        min: 0,
        max: 1000
      },
      comment: '信用分数(0-1000)'
    },
    credit_desc: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '信用变化描述'
    },
    change_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '分数变化量'
    },
    change_type: {
      type: DataTypes.ENUM('initial', 'trade_complete', 'good_review', 'bad_review', 'complaint', 'admin_adjust'),
      allowNull: false,
      defaultValue: 'initial',
      comment: '变化类型'
    },
    related_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联订单ID'
    }
  },
  {
    sequelize,
    tableName: 'user_credits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '用户信用表',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['change_type']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

export default UserCredit;
