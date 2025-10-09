const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 评价表模型
const Review = sequelize.define('Review', {
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
}, {
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
});

// 投诉表模型
const Complaint = sequelize.define('Complaint', {
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
}, {
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
});

module.exports = { Review, Complaint };