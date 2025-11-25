// ========================================
// 数据模型关联配置 (TypeScript 版本)
// ========================================

import User from './User';
import Message from './Message';

/**
 * 建立模型之间的关联关系
 * 这个函数应该在所有模型初始化之后调用
 */
export function setupAssociations() {
  // ========================================
  // 用户与消息的关联
  // ========================================

  // 用户与消息 (发送者关系) - 一对多
  User.hasMany(Message, {
    foreignKey: 'sender_id',
    as: 'sent_messages'
  });
  Message.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // 用户与消息 (接收者关系) - 一对多
  User.hasMany(Message, {
    foreignKey: 'receiver_id',
    as: 'received_messages'
  });
  Message.belongsTo(User, {
    foreignKey: 'receiver_id',
    as: 'receiver'
  });

  console.log('✅ 模型关联关系已建立');
}
