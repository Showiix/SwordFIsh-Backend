  const { DataTypes } = require('sequelize');
  const { sequelize } = require('../config/database');

  // 用户表模型
  const User = sequelize.define('User', {
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
    campus_email: {
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
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
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
  });

  module.exports = User;