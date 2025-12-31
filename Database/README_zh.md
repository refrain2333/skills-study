# 语义知识注册表

PostgreSQL + pgvector 数据库层，用于代理技能知识库。启用对技能和文档的语义搜索，允许代理通过意思而不是精确文本匹配来找到相关知识。

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    语义知识注册表                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │     技能         │     │    文档          │                  │
│  │  (SKILL.md)      │◄────│   (docs/*.md)    │                  │
│  │                  │     │                  │                  │
│  │  - 元数据        │     │  - 内容          │                  │
│  │  - 嵌入         │     │  - 嵌入         │                  │
│  │  - 版本         │     │  - hash         │                  │
│  └────────┬─────────┘     └────────┬─────────┘                  │
│           │                        │                            │
│           └────────┬───────────────┘                            │
│                    ▼                                            │
│           ┌────────────────┐                                    │
│           │  skill_sources │  (连接表)                          │
│           │                │                                    │
│           │  追踪哪个文档  │                                    │
│           │  影响了哪个   │                                    │
│           │  技能         │                                    │
│           └────────────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 为什么选择 Postgres + pgvector

1. **单一事实来源**：结构化元数据和向量嵌入在一个数据库中
2. **生产就绪**：经过实战检验的技术栈，易于扩展
3. **成本低**：Neon/Supabase 有慷慨的免费层
4. **无供应商锁定**：开源，标准 SQL

## 前置要求

- Docker 和 Docker Compose（用于本地开发）
- Python 3.9+
- OpenAI API 密钥（用于嵌入）或兼容的嵌入提供商

## 快速开始

### 1. 启动本地数据库

```bash
cd Database
docker-compose up -d
```

这将启动：
- PostgreSQL 16（带 pgvector 扩展）
- Adminer（数据库 UI）在 http://localhost:8080

### 2. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 3. 初始化数据库架构

```bash
python scripts/init_db.py
```

### 4. 索引技能和文档

```bash
# 索引所有技能
python scripts/index.py --skills

# 索引所有文档
python scripts/index.py --docs

# 索引所有内容
python scripts/index.py --all
```

### 5. 搜索

```bash
# 语义搜索
python scripts/search.py "如何为代理设计工具"

# 带过滤的搜索
python scripts/search.py "上下文窗口优化" --type skills --limit 5
```

## 配置

设置环境变量或创建 `.env` 文件：

```bash
# 数据库连接
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agentskills

# 嵌入提供商
OPENAI_API_KEY=sk-...

# 可选：使用不同的嵌入模型
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
```

## 架构概览

### skills（技能表）

代理技能的主要注册表。

| 列 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 技能标识符（如"tool-design"） |
| description | TEXT | 来自前置元数据的简要说明 |
| content | TEXT | 完整的 SKILL.md 内容 |
| path | VARCHAR(512) | 文件系统路径 |
| version | VARCHAR(50) | 语义版本 |
| embedding | vector(1536) | 语义嵌入 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 最后更新时间 |

### documents（文档表）

用于构建技能的源文档。

| 列 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(512) | 文档标题 |
| content | TEXT | 完整文档内容 |
| path | VARCHAR(512) | 文件系统路径 |
| content_hash | VARCHAR(64) | SHA-256 哈希值用于变更检测 |
| embedding | vector(1536) | 语义嵌入 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 最后更新时间 |

### skill_sources（技能源表）

将技能链接到其源文档的连接表。

| 列 | 类型 | 说明 |
|------|------|------|
| skill_id | UUID | 技能外键 |
| document_id | UUID | 文档外键 |
| relevance | FLOAT | 文档的相关性（0-1） |

### skill_versions（技能版本表）

技能的版本历史。

| 列 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| skill_id | UUID | 技能外键 |
| version | VARCHAR(50) | 版本字符串 |
| content | TEXT | 该版本的内容 |
| created_at | TIMESTAMP | 何时创建此版本 |

## Python API

```python
from scripts.registry import SkillRegistry

# 初始化
registry = SkillRegistry()

# 语义搜索技能
results = registry.search_skills("如何设计有效的代理工具", limit=5)
for skill in results:
    print(f"{skill['name']}: {skill['similarity']:.3f}")

# 搜索文档
docs = registry.search_documents("上下文窗口管理", limit=10)

# 为新文档查找相关技能
related = registry.find_related_skills(new_doc_content, threshold=0.7)

# 注册新技能
registry.upsert_skill(
    name="new-skill",
    description="一个新技能",
    content=skill_content,
    path="skills/new-skill/SKILL.md",
    version="1.0.0"
)

# 将技能链接到源文档
registry.link_skill_to_document(skill_id, document_id, relevance=0.9)
```

## 代理集成

当代理收到新文档时：

```python
from scripts.registry import SkillRegistry

registry = SkillRegistry()

def process_new_document(content: str, path: str):
    """处理新文档并确定技能更新。"""
    
    # 1. 索引新文档
    doc_id = registry.upsert_document(
        title=extract_title(content),
        content=content,
        path=path
    )
    
    # 2. 找语义相关的技能
    related_skills = registry.find_related_skills(content, threshold=0.7)
    
    # 3. 确定行动
    if not related_skills:
        # 没有相关技能 - 可能需要新技能
        return {"action": "create_skill", "document_id": doc_id}
    else:
        # 存在相关技能 - 可能需要更新
        return {
            "action": "update_skills",
            "document_id": doc_id,
            "related_skills": related_skills
        }
```

## 生产部署

对于生产环境，请使用支持 pgvector 的托管 PostgreSQL 服务：

- **Neon**：免费层 0.5GB 存储，包含 pgvector
- **Supabase**：免费层 500MB，包含 pgvector
- **Railway**：$5/月，包含 pgvector
- **AWS RDS**：pgvector 扩展可用

更新 `DATABASE_URL` 以指向你的生产实例。

## 维护

### 架构更改后重新索引

```bash
python scripts/index.py --all --force
```

### 检查嵌入覆盖

```bash
python scripts/check_coverage.py
```

### 备份

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```


