// ========================================
// 消息模型 (TypeScript 版本)
// ========================================

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MessageAttributes, MessageType } from '../types';

// ========================================
// 创建消息时的可选字段
// ========================================
interface MessageCreationAttributes extends Optional<
  MessageAttributes,
  'id' | 'product_id' | 'order_id' | 'read_at' | 'created_at' | 'updated_at'
> {}

// ========================================
// Message 模型类
// ========================================
class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public product_id?: number;
  public order_id?: number;
  public content!: string;
  public message_type!: MessageType;
  public is_read!: boolean;
  public read_at?: Date;
  public is_deleted!: boolean;


export interface MessageAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id: number | null;
  order_id: number | null;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_read: boolean;
  read_at: Date | null;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface MessageCreationAttributes extends Optional<
  MessageAttributes,
  'id' | 'product_id' | 'order_id' | 'message_type' | 'is_read' | 'read_at' | 'is_deleted' | 'created_at' | 'updated_at'
> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public product_id!: number | null;
  public order_id!: number | null;
  public content!: string;
  public message_type!: 'text' | 'image' | 'file' | 'system';
  public is_read!: boolean;
  public read_at!: Date | null;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ========================================
// 初始化模型
// ========================================
Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '消息ID'
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '发送者ID'
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '接收者ID'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: '关联商品ID'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      comment: '关联订单ID'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      allowNull: false,
      defaultValue: 'text',
      comment: '消息类型'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已读'
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '已读时间'
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已删除'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '聊天消息表',
    indexes: [
      {
        fields: ['sender_id', 'receiver_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['order_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['message_type']
      }
    ]
  }
);

export default Message;
