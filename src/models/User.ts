// ========================================
// 用户模型 (TypeScript 版本)
// ========================================
// 🤔 为什么要用 TS 重写？
// 答：1. 获得类型安全和智能提示
//     2. 与项目其他 TS 文件保持一致
//     3. 编译时就能发现错误

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UserAttributes } from '../types';

// ========================================
// 🎯 第1步：定义创建用户时的可选字段
// ========================================
// 🤔 为什么需要这个？
// 答：创建用户时，某些字段是自动生成的（如 id, created_at）
//     或者有默认值的（如 auth_status, is_verified）
//     所以这些字段在 User.create() 时是可选的

interface UserCreationAttributes extends Optional<
  UserAttributes,
  'id' | 'real_name' | 'phone' | 'avatar_url' | 'last_login' | 'verification_token' | 'created_at' | 'updated_at'
> {}

// ========================================
// 🎯 第2步：定义 User 模型类
// ========================================
// 🤔 为什么要继承 Model？
// 答：Sequelize 的 Model 类提供了所有 CRUD 方法
//     如 findOne, create, update, destroy 等

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  // ========================================
  // 字段定义（与数据库表一一对应）
  // ========================================
  public id!: number;
  public student_id!: string;
  public email!: string;
  public password!: string;
  public real_name?: string;
  public phone?: string;
  public avatar_url?: string;
  public auth_status!: number;
  public status!: 'active' | 'inactive' | 'banned';
  public last_login?: Date;
  public verification_token?: string;
  public is_verified!: boolean;

  // ========================================
  // 时间戳（Sequelize 自动管理）
  // ========================================
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ========================================
// 🎯 第3步：初始化模型（定义表结构）
// ========================================
User.init(
  {
    // 字段定义
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    student_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '学号'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      comment: '校园邮箱'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '加密后的密码'
    },
    real_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '真实姓名'
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: true,
      validate: {
        len: [11, 11]
      },
      comment: '手机号'
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '头像URL'
    },
    auth_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '认证状态：0=未认证，1=已认证'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      allowNull: false,
      defaultValue: 'active',
      comment: '账户状态'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '邮箱验证令牌'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '邮箱是否已验证'
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
    // 表配置
    sequelize,                      // Sequelize 实例
    tableName: 'users',             // 表名
    timestamps: true,               // 启用时间戳
    createdAt: 'created_at',        // 创建时间字段名
    updatedAt: 'updated_at',        // 更新时间字段名
    charset: 'utf8mb4',             // 字符集
    collate: 'utf8mb4_unicode_ci',  // 排序规则
    comment: '用户表',
    indexes: [
      {
        unique: true,
        fields: ['student_id']
      },
      {
        unique: true,
        fields: ['campus_email']
      },
      {
        fields: ['auth_status']
      },
      {
        fields: ['status']
      }
    ]
  }
);

// ========================================
// 🎯 第4步：导出模型
// ========================================
export default User;

