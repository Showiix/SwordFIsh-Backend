const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 用户信用表模型
const UserCredit = sequelize.define('UserCredit', {
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
}, {
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
});

module.exports = UserCredit;