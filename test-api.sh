#!/bin/bash

echo "======================================"
echo "🚀 开始测试 API 接口"
echo "======================================"
echo ""

echo "=== 1️⃣ 测试登录接口 ==="
echo "请求: POST /api/auth/login"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@school.edu.cn","password":"12345678"}')

# 检查是否有 jq 命令（用于格式化 JSON）
if command -v jq &> /dev/null; then
    echo "响应:"
    echo "$RESPONSE" | jq .
    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
else
    echo "响应:"
    echo "$RESPONSE"
    # 如果没有 jq，使用基础方法提取 token
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
fi

echo ""
echo "======================================"

# 检查登录是否成功
if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ 登录失败！请检查："
    echo "   1. 服务器是否正在运行"
    echo "   2. 用户是否已注册"
    echo "   3. 邮箱和密码是否正确"
    echo ""
    echo "提示：如果用户不存在，请先注册："
    echo "curl -X POST http://localhost:3000/api/auth/register \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"username\":\"测试用户\",\"email\":\"test@school.edu.cn\",\"password\":\"12345678\",\"student_id\":\"2025001\"}'"
    exit 1
fi

echo "✅ 登录成功！"
echo "Token: ${TOKEN:0:50}..."
echo ""
echo "======================================"
echo ""

sleep 1

echo "=== 2️⃣ 测试获取个人信息接口 ==="
echo "请求: GET /api/auth/user/info"
echo "携带 Token: Bearer ${TOKEN:0:30}..."
echo ""

USER_INFO=$(curl -s -X GET http://localhost:3000/api/auth/user/info \
  -H "Authorization: Bearer $TOKEN")

if command -v jq &> /dev/null; then
    echo "响应:"
    echo "$USER_INFO" | jq .
else
    echo "响应:"
    echo "$USER_INFO"
fi

echo ""
echo "======================================"

# 检查获取用户信息是否成功
if echo "$USER_INFO" | grep -q '"code":200'; then
    echo "✅ 获取个人信息成功！"
else
    echo "❌ 获取个人信息失败！"
fi

echo ""
echo "======================================"
echo "🎉 测试完成！"
echo "======================================"

