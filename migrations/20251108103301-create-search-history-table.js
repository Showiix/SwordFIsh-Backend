'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 创建搜索历史表
    await queryInterface.createTable('search_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // 允许为空，支持未登录用户搜索
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: '用户ID（可选）'
      },
      keyword: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '搜索关键词'
      },
      result_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '搜索结果数量'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        comment: 'IP地址'
      },
      user_agent: {
        type: Sequelize.STRING(500),
        comment: '用户代理'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '搜索时间'
      }
    });

    // 添加索引
    await queryInterface.addIndex('search_history', ['user_id'], {
      name: 'idx_search_history_user_id'
    });

    await queryInterface.addIndex('search_history', ['keyword'], {
      name: 'idx_search_history_keyword'
    });

    await queryInterface.addIndex('search_history', ['created_at'], {
      name: 'idx_search_history_created_at'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('search_history');
  }
};
