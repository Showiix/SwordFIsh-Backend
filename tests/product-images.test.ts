// ========================================
// 商品图片上传功能测试
// ========================================

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import User from '../src/models/User';
// @ts-ignore - Product 是 JS 文件，没有类型定义
import { Product } from '../src/models/Product';
import jwt from 'jsonwebtoken';
import config from '../src/config';
import path from 'path';
import fs from 'fs';

describe('商品图片上传功能测试', () => {
  let testUser: User;
  let testProduct: Product;
  let authToken: string;
  let testImagePath: string;

  // ========================================
  // 测试前准备
  // ========================================
  beforeAll(async () => {
    // 同步数据库（测试环境）
    await sequelize.sync({ force: true });

    // 创建测试用户
    testUser = await User.create({
      student_id: 'IMG001',
      username: '图片测试用户',
      password: 'password123',
      email: 'img@example.com',
      is_verified: true
    });

    // 创建测试商品
    testProduct = await Product.create({
      title: '测试商品',
      description: '用于测试图片上传',
      price: 99.00,
      original_price: 199.00,
      category: '测试分类',
      condition: '全新',
      location: '测试地点',
      seller_id: testUser.id,
      status: 'available',
      images: []
    });

    // 生成 JWT token
    authToken = jwt.sign(
      { id: testUser.id, student_id: testUser.student_id, email: testUser.email },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // 创建一个简单的测试图片文件（1x1 PNG）
    testImagePath = path.join(__dirname, 'test-image.png');
    // 1x1 白色 PNG 图片的 base64 数据
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(testImagePath, pngBuffer);
  });

  // ========================================
  // 测试后清理
  // ========================================
  afterAll(async () => {
    // 删除测试图片文件
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    await sequelize.close();
  });

  // 每个测试前重置商品图片
  beforeEach(async () => {
    await testProduct.update({ images: [] });
  });

  // ========================================
  // 测试用例：上传商品图片
  // ========================================
  describe('POST /api/products/:id/images', () => {
    it('应该成功上传商品图片', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImagePath);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe('图片上传成功');
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.images[0]).toMatch(/^http/);

      // 验证数据库中的图片URL已更新
      await testProduct.reload();
      expect(testProduct.images).toHaveLength(1);
    });

    it('应该支持同时上传多张图片', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImagePath)
        .attach('images', testImagePath)
        .attach('images', testImagePath);

      expect(response.status).toBe(200);
      expect(response.body.data.images).toHaveLength(3);

      // 验证数据库
      await testProduct.reload();
      expect(testProduct.images).toHaveLength(3);
    });

    it('应该拒绝未登录用户上传图片', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .attach('images', testImagePath);

      expect(response.status).toBe(401);
    });

    it('应该拒绝非商品所有者上传图片', async () => {
      // 创建另一个用户
      const otherUser = await User.create({
        student_id: 'OTHER001',
        username: '其他用户',
        password: 'password123',
        email: 'other@example.com',
        is_verified: true
      });

      const otherToken = jwt.sign(
        { id: otherUser.id, student_id: otherUser.student_id, email: otherUser.email },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${otherToken}`)
        .attach('images', testImagePath);

      expect(response.status).toBe(403);
    });

    it('应该拒绝上传不存在的商品图片', async () => {
      const response = await request(app)
        .post('/api/products/99999/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImagePath);

      expect(response.status).toBe(404);
    });

    it('应该拒绝没有上传文件的请求', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('应该限制商品图片数量', async () => {
      // 先上传5张图片（达到上限）
      await testProduct.update({
        images: [
          'http://example.com/1.jpg',
          'http://example.com/2.jpg',
          'http://example.com/3.jpg',
          'http://example.com/4.jpg',
          'http://example.com/5.jpg'
        ]
      });

      // 尝试再上传一张
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImagePath);

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('图片数量');
    });
  });

  // ========================================
  // 测试用例：删除商品图片
  // ========================================
  describe('DELETE /api/products/:id/images', () => {
    const testImageUrl = 'http://localhost:9000/products/test-image.jpg';

    beforeEach(async () => {
      // 在每个测试前设置一些测试图片
      await testProduct.update({
        images: [testImageUrl, 'http://localhost:9000/products/test-image2.jpg']
      });
    });

    it('应该成功删除指定的图片', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ image_url: testImageUrl });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe('图片删除成功');

      // 验证数据库中的图片已被删除
      await testProduct.reload();
      expect(testProduct.images).not.toContain(testImageUrl);
      expect(testProduct.images).toHaveLength(1);
    });

    it('应该拒绝未登录用户删除图片', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images`)
        .send({ image_url: testImageUrl });

      expect(response.status).toBe(401);
    });

    it('应该拒绝非商品所有者删除图片', async () => {
      // 创建另一个用户
      const otherUser = await User.create({
        student_id: 'OTHER002',
        username: '其他用户2',
        password: 'password123',
        email: 'other2@example.com',
        is_verified: true
      });

      const otherToken = jwt.sign(
        { id: otherUser.id, student_id: otherUser.student_id, email: otherUser.email },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ image_url: testImageUrl });

      expect(response.status).toBe(403);
    });

    it('应该拒绝删除不存在的图片URL', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ image_url: 'http://localhost:9000/products/not-exist.jpg' });

      expect(response.status).toBe(404);
      expect(response.body.msg).toContain('图片不存在');
    });

    it('应该拒绝缺少image_url参数的请求', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  // ========================================
  // 测试用例：文件类型验证
  // ========================================
  describe('文件类型验证', () => {
    it('应该拒绝非图片文件', async () => {
      // 创建一个文本文件
      const txtFilePath = path.join(__dirname, 'test.txt');
      fs.writeFileSync(txtFilePath, 'This is not an image');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', txtFilePath);

      // 清理
      fs.unlinkSync(txtFilePath);

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('图片格式');
    });
  });

  // ========================================
  // 测试用例：文件大小验证
  // ========================================
  describe('文件大小验证', () => {
    it('应该拒绝超过大小限制的文件', async () => {
      // 创建一个超大的文件（6MB）
      const largeFilePath = path.join(__dirname, 'large-image.png');
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      fs.writeFileSync(largeFilePath, largeBuffer);

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', largeFilePath);

      // 清理
      fs.unlinkSync(largeFilePath);

      // 期望被中间件拦截
      expect([400, 413]).toContain(response.status);
    });
  });
});
