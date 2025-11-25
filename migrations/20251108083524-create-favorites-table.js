'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 创建 favorites 表
    await queryInterface.createTable('favorites', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: '用户ID'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: '商品ID'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '收藏时间'
      }
    });

    // 添加联合唯一索引（防止重复收藏）
    await queryInterface.addIndex('favorites', ['user_id', 'product_id'], {
      unique: true,
      name: 'unique_user_product_favorite'
    });

    // 添加单列索引（优化查询性能）
    await queryInterface.addIndex('favorites', ['user_id'], {
      name: 'idx_favorites_user_id'
    });

    await queryInterface.addIndex('favorites', ['product_id'], {
      name: 'idx_favorites_product_id'
    });
  },

  async down (queryInterface, Sequelize) {
    // 删除表
    await queryInterface.dropTable('favorites');
  }
};
