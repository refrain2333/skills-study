# 如何使用新的文档前置元数据更新数据库

`docs/` 中的所有文档现在都有前置元数据，包含 `name`、`description` 和 `source_url` 字段，与技能格式匹配。

## 步骤 1：运行数据库迁移

首先，向数据库添加新列（`description` 和 `source_url`）：

### 对于本地 Docker 数据库：

```bash
cd Database
PGPASSWORD=postgres psql -h localhost -U postgres -d agentskills -f schema/add_document_fields.sql
```

### 对于 Supabase：

```bash
cd Database

# 选项 1：直接使用 psql
psql "your-supabase-connection-string" -f schema/add_document_fields.sql

# 选项 2：使用 Supabase SQL 编辑器
# 1. 进入：https://supabase.com/dashboard/project/cppdscqtkzuiwqdiumdq/sql/new
# 2. 复制并粘贴 schema/add_document_fields.sql 的内容
# 3. 点击"运行"
```

## 步骤 2：重新索引文档

运行迁移后，重新索引所有文档以使用新的前置元数据数据进行更新：

```bash
cd Database

# 仅重新索引文档（更快）
python -m scripts.index --docs

# 或重新索引所有内容
python -m scripts.index --all
```

这将：
- 从每个文档解析前置元数据
- 提取 `name`、`description` 和 `source_url`
- 使用新信息更新数据库记录
- 如果需要，重新生成嵌入

## 步骤 3：验证更新

检查文档是否已更新：

```bash
cd Database

# 检查特定文档
python -c "
from scripts.registry import SkillRegistry
registry = SkillRegistry()
doc = registry.get_document('docs/blogs.md')
if doc:
    print(f\"标题：{doc.get('title', 'N/A')}\")
    print(f\"描述：{doc.get('description', 'N/A')[:100]}...\")
    print(f\"源 URL：{doc.get('source_url', 'N/A')}\")
"

# 列出所有文档及其新字段
python -c "
from scripts.registry import SkillRegistry
from scripts.db import execute_query

results = execute_query('SELECT title, description, source_url FROM documents ORDER BY title')
print(f\"找到 {len(results)} 个文档：\")
for r in results:
    print(f\"\\n  {r['title']}\")
    print(f\"    描述：{r.get('description', 'N/A')[:80]}...\")
    print(f\"    源：{r.get('source_url', 'N/A')}\")
"
```

## 发生了什么变化

### 文档前置元数据格式

所有文档现在都以以下开头：

```yaml
---
name: document-name
description: 文档涵盖内容的简要说明
doc_type: blog|research|reference|case_study
source_url: URL 或"No"（如果未知）
---
```

所有字段（`name`、`description`、`doc_type`、`source_url`）都从前置元数据读取并存储在数据库中，与技能格式匹配。

### 更新的文档

1. **blogs.md** → `context-engineering-blogs` (doc_type: blog)
2. **claude_research.md** → `production-grade-llm-agents` (doc_type: research)
3. **compression.md** → `context-compression-evaluation` (doc_type: research)
4. **gemini_research.md** → `advanced-agentic-architectures` (doc_type: research)
5. **netflix_context.md** → `netflix-context-compression` (doc_type: case_study)
6. **vercel_tool.md** → `vercel-tool-reduction` (doc_type: blog, 有源 URL)
7. **anthropic_skills/agentskills.md** → `agent-skills-format` (doc_type: reference)

### 数据库架构更改

向 `documents` 表添加了两个新列：
- `description TEXT` - 来自前置元数据的描述
- `source_url VARCHAR(512)` - 源 URL 或"No"

## 故障排除

### 迁移失败

如果你收到"列已存在"错误，迁移已经运行。你可以跳到步骤 2。

### 文档未更新

如果文档未更新，检查：
1. 前置元数据格式正确（`---` 标记之间的 YAML）
2. 数据库连接正常
3. 文件路径正确

### 需要强制重新索引

要强制重新索引，即使内容哈希未改变：

```bash
# 这将重新生成嵌入和更新所有字段
python -m scripts.index --docs --force
```

## 后续步骤

更新后：
- 文档在搜索结果中将有适当的名称和描述
- 源 URL 将被追踪用于属性
- 改进的元数据带来更好的语义搜索结果


