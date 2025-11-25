// ========================================
// 数据模型关联配置和导出 (TypeScript 版本)
// ========================================

import User from './User';
import UserCredit from './UserCredit';
import { Category, Product } from './Product';
import Order from './Order';
import Message from './Message';
import { Review, Complaint } from './Review';

// ========================================
// 定义模型关联关系
// ========================================

// 用户与信用记录 (一对多)
User.hasMany(UserCredit, {
  foreignKey: 'user_id',
  as: 'credits'
});
UserCredit.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 分类自关联 (父子关系)
Category.hasMany(Category, {
  foreignKey: 'parent_id',
  as: 'children'
});
Category.belongsTo(Category, {
  foreignKey: 'parent_id',
  as: 'parent'
});

// 用户与商品 (一对多)
User.hasMany(Product, {
  foreignKey: 'seller_id',
  as: 'products'
});
Product.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

// 分类与商品 (一对多)
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// 用户与订单 (买家关系)
User.hasMany(Order, {
  foreignKey: 'buyer_id',
  as: 'purchase_orders'
});
Order.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer'
});

// 用户与订单 (卖家关系)
User.hasMany(Order, {
  foreignKey: 'seller_id',
  as: 'sales_orders'
});
Order.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

// 商品与订单 (一对多)
Product.hasMany(Order, {
  foreignKey: 'product_id',
  as: 'orders'
});
Order.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// 用户与消息 (发送者关系)
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sent_messages'
});
Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

// 用户与消息 (接收者关系)
User.hasMany(Message, {
  foreignKey: 'receiver_id',
  as: 'received_messages'
});
Message.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver'
});

// 商品与消息 (一对多)
Product.hasMany(Message, {
  foreignKey: 'product_id',
  as: 'messages'
});
Message.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// 订单与消息 (一对多)
Order.hasMany(Message, {
  foreignKey: 'order_id',
  as: 'messages'
});
Message.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// 订单与评价 (一对多)
Order.hasMany(Review, {
  foreignKey: 'order_id',
  as: 'reviews'
});
Review.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// 用户与评价 (评价者关系)
User.hasMany(Review, {
  foreignKey: 'reviewer_id',
  as: 'given_reviews'
});
Review.belongsTo(User, {
  foreignKey: 'reviewer_id',
  as: 'reviewer'
});

// 用户与评价 (被评价者关系)
User.hasMany(Review, {
  foreignKey: 'reviewee_id',
  as: 'received_reviews'
});
Review.belongsTo(User, {
  foreignKey: 'reviewee_id',
  as: 'reviewee'
});

// 商品与评价 (一对多)
Product.hasMany(Review, {
  foreignKey: 'product_id',
  as: 'reviews'
});
Review.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// 用户与投诉 (投诉人关系)
User.hasMany(Complaint, {
  foreignKey: 'complainant_id',
  as: 'filed_complaints'
});
Complaint.belongsTo(User, {
  foreignKey: 'complainant_id',
  as: 'complainant'
});

// 用户与投诉 (被投诉人关系)
User.hasMany(Complaint, {
  foreignKey: 'defendant_id',
  as: 'received_complaints'
});
Complaint.belongsTo(User, {
  foreignKey: 'defendant_id',
  as: 'defendant'
});

// 用户与投诉 (管理员关系)
User.hasMany(Complaint, {
  foreignKey: 'admin_id',
  as: 'handled_complaints'
});
Complaint.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin'
});

// 订单与投诉 (一对多)
Order.hasMany(Complaint, {
  foreignKey: 'order_id',
  as: 'complaints'
});
Complaint.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// 商品与投诉 (一对多)
Product.hasMany(Complaint, {
  foreignKey: 'product_id',
  as: 'complaints'
});
Complaint.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// ========================================
// 导出所有模型
// ========================================
export {
  User,
  UserCredit,
  Category,
  Product,
  Order,
  Message,
  Review,
  Complaint
};
