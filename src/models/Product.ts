// ========================================
// 商品和分类模型 (TypeScript 版本)
// ========================================

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// ========================================
// 分类模型接口
// ========================================
export interface CategoryAttributes {
  id: number;
  name: string;
  parent_id: number | null;
  icon: string | null;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

interface CategoryCreationAttributes extends Optional<
  CategoryAttributes,
  'id' | 'parent_id' | 'icon' | 'sort_order' | 'status' | 'created_at' | 'updated_at'
> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parent_id!: number | null;
  public icon!: string | null;
  public sort_order!: number;
  public status!: 'active' | 'inactive';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Category.init(
  {
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
  },
  {
    sequelize,
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
  }
);

// ========================================
// 商品模型接口
// ========================================
export interface ProductAttributes {
  id: number;
  seller_id: number;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: number;
  condition_level: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  product_type: 'physical' | 'service' | 'skill_exchange';
  images: any;  // JSON类型,Sequelize自动序列化/反序列化为string[]
  location: string | null;
  status: 'draft' | 'pending' | 'available' | 'reserved' | 'sold' | 'removed';
  view_count: number;
  favorite_count: number;
  is_featured: boolean;
  expires_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

interface ProductCreationAttributes extends Optional<
  ProductAttributes,
  'id' | 'description' | 'original_price' | 'product_type' | 'images' | 'location' |
  'status' | 'view_count' | 'favorite_count' | 'is_featured' | 'expires_at' | 'created_at' | 'updated_at'
> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public seller_id!: number;
  public title!: string;
  public description!: string | null;
  public price!: number;
  public original_price!: number | null;
  public category_id!: number;
  public condition_level!: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  public product_type!: 'physical' | 'service' | 'skill_exchange';
  public images!: any;  // JSON类型,运行时为string[]
  public location!: string | null;
  public status!: 'draft' | 'pending' | 'available' | 'reserved' | 'sold' | 'removed';
  public view_count!: number;
  public favorite_count!: number;
  public is_featured!: boolean;
  public expires_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Product.init(
  {
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
  },
  {
    sequelize,
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
  }
);

export default { Category, Product };
