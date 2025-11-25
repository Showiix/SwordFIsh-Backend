// ========================================
// 评价和投诉模型 (TypeScript 版本)
// ========================================

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// ========================================
// 评价模型
// ========================================
export interface ReviewAttributes {
  id: number;
  order_id: number;
  reviewer_id: number;
  reviewee_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  review_type: 'buyer_to_seller' | 'seller_to_buyer';
  images: string[] | null;
  is_anonymous: boolean;
  reply_content: string | null;
  replied_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

interface ReviewCreationAttributes extends Optional<
  ReviewAttributes,
  'id' | 'comment' | 'images' | 'is_anonymous' | 'reply_content' | 'replied_at' | 'created_at' | 'updated_at'
> {}

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public order_id!: number;
  public reviewer_id!: number;
  public reviewee_id!: number;
  public product_id!: number;
  public rating!: number;
  public comment!: string | null;
  public review_type!: 'buyer_to_seller' | 'seller_to_buyer';
  public images!: string[] | null;
  public is_anonymous!: boolean;
  public reply_content!: string | null;
  public replied_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '评价ID'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      comment: '订单ID'
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '评价者ID'
    },
    reviewee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '被评价者ID'
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: '评分(1-5)'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '评价内容'
    },
    review_type: {
      type: DataTypes.ENUM('buyer_to_seller', 'seller_to_buyer'),
      allowNull: false,
      comment: '评价类型'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '评价图片'
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否匿名评价'
    },
    reply_content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '回复内容'
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '回复时间'
    }
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '评价表',
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['reviewer_id']
      },
      {
        fields: ['reviewee_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['review_type']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

// ========================================
// 投诉模型
// ========================================
export interface ComplaintAttributes {
  id: number;
  complainant_id: number;
  defendant_id: number;
  order_id: number | null;
  product_id: number | null;
  complaint_type: 'fraud' | 'fake_goods' | 'not_as_described' | 'no_delivery' | 'service_issue' | 'other';
  title: string;
  description: string;
  evidence_images: string[] | null;
  status: 'pending' | 'processing' | 'resolved' | 'rejected' | 'closed';
  admin_id: number | null;
  admin_note: string | null;
  resolved_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

interface ComplaintCreationAttributes extends Optional<
  ComplaintAttributes,
  'id' | 'order_id' | 'product_id' | 'evidence_images' | 'status' | 'admin_id' | 'admin_note' | 'resolved_at' | 'created_at' | 'updated_at'
> {}

export class Complaint extends Model<ComplaintAttributes, ComplaintCreationAttributes> implements ComplaintAttributes {
  public id!: number;
  public complainant_id!: number;
  public defendant_id!: number;
  public order_id!: number | null;
  public product_id!: number | null;
  public complaint_type!: 'fraud' | 'fake_goods' | 'not_as_described' | 'no_delivery' | 'service_issue' | 'other';
  public title!: string;
  public description!: string;
  public evidence_images!: string[] | null;
  public status!: 'pending' | 'processing' | 'resolved' | 'rejected' | 'closed';
  public admin_id!: number | null;
  public admin_note!: string | null;
  public resolved_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Complaint.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '投诉ID'
    },
    complainant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '投诉人ID'
    },
    defendant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '被投诉人ID'
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: '关联商品ID'
    },
    complaint_type: {
      type: DataTypes.ENUM('fraud', 'fake_goods', 'not_as_described', 'no_delivery', 'service_issue', 'other'),
      allowNull: false,
      comment: '投诉类型'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '投诉标题'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '投诉详情'
    },
    evidence_images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '证据图片'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'resolved', 'rejected', 'closed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '处理状态'
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '处理管理员ID'
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '管理员处理说明'
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '解决时间'
    }
  },
  {
    sequelize,
    tableName: 'complaints',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '投诉表',
    indexes: [
      {
        fields: ['complainant_id']
      },
      {
        fields: ['defendant_id']
      },
      {
        fields: ['order_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['complaint_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['admin_id']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

export default { Review, Complaint };
