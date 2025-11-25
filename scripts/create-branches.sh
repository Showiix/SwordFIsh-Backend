#!/bin/bash

# ========================================
# SwordFish 后端 - 创建团队开发分支脚本
# ========================================

echo "======================================"
echo "🌿 创建团队开发分支"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 确保在 main 分支
echo -e "${BLUE}📍 切换到 main 分支...${NC}"
git checkout main
git pull origin main

# 创建 develop 分支
echo ""
echo -e "${BLUE}🔧 创建 develop 分支...${NC}"
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop

echo -e "${GREEN}✅ develop 分支创建成功${NC}"

# 切换到 develop
git checkout develop

# 功能分支列表（可以根据需要修改）
FEATURES=(
    "user-profile:用户资料管理"
    "product-management:商品管理"
    "order-system:订单系统"
    "payment-integration:支付集成"
    "message-system:消息系统"
    "review-rating:评价评分"
)

echo ""
echo -e "${YELLOW}创建以下功能分支：${NC}"
for feature in "${FEATURES[@]}"; do
    IFS=':' read -ra PARTS <<< "$feature"
    BRANCH_NAME="${PARTS[0]}"
    DESCRIPTION="${PARTS[1]}"
    echo "  - feature/${BRANCH_NAME} (${DESCRIPTION})"
done

echo ""
read -p "是否继续创建这些分支？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消操作"
    exit 1
fi

# 创建功能分支
for feature in "${FEATURES[@]}"; do
    IFS=':' read -ra PARTS <<< "$feature"
    BRANCH_NAME="${PARTS[0]}"
    DESCRIPTION="${PARTS[1]}"
    
    echo ""
    echo -e "${BLUE}🌱 创建分支: feature/${BRANCH_NAME}${NC}"
    
    git checkout develop
    git checkout -b "feature/${BRANCH_NAME}" 2>/dev/null || git checkout "feature/${BRANCH_NAME}"
    git push -u origin "feature/${BRANCH_NAME}"
    
    echo -e "${GREEN}✅ feature/${BRANCH_NAME} 创建成功${NC}"
done

# 回到 develop
git checkout develop

echo ""
echo "======================================"
echo -e "${GREEN}🎉 所有分支创建完成！${NC}"
echo "======================================"
echo ""
echo "📋 已创建的分支："
git branch -a | grep feature

echo ""
echo "💡 接下来的步骤："
echo "1. 在 GitHub/GitLab 上设置 main 分支保护"
echo "2. 告知组员他们负责的分支"
echo "3. 分享 Documents/团队协作-Git工作流程.md 给组员"
echo ""
echo "🔗 分支查看："
echo "   git branch -a"
echo ""

