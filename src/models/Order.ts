// ========================================
// 订单模型 (TypeScript 版本)
// ========================================

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderAttributes {
  id: number;
  order_no: string;
  buyer_id: number;
  seller_id: number;
  product_id: number;
  total_amount: number;
  payment_method: 'alipay' | 'wechat' | 'offline' | null;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  order_status: 'created' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunding' | 'refunded';
  trade_location: string | null;
  trade_time: Date | null;
  buyer_note: string | null;
  seller_note: string | null;
  third_party_trade_no: string | null;
  paid_at: Date | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  cancel_reason: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface OrderCreationAttributes extends Optional<
  OrderAttributes,
  'id' | 'payment_method' | 'payment_status' | 'order_status' | 'trade_location' | 'trade_time' |
  'buyer_note' | 'seller_note' | 'third_party_trade_no' | 'paid_at' | 'completed_at' |
  'cancelled_at' | 'cancel_reason' | 'created_at' | 'updated_at'
> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public order_no!: string;
  public buyer_id!: number;
  public seller_id!: number;
  public product_id!: number;
  public total_amount!: number;
  public payment_method!: 'alipay' | 'wechat' | 'offline' | null;
  public payment_status!: 'pending' | 'paid' | 'refunded' | 'cancelled';
  public order_status!: 'created' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunding' | 'refunded';
  public trade_location!: string | null;
  public trade_time!: Date | null;
  public buyer_note!: string | null;
  public seller_note!: string | null;
  public third_party_trade_no!: string | null;
  public paid_at!: Date | null;
  public completed_at!: Date | null;
  public cancelled_at!: Date | null;
  public cancel_reason!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
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
  },
  {
    sequelize,
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
  }
);

export default Order;
