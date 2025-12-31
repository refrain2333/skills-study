# Supabase 设置指南

本指南介绍如何在 Supabase 上设置语义知识注册表。

## 前置要求

- Supabase 账户（免费层就可以）
- OpenAI API 密钥（用于嵌入）

## 步骤 1：获取数据库连接字符串

1. 进入你的 Supabase 项目仪表板：https://supabase.com/dashboard/project/cppdscqtkzuiwqdiumdq

2. 点击 **设置** (左侧边栏) > **数据库**

3. 向下滚动到 **连接字符串**

4. 选择 **URI** 格式

5. 复制连接字符串。应该看起来像：
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

6. **重要**：用你的实际数据库密码替换 `[YOUR-PASSWORD]`

## 步骤 2：启用 pgvector 扩展

1. 在 Supabase 仪表板，进入 **数据库** > **扩展**

2. 搜索 "vector"

3. 在 `vector` 扩展上点击 **启用**

4. 等待安装完成（应该是即时的）

## 步骤 3：配置本地环境

更新你的 `Database/.env` 文件：

```bash
# Supabase 连接
DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# OpenAI API 密钥（已设置）
OPENAI_API_KEY=sk-proj-...

# 嵌入配置
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# 环境
ENVIRONMENT=production
```

## 步骤 4：初始化 Supabase 数据库

运行设置脚本：

```bash
cd Database
python -m scripts.setup_supabase
```

这将：
- 连接到你的 Supabase 数据库
- 创建所有需要的表
- 设置 pgvector 索引
- 验证设置

## 步骤 5：索引你的技能和文档

```bash
# 用嵌入索引所有内容
python -m scripts.index --all
```

这将：
- 索引 `skills/` 目录中的所有 10 个技能
- 索引 `docs/` 目录中的所有文档
- 为语义搜索生成嵌入
- 将文档链接到技能

预期输出：
```
已索引 10 个技能
已索引 7 个文档
总索引：17 项

注册表统计：
  技能：10 个（10 个有嵌入）
  文档：7 个（7 个有嵌入）
  技能-文档链接：14
```

## 步骤 6：测试语义搜索

```bash
# 搜索技能
python -m scripts.search "如何为 AI 代理设计工具" --threshold 0.5

# 搜索特定类型
python -m scripts.search "上下文窗口管理" --type skills --threshold 0.4

# 获取 JSON 输出
python -m scripts.search "评估技术" --json
```

## 同时使用本地和 Supabase

你可以通过改变 `DATABASE_URL` 在本地 Docker 数据库和 Supabase 之间切换：

**本地 Docker：**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agentskills
```

**Supabase：**
```bash
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 验证设置

在 Supabase 仪表板中检查你的数据库：

1. 进入 **表编辑器**
2. 你应该看到表：`skills`、`documents`、`skill_sources`、`skill_versions`、`skill_references`
3. 点击 `skills` 表查看你的索引技能

## 成本

- **Supabase**：免费层包括 500MB 数据库，足够此用例
- **OpenAI 嵌入**：约 $0.10 每 100 万个令牌（索引 10 个技能 ≈ $0.01）

## 故障排除

### 连接被拒绝

- 检查 DATABASE_URL 有正确的密码
- 验证你使用的是 **池化器** 连接字符串（端口 6543）
- 检查 Supabase 仪表板显示项目是活跃的

### 未找到 pgvector 扩展

- 手动启用：数据库 > 扩展 > vector > 启用
- 重新运行设置脚本

### 嵌入错误

- 验证 OPENAI_API_KEY 设置正确
- 检查你有 API 信用

### 架构已存在

架构使用 `IF NOT EXISTS`，所以重新运行是安全的。如果需要重置：

```sql
-- 在 Supabase SQL 编辑器中
DROP TABLE IF EXISTS skill_references CASCADE;
DROP TABLE IF EXISTS skill_versions CASCADE;
DROP TABLE IF EXISTS skill_sources CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
```

然后重新运行 `python -m scripts.setup_supabase`。

## 安全性

- **不要提交** `.env` 文件（已在 `.gitignore` 中）
- Supabase 可发布 API 密钥用于 REST API，不是直接数据库访问
- 如果通过 Supabase API 公开数据，使用行级安全 (RLS) 策略
- 对于此内部工具，直接数据库访问是可以的


