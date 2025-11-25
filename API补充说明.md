# 校园二手交易平台 API 补充说明

**更新日期**: 2025-10-21  
**更新版本**: v1.1

---

## 一、补充内容概览

本次API文档更新主要补充了以下三个方面的内容：

1. **用户头像URL字段**：在用户相关接口中添加头像URL字段支持
2. **管理员注册功能**：添加管理员注册接口，支持邀请码机制
3. **用户身份认证审核模块**：完善管理员审核用户身份认证的功能

---

## 二、详细补充内容

### 2.1 用户头像URL字段

#### 2.1.1 涉及的数据表

**users 表新增字段**:
```sql
avatar_url VARCHAR(500) COMMENT '头像URL'
```

#### 2.1.2 涉及的接口

**1. 用户注册** (`POST /user/register`)
- **新增参数**: `avatar_url` (可选)
- **返回数据**: 包含 `avatar_url` 字段

**2. 用户登录** (`POST /user/login`)
- **返回数据**: `user_info` 中包含 `avatar_url` 字段

**3. 获取个人信息** (`GET /user/info`)
- **返回数据**: 包含 `avatar_url` 字段

**4. 修改个人信息** (`PUT /user/info`)
- **请求参数**: 支持更新 `avatar_url`

#### 2.1.3 使用流程

1. 用户上传头像图片 → 调用 `POST /upload/image` 接口
2. 获取返回的图片URL
3. 更新用户信息 → 调用 `PUT /user/info` 接口，传入 `avatar_url`

**示例代码**:
```javascript
// 1. 上传头像
const formData = new FormData();
formData.append('image', avatarFile);

const uploadRes = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const { data } = await uploadRes.json();
const avatarUrl = data.url;

// 2. 更新用户信息
await fetch('/api/user/info', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    avatar_url: avatarUrl
  })
});
```

---

### 2.2 管理员注册功能

#### 2.2.1 新增数据表

**1. admins 表（管理员表）**
```sql
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_name VARCHAR(50) UNIQUE NOT NULL,
    admin_email VARCHAR(100) UNIQUE NOT NULL,
    admin_password_hash VARCHAR(255) NOT NULL,
    admin_phone VARCHAR(20),
    admin_role TINYINT DEFAULT 1 COMMENT '0=超级管理员, 1=普通管理员',
    avatar_url VARCHAR(500),
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**2. admin_invite_codes 表（管理员邀请码表）**
```sql
CREATE TABLE admin_invite_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invite_code VARCHAR(50) UNIQUE NOT NULL,
    created_by INT NOT NULL,
    used_by INT,
    status ENUM('unused', 'used', 'expired') DEFAULT 'unused',
    expire_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id),
    FOREIGN KEY (used_by) REFERENCES admins(id)
);
```

#### 2.2.2 新增接口

**1. 管理员注册** (`POST /admin/register`)

**接口说明**: 通过邀请码注册新的管理员账号

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| admin_name | String | 是 | 管理员用户名（唯一）|
| admin_password | String | 是 | 管理员密码（8-20位）|
| admin_email | String | 是 | 管理员邮箱（唯一）|
| admin_phone | String | 否 | 管理员手机号 |
| invite_code | String | 是 | 邀请码（由超级管理员提供）|

**请求示例**:
```json
{
  "admin_name": "admin01",
  "admin_password": "admin123456",
  "admin_email": "admin01@school.edu.cn",
  "admin_phone": "13800138000",
  "invite_code": "INVITE-2025-001"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "注册成功",
  "data": {
    "admin_id": 2,
    "admin_name": "admin01",
    "admin_email": "admin01@school.edu.cn",
    "admin_role": 1
  }
}
```

**2. 生成邀请码** (`POST /admin/invite/generate`) - 仅超级管理员

**接口说明**: 超级管理员生成新的邀请码

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| count | Number | 否 | 生成数量（默认1）|
| expire_days | Number | 否 | 有效天数（默认30）|

**响应示例**:
```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "invite_codes": [
      {
        "invite_code": "INVITE-2025-001",
        "expire_at": "2025-11-20 10:00:00"
      }
    ]
  }
}
```

**3. 获取邀请码列表** (`GET /admin/invite/list`) - 仅超级管理员

**接口说明**: 查看所有邀请码的使用情况

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | 否 | 状态筛选：unused/used/expired |
| page | Number | 否 | 页码（默认1）|
| page_size | Number | 否 | 每页数量（默认10）|

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "list": [
      {
        "invite_code": "INVITE-2025-001",
        "status": "used",
        "created_at": "2025-10-21 10:00:00",
        "used_at": "2025-10-22 15:30:00",
        "used_by_admin": "admin01"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

#### 2.2.3 注册流程

```
1. 超级管理员登录系统
   ↓
2. 生成邀请码 (POST /admin/invite/generate)
   ↓
3. 将邀请码发送给新管理员
   ↓
4. 新管理员使用邀请码注册 (POST /admin/register)
   ↓
5. 邀请码状态自动更新为"已使用"
   ↓
6. 新管理员可以登录系统
```

---

### 2.3 用户身份认证审核模块

#### 2.3.1 功能说明

用户在平台上进行交易前，需要通过校园身份认证。认证流程包括：
1. 用户提交真实姓名和学生证照片
2. 管理员审核认证信息
3. 审核通过后，用户可以进行交易

#### 2.3.2 新增数据表

**users 表新增字段**:
```sql
real_name VARCHAR(50) COMMENT '真实姓名',
student_card_url VARCHAR(500) COMMENT '学生证照片URL',
auth_status TINYINT DEFAULT 0 COMMENT '认证状态: 0=待审核, 1=已通过, 2=已拒绝'
```

**user_auth_audits 表（用户认证审核记录表）**:
```sql
CREATE TABLE user_auth_audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    student_card_url VARCHAR(500) NOT NULL,
    auth_status TINYINT DEFAULT 0 COMMENT '0=待审核, 1=已通过, 2=已拒绝',
    audit_reason TEXT,
    audited_by INT,
    submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (audited_by) REFERENCES admins(id)
);
```

#### 2.3.3 认证状态说明

| 状态值 | 状态名称 | 说明 |
|--------|---------|------|
| 0 | 待审核 | 用户已提交认证，等待管理员审核 |
| 1 | 已通过 | 管理员审核通过，用户可以进行交易 |
| 2 | 已拒绝 | 管理员审核拒绝，用户需要重新提交 |

#### 2.3.4 新增/修改接口

**1. 修改：校园身份认证提交** (`POST /user/auth`)

原返回状态改为"待审核"：
```json
{
  "code": 200,
  "msg": "认证申请已提交,等待管理员审核",
  "data": {
    "user_id": 1,
    "auth_status": 0,
    "real_name": "张三"
  }
}
```

**2. 新增：用户身份认证审核列表** (`GET /admin/auth/list`)

**接口说明**: 管理员查看待审核的用户认证申请

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| auth_status | Number | 否 | 认证状态：0=待审核, 1=已通过, 2=已拒绝 |
| keyword | String | 否 | 搜索关键词（学号/姓名）|
| page | Number | 否 | 页码（默认1）|
| page_size | Number | 否 | 每页数量（默认10）|

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "list": [
      {
        "auth_id": 1,
        "user_id": 1,
        "student_id": "2023001",
        "campus_email": "2023001@school.edu.cn",
        "real_name": "张三",
        "student_card_url": "http://localhost:3000/uploads/student_card_123456.jpg",
        "auth_status": 0,
        "submit_time": "2025-10-01 08:00:00"
      }
    ],
    "total": 15,
    "page": 1,
    "page_size": 10
  }
}
```

**3. 新增：审核用户身份认证** (`POST /admin/auth/audit`)

**接口说明**: 管理员审核用户的身份认证申请

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | Number | 是 | 用户ID |
| audit_status | Number | 是 | 审核结果：1=通过, 2=拒绝 |
| audit_reason | String | 否 | 审核说明（拒绝时必填）|

**请求示例**（审核通过）:
```json
{
  "user_id": 1,
  "audit_status": 1,
  "audit_reason": ""
}
```

**请求示例**（审核拒绝）:
```json
{
  "user_id": 1,
  "audit_status": 2,
  "audit_reason": "学生证照片模糊，请重新上传清晰照片"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "审核完成",
  "data": null
}
```

#### 2.3.5 认证流程

```
【用户端】
1. 用户上传学生证照片 → POST /upload/image
   ↓
2. 提交认证申请 → POST /user/auth
   - 参数: real_name, student_card_url
   - 状态变为: auth_status = 0 (待审核)
   ↓
3. 等待管理员审核
   ↓
4. 收到审核结果通知
   - 通过: auth_status = 1 (已通过) → 可以发布商品和交易
   - 拒绝: auth_status = 2 (已拒绝) → 查看拒绝原因，重新提交

【管理员端】
1. 管理员登录后台
   ↓
2. 查看待审核列表 → GET /admin/auth/list?auth_status=0
   ↓
3. 查看学生证照片和个人信息
   ↓
4. 审核 → POST /admin/auth/audit
   - 通过: audit_status = 1
   - 拒绝: audit_status = 2, 填写拒绝原因
   ↓
5. 系统自动发送通知给用户
```

#### 2.3.6 前端实现示例

**用户提交认证**:
```javascript
// 1. 上传学生证照片
const uploadStudentCard = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch('/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  });
  
  const { data } = await res.json();
  return data.url;
};

// 2. 提交认证申请
const submitAuth = async (realName, studentCardUrl) => {
  const res = await fetch('/api/user/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      real_name: realName,
      student_card_url: studentCardUrl
    })
  });
  
  return await res.json();
};
```

**管理员审核**:
```javascript
// 获取待审核列表
const getAuthList = async (status = 0) => {
  const res = await fetch(`/api/admin/auth/list?auth_status=${status}`, {
    headers: {
      'Authorization': 'Bearer ' + adminToken
    }
  });
  
  return await res.json();
};

// 审核认证
const auditAuth = async (userId, auditStatus, auditReason = '') => {
  const res = await fetch('/api/admin/auth/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    },
    body: JSON.stringify({
      user_id: userId,
      audit_status: auditStatus,
      audit_reason: auditReason
    })
  });
  
  return await res.json();
};
```

---

## 三、数据字典更新

### 3.1 认证状态 (auth_status)

| 值 | 说明 | 用户可见文案 |
|----|------|-------------|
| 0 | 待审核 | "您的认证申请正在审核中，请耐心等待" |
| 1 | 已通过 | "已认证" |
| 2 | 已拒绝 | "认证未通过，请查看原因并重新提交" |

### 3.2 管理员角色 (admin_role)

| 值 | 说明 | 权限 |
|----|------|------|
| 0 | 超级管理员 | 所有权限，包括生成邀请码 |
| 1 | 普通管理员 | 商品审核、用户认证审核、投诉处理等 |

### 3.3 邀请码状态 (invite_code_status)

| 值 | 说明 |
|----|------|
| unused | 未使用 |
| used | 已使用 |
| expired | 已过期 |

---

## 四、错误码补充

| 错误码 | 说明 | 示例场景 |
|--------|------|---------|
| 10010 | 邀请码无效 | 注册管理员时使用了无效的邀请码 |
| 10011 | 邀请码已使用 | 邀请码已被其他人使用 |
| 10012 | 邀请码已过期 | 邀请码超过有效期 |
| 20010 | 用户未认证 | 尝试发布商品但用户未通过身份认证 |
| 20011 | 认证正在审核中 | 重复提交认证申请 |
| 20012 | 认证已被拒绝 | 认证被拒绝，请重新提交 |
| 30010 | 管理员权限不足 | 普通管理员尝试生成邀请码 |

---

## 五、注意事项

### 5.1 安全性

1. **密码加密**: 
   - 用户密码和管理员密码必须使用 bcrypt 加密存储
   - 密码复杂度要求：最少8位，包含字母和数字

2. **邀请码机制**:
   - 邀请码应该是随机生成的，不可预测
   - 建议格式：`INVITE-YYYY-XXX`（年份+随机数）
   - 设置合理的过期时间（建议30天）

3. **学生证照片**:
   - 限制上传文件大小（建议最大5MB）
   - 限制文件类型（jpg、png、jpeg）
   - 存储时添加水印防止盗用

### 5.2 性能优化

1. **认证审核列表**:
   - 添加索引：`idx_user_auth_audits_status`
   - 使用分页查询，避免一次性加载过多数据

2. **头像URL**:
   - 建议使用CDN存储头像图片
   - 图片压缩和格式优化（WebP格式）

### 5.3 用户体验

1. **认证状态提示**:
   - 待审核：显示预计审核时间
   - 已拒绝：明确显示拒绝原因
   - 已通过：显示认证徽章

2. **管理员审核**:
   - 提供学生证照片放大查看功能
   - 支持批量审核
   - 审核历史记录可追溯

---

## 六、后续优化建议

### 6.1 短期优化（1-2周）

1. **OCR识别**:
   - 集成OCR技术自动识别学生证信息
   - 自动填充学号、姓名等字段
   - 提高审核效率

2. **人脸识别**:
   - 上传头像时进行人脸检测
   - 与学生证照片进行比对
   - 增强身份验证安全性

### 6.2 中期优化（1个月）

1. **认证审核智能化**:
   - 使用AI辅助审核
   - 自动识别问题照片（模糊、反光等）
   - 提供审核建议

2. **管理员工作台**:
   - 数据可视化展示
   - 审核效率统计
   - 待办事项提醒

### 6.3 长期优化（2-3个月）

1. **多级认证**:
   - 基础认证（学生证）
   - 高级认证（学信网验证）
   - 信用等级划分

2. **认证过期机制**:
   - 毕业后自动降级认证
   - 定期重新认证
   - 认证有效期管理

---

## 七、测试建议

### 7.1 单元测试

```javascript
// 测试管理员注册
describe('管理员注册', () => {
  test('使用有效邀请码注册成功', async () => {
    const result = await registerAdmin({
      admin_name: 'test_admin',
      admin_password: 'test123456',
      admin_email: 'test@school.edu.cn',
      invite_code: 'INVITE-2025-001'
    });
    expect(result.code).toBe(200);
  });
  
  test('使用已使用的邀请码注册失败', async () => {
    const result = await registerAdmin({
      admin_name: 'test_admin2',
      admin_password: 'test123456',
      admin_email: 'test2@school.edu.cn',
      invite_code: 'INVITE-2025-001'
    });
    expect(result.code).toBe(400);
  });
});
```

### 7.2 集成测试

测试完整的认证流程：
1. 用户注册 → 登录
2. 上传学生证 → 提交认证
3. 管理员查看待审核列表
4. 管理员审核通过/拒绝
5. 用户查看认证状态

---

## 八、常见问题 FAQ

**Q1: 用户可以修改已提交的认证信息吗？**  
A: 认证状态为"待审核"时不可修改，审核通过后也不可修改。如果被拒绝，可以重新提交。

**Q2: 一个邀请码可以注册多个管理员吗？**  
A: 不可以，每个邀请码只能使用一次。

**Q3: 管理员忘记密码怎么办？**  
A: 联系超级管理员重置密码，或通过邮箱找回功能（需要实现）。

**Q4: 认证审核需要多长时间？**  
A: 建议在24小时内完成审核，系统可设置自动提醒管理员。

**Q5: 用户头像支持哪些格式？**  
A: 支持 JPG、PNG、JPEG 格式，建议大小不超过2MB。

---

## 九、更新日志

### v1.1 (2025-10-21)

**新增**:
- ✅ 用户表添加 `avatar_url` 字段
- ✅ 用户表添加 `real_name`、`student_card_url`、`auth_status` 字段
- ✅ 新增 `admins` 表（管理员表）
- ✅ 新增 `admin_invite_codes` 表（管理员邀请码表）
- ✅ 新增 `user_auth_audits` 表（用户认证审核记录表）
- ✅ 新增管理员注册接口 `POST /admin/register`
- ✅ 新增用户认证审核列表接口 `GET /admin/auth/list`
- ✅ 新增审核用户认证接口 `POST /admin/auth/audit`
- ✅ 新增管理员邀请码管理接口

**修改**:
- ✅ 修改用户注册接口，支持 `avatar_url` 参数
- ✅ 修改用户登录接口，返回 `avatar_url` 字段
- ✅ 修改用户信息接口，支持头像URL
- ✅ 修改校园身份认证接口，改为提交审核流程

**优化**:
- ✅ 优化数据库索引结构
- ✅ 添加数据字典说明
- ✅ 完善错误码定义

---

## 十、联系方式

如有问题或建议，请联系：

- **项目负责人**: [负责人姓名]
- **邮箱**: [邮箱地址]
- **技术支持**: [技术支持联系方式]

---

**文档维护**: 后端开发组  
**最后更新**: 2025-10-21

