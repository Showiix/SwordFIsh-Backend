// ========================================
// 商品收藏功能测试
// ========================================

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import User from '../src/models/User';
// @ts-ignore - Product 是 JS 文件，没有类型定义
import { Product } from '../src/models/Product';
import Favorite from '../src/models/Favorite';
import jwt from 'jsonwebtoken';
import config from '../src/config';

describe('收藏功能测试', () => {
  let testUser1: User;
  let testUser2: User;
  let testProduct1: Product;
  let testProduct2: Product;
  let authToken1: string;
  let authToken2: string;

  // ========================================
  // 测试前准备
  // ========================================
  beforeAll(async () => {
    // 同步数据库（测试环境）
    await sequelize.sync({ force: true });

    // 创建测试用户1
    testUser1 = await User.create({
      student_id: 'TEST001',
      username: '测试用户1',
      password: 'password123',
      email: 'test1@example.com',
      is_verified: true
    });

    // 创建测试用户2
    testUser2 = await User.create({
      student_id: 'TEST002',
      username: '测试用户2',
      password: 'password123',
      email: 'test2@example.com',
      is_verified: true
    });

    // 创建测试商品1（用户1发布）
    testProduct1 = await Product.create({
      title: 'iPhone 13',
      description: '九成新 iPhone 13，128GB',
      price: 3999.00,
      original_price: 5999.00,
      category: '数码产品',
      condition: '几乎全新',
      location: '北京',
      seller_id: testUser1.id,
      status: 'available',
      images: []
    });

    // 创建测试商品2（用户2发布）
    testProduct2 = await Product.create({
      title: 'MacBook Pro',
      description: 'M1 芯片，16GB内存',
      price: 8999.00,
      original_price: 12999.00,
      category: '数码产品',
      condition: '轻微使用痕迹',
      location: '上海',
      seller_id: testUser2.id,
      status: 'available',
      images: []
    });

    // 生成 JWT token
    authToken1 = jwt.sign(
      { id: testUser1.id, student_id: testUser1.student_id, email: testUser1.email },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    authToken2 = jwt.sign(
      { id: testUser2.id, student_id: testUser2.student_id, email: testUser2.email },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  // ========================================
  // 测试后清理
  // ========================================
  afterAll(async () => {
    await sequelize.close();
  });

  // 每个测试前清空收藏表
  beforeEach(async () => {
    await Favorite.destroy({ where: {} });
  });

  // ========================================
  // 测试用例：添加收藏
  // ========================================
  describe('POST /api/favorites', () => {
    it('应该成功添加收藏', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ product_id: testProduct2.id });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.msg).toBe('收藏成功');

      // 验证数据库中确实创建了收藏记录
      const favorite = await Favorite.findOne({
        where: {
          user_id: testUser1.id,
          product_id: testProduct2.id
        }
      });
      expect(favorite).not.toBeNull();
    });

    it('应该拒绝未登录用户添加收藏', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({ product_id: testProduct2.id });

      expect(response.status).toBe(401);
    });

    it('应该拒绝重复收藏同一商品', async () => {
      // 第一次收藏
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ product_id: testProduct2.id });

      // 第二次收藏同一商品
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ product_id: testProduct2.id });

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('已收藏');
    });

    it('应该拒绝收藏不存在的商品', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ product_id: 99999 });

      expect(response.status).toBe(404);
    });
  });

  // ========================================
  // 测试用例：取消收藏
  // ========================================
  describe('DELETE /api/favorites/:id', () => {
    let favoriteId: number;

    beforeEach(async () => {
      // 先创建一个收藏记录
      const favorite = await Favorite.create({
        user_id: testUser1.id,
        product_id: testProduct2.id
      });
      favoriteId = favorite.id;
    });

    it('应该成功取消收藏', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${favoriteId}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe('取消收藏成功');

      // 验证数据库中确实删除了收藏记录
      const favorite = await Favorite.findByPk(favoriteId);
      expect(favorite).toBeNull();
    });

    it('应该拒绝未登录用户取消收藏', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${favoriteId}`);

      expect(response.status).toBe(401);
    });

    it('应该拒绝取消不存在的收藏', async () => {
      const response = await request(app)
        .delete('/api/favorites/99999')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(404);
    });

    it('应该拒绝取消其他用户的收藏', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${favoriteId}`)
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response.status).toBe(403);
    });
  });

  // ========================================
  // 测试用例：获取我的收藏列表
  // ========================================
  describe('GET /api/favorites', () => {
    beforeEach(async () => {
      // 用户1收藏两个商品
      await Favorite.create({
        user_id: testUser1.id,
        product_id: testProduct2.id
      });
    });

    it('应该成功获取我的收藏列表', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.favorites).toHaveLength(1);
      expect(response.body.data.favorites[0].product.id).toBe(testProduct2.id);
    });

    it('应该拒绝未登录用户获取收藏列表', async () => {
      const response = await request(app)
        .get('/api/favorites');

      expect(response.status).toBe(401);
    });

    it('应该正确实现分页', async () => {
      const response = await request(app)
        .get('/api/favorites?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  // ========================================
  // 测试用例：检查收藏状态
  // ========================================
  describe('GET /api/favorites/check/:productId', () => {
    beforeEach(async () => {
      await Favorite.create({
        user_id: testUser1.id,
        product_id: testProduct2.id
      });
    });

    it('应该正确返回已收藏状态', async () => {
      const response = await request(app)
        .get(`/api/favorites/check/${testProduct2.id}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.data.is_favorited).toBe(true);
    });

    it('应该正确返回未收藏状态', async () => {
      const response = await request(app)
        .get(`/api/favorites/check/${testProduct1.id}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.data.is_favorited).toBe(false);
    });

    it('应该拒绝未登录用户检查收藏状态', async () => {
      const response = await request(app)
        .get(`/api/favorites/check/${testProduct2.id}`);

      expect(response.status).toBe(401);
    });
  });

  // ========================================
  // 测试用例：批量检查收藏状态
  // ========================================
  describe('POST /api/favorites/batch-check', () => {
    beforeEach(async () => {
      await Favorite.create({
        user_id: testUser1.id,
        product_id: testProduct2.id
      });
    });

    it('应该正确批量检查收藏状态', async () => {
      const response = await request(app)
        .post('/api/favorites/batch-check')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ product_ids: [testProduct1.id, testProduct2.id] });

      expect(response.status).toBe(200);
      expect(response.body.data[testProduct1.id]).toBe(false);
      expect(response.body.data[testProduct2.id]).toBe(true);
    });

    it('应该拒绝未登录用户批量检查', async () => {
      const response = await request(app)
        .post('/api/favorites/batch-check')
        .send({ product_ids: [testProduct1.id, testProduct2.id] });

      expect(response.status).toBe(401);
    });

    it('应该拒绝无效的请求参数', async () => {
      const response = await request(app)
        .post('/api/favorites/batch-check')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ product_ids: 'invalid' });

      expect(response.status).toBe(400);
    });
  });
});
