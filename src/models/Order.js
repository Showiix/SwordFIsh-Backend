const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 订单表模型
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单ID'
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '买家ID'
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '卖家ID'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    comment: '商品ID'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总金额'
  },
  payment_method: {
    type: DataTypes.ENUM('alipay', 'wechat', 'offline'),
    allowNull: true,
    comment: '支付方式'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '支付状态'
  },
  order_status: {
    type: DataTypes.ENUM('created', 'paid', 'shipped', 'completed', 'cancelled', 'refunding', 'refunded'),
    allowNull: false,
    defaultValue: 'created',
    comment: '订单状态'
  },
  trade_location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '交易地点'
  },
  trade_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '交易时间'
  },
  buyer_note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '买家备注'
  },
  seller_note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '卖家备注'
  },
  third_party_trade_no: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '第三方支付交易号'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '完成时间'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取消时间'
  },
  cancel_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '取消原因'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '订单表',
  indexes: [
    {
      unique: true,
      fields: ['order_no']
    },
    {
      fields: ['buyer_id']
    },
    {
      fields: ['seller_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['order_status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Order;