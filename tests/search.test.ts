// ========================================
// 搜索优化功能测试
// ========================================

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import User from '../src/models/User';
// @ts-ignore - Product 是 JS 文件，没有类型定义
import { Product } from '../src/models/Product';
import SearchHistory from '../src/models/SearchHistory';
import jwt from 'jsonwebtoken';
import config from '../src/config';

describe('搜索功能测试', () => {
  let testUser: User;
  let authToken: string;

  // ========================================
  // 测试前准备
  // ========================================
  beforeAll(async () => {
    // 同步数据库（测试环境）
    await sequelize.sync({ force: true });

    // 创建测试用户
    testUser = await User.create({
      student_id: 'SEARCH001',
      username: '搜索测试用户',
      password: 'password123',
      email: 'search@example.com',
      is_verified: true
    });

    // 创建多个测试商品
    await Product.bulkCreate([
      {
        title: 'iPhone 13 Pro Max',
        description: '全新未拆封的 iPhone 13 Pro Max，256GB 远峰蓝色',
        price: 7999.00,
        original_price: 9999.00,
        category: '数码产品',
        condition: '全新',
        location: '北京',
        seller_id: testUser.id,
        status: 'available',
        images: []
      },
      {
        title: 'MacBook Pro M1',
        description: 'M1 芯片 MacBook Pro，16GB 内存，512GB 存储',
        price: 8999.00,
        original_price: 12999.00,
        category: '数码产品',
        condition: '几乎全新',
        location: '上海',
        seller_id: testUser.id,
        status: 'available',
        images: []
      },
      {
        title: 'iPad Air 2022',
        description: '苹果 iPad Air 第五代，紫色，64GB WiFi 版本',
        price: 3599.00,
        original_price: 4799.00,
        category: '数码产品',
        condition: '轻微使用痕迹',
        location: '广州',
        seller_id: testUser.id,
        status: 'available',
        images: []
      },
      {
        title: '大学数学教材',
        description: '高等数学上下册，同济第七版，九成新',
        price: 35.00,
        original_price: 68.00,
        category: '图书教材',
        condition: '良好',
        location: '北京',
        seller_id: testUser.id,
        status: 'available',
        images: []
      }
    ]);

    // 生成 JWT token
    authToken = jwt.sign(
      { id: testUser.id, student_id: testUser.student_id, email: testUser.email },
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

  // 每个测试前清空搜索历史
  beforeEach(async () => {
    await SearchHistory.destroy({ where: {} });
  });

  // ========================================
  // 测试用例：商品全文搜索
  // ========================================
  describe('GET /api/products (搜索功能)', () => {
    it('应该能够通过关键词搜索商品', async () => {
      const response = await request(app)
        .get('/api/products?keyword=iPhone');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.products.length).toBeGreaterThan(0);

      // 验证搜索结果包含关键词
      const product = response.body.data.products[0];
      expect(
        product.title.includes('iPhone') || product.description.includes('iPhone')
      ).toBe(true);
    });

    it('应该能够搜索中文关键词', async () => {
      const response = await request(app)
        .get('/api/products?keyword=苹果');

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('应该在没有匹配时返回空结果', async () => {
      const response = await request(app)
        .get('/api/products?keyword=不存在的商品关键词xyz123');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(0);
    });

    it('应该支持多个搜索条件组合', async () => {
      const response = await request(app)
        .get('/api/products?keyword=iPhone&category=数码产品&min_price=5000&max_price=10000');

      expect(response.status).toBe(200);

      // 验证返回的商品符合所有条件
      response.body.data.products.forEach((product: any) => {
        expect(product.category).toBe('数码产品');
        expect(product.price).toBeGreaterThanOrEqual(5000);
        expect(product.price).toBeLessThanOrEqual(10000);
      });
    });
  });

  // ========================================
  // 测试用例：搜索历史
  // ========================================
  describe('搜索历史功能', () => {
    describe('GET /api/search/history', () => {
      it('应该能够获取用户的搜索历史', async () => {
        // 先创建一些搜索历史记录
        await SearchHistory.bulkCreate([
          {
            user_id: testUser.id,
            keyword: 'iPhone',
            result_count: 1,
            ip_address: '127.0.0.1',
            user_agent: 'test-agent'
          },
          {
            user_id: testUser.id,
            keyword: 'MacBook',
            result_count: 1,
            ip_address: '127.0.0.1',
            user_agent: 'test-agent'
          }
        ]);

        const response = await request(app)
          .get('/api/search/history')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data).toContain('MacBook');
      });

      it('应该拒绝未登录用户获取搜索历史', async () => {
        const response = await request(app)
          .get('/api/search/history');

        expect(response.status).toBe(401);
      });

      it('应该支持限制返回数量', async () => {
        // 创建10条搜索历史
        const historyRecords = Array.from({ length: 10 }, (_, i) => ({
          user_id: testUser.id,
          keyword: `keyword${i}`,
          result_count: 1,
          ip_address: '127.0.0.1',
          user_agent: 'test-agent'
        }));
        await SearchHistory.bulkCreate(historyRecords);

        const response = await request(app)
          .get('/api/search/history?limit=5')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      });
    });

    describe('DELETE /api/search/history', () => {
      it('应该能够清空用户的搜索历史', async () => {
        // 先创建一些搜索历史
        await SearchHistory.bulkCreate([
          {
            user_id: testUser.id,
            keyword: 'iPhone',
            result_count: 1,
            ip_address: '127.0.0.1',
            user_agent: 'test-agent'
          },
          {
            user_id: testUser.id,
            keyword: 'MacBook',
            result_count: 1,
            ip_address: '127.0.0.1',
            user_agent: 'test-agent'
          }
        ]);

        const response = await request(app)
          .delete('/api/search/history')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('清空成功');

        // 验证历史记录已被清空
        const history = await SearchHistory.findAll({
          where: { user_id: testUser.id }
        });
        expect(history).toHaveLength(0);
      });

      it('应该拒绝未登录用户清空搜索历史', async () => {
        const response = await request(app)
          .delete('/api/search/history');

        expect(response.status).toBe(401);
      });
    });
  });

  // ========================================
  // 测试用例：热门搜索
  // ========================================
  describe('GET /api/search/hot', () => {
    it('应该能够获取热门搜索关键词', async () => {
      // 创建一些搜索历史（模拟热门关键词）
      await SearchHistory.bulkCreate([
        { keyword: 'iPhone', result_count: 5, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' },
        { keyword: 'iPhone', result_count: 5, user_id: testUser.id, ip_address: '127.0.0.2', user_agent: 'test' },
        { keyword: 'iPhone', result_count: 5, user_id: testUser.id, ip_address: '127.0.0.3', user_agent: 'test' },
        { keyword: 'MacBook', result_count: 3, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' },
        { keyword: 'MacBook', result_count: 3, user_id: testUser.id, ip_address: '127.0.0.2', user_agent: 'test' },
        { keyword: 'iPad', result_count: 2, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' }
      ]);

      const response = await request(app)
        .get('/api/search/hot');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      // 验证返回的热门搜索按搜索次数排序
      if (response.body.data.length > 1) {
        expect(response.body.data[0].count).toBeGreaterThanOrEqual(response.body.data[1].count);
      }
    });

    it('应该支持限制返回数量', async () => {
      // 创建多个搜索记录
      const keywords = ['iPhone', 'MacBook', 'iPad', 'AirPods', 'Apple Watch'];
      for (const keyword of keywords) {
        await SearchHistory.create({
          keyword,
          result_count: 1,
          user_id: testUser.id,
          ip_address: '127.0.0.1',
          user_agent: 'test'
        });
      }

      const response = await request(app)
        .get('/api/search/hot?limit=3');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('应该支持指定统计天数', async () => {
      const response = await request(app)
        .get('/api/search/hot?days=7&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
    });
  });

  // ========================================
  // 测试用例：搜索建议
  // ========================================
  describe('GET /api/search/suggest', () => {
    beforeEach(async () => {
      // 创建一些搜索历史用于建议
      await SearchHistory.bulkCreate([
        { keyword: 'iPhone 13', result_count: 5, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' },
        { keyword: 'iPhone 14', result_count: 4, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' },
        { keyword: 'iPhone 15', result_count: 3, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' },
        { keyword: 'MacBook Pro', result_count: 2, user_id: testUser.id, ip_address: '127.0.0.1', user_agent: 'test' }
      ]);
    });

    it('应该能够获取搜索建议', async () => {
      const response = await request(app)
        .get('/api/search/suggest?q=iPhone');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      // 验证建议都包含查询前缀
      response.body.data.forEach((suggestion: string) => {
        expect(suggestion.toLowerCase()).toContain('iphone');
      });
    });

    it('应该在缺少查询参数时返回错误', async () => {
      const response = await request(app)
        .get('/api/search/suggest');

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('缺少查询参数');
    });

    it('应该支持限制返回数量', async () => {
      const response = await request(app)
        .get('/api/search/suggest?q=iPhone&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('应该在没有匹配建议时返回空数组', async () => {
      const response = await request(app)
        .get('/api/search/suggest?q=xyz不存在的关键词');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });
});
