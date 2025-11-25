'use strict';

/**
 * 创建 messages 表
 * 用于存储聊天消息
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '消息ID'
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '发送者ID'
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '接收者ID'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: '关联商品ID'
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: '关联订单ID'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '消息内容'
      },
      message_type: {
        type: Sequelize.ENUM('text', 'image', 'file', 'system'),
        allowNull: false,
        defaultValue: 'text',
        comment: '消息类型'
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已读'
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '已读时间'
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已删除'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: '更新时间'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: '聊天消息表'
    });

    // 创建索引以提高查询性能
    await queryInterface.addIndex('messages', ['sender_id', 'receiver_id'], {
      name: 'idx_messages_sender_receiver'
    });
    await queryInterface.addIndex('messages', ['product_id'], {
      name: 'idx_messages_product'
    });
    await queryInterface.addIndex('messages', ['order_id'], {
      name: 'idx_messages_order'
    });
    await queryInterface.addIndex('messages', ['created_at'], {
      name: 'idx_messages_created_at'
    });
    await queryInterface.addIndex('messages', ['is_read'], {
      name: 'idx_messages_is_read'
    });
    await queryInterface.addIndex('messages', ['message_type'], {
      name: 'idx_messages_type'
    });

    console.log('✅ messages 表创建成功');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
    console.log('✅ messages 表已删除');
  }
};
