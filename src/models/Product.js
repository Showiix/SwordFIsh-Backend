const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 分类表模型
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '分类ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类名称'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: '父分类ID'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '分类图标'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序顺序'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    comment: '分类状态'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '分类表',
  indexes: [
    {
      fields: ['parent_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['sort_order']
    }
  ]
});

// 商品表模型
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '商品ID'
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '卖家用户ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '商品标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: '商品价格'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '原价'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: '分类ID'
  },
  condition_level: {
    type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'poor'),
    allowNull: false,
    comment: '商品成色'
  },
  product_type: {
    type: DataTypes.ENUM('physical', 'service', 'skill_exchange'),
    allowNull: false,
    defaultValue: 'physical',
    comment: '商品类型：0=二手物品，1=服务，2=技能交换'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '商品图片数组'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '交易地点'
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'available', 'reserved', 'sold', 'removed'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '商品状态'
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览次数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '收藏次数'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否推荐'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '过期时间'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '商品表',
  indexes: [
    {
      fields: ['seller_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['product_type']
    },
    {
      fields: ['condition_level']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['view_count']
    },
    {
      fields: ['is_featured']
    }
  ]
});

module.exports = { Category, Product };