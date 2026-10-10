---
name: knowledge-module
description: 个人知识库，管理研究、收藏资料、学习资源和笔记；用于信息检索、研究整理和学习追踪。
---

# 知识库

用于研究、学习和信息整理的第二大脑。

## 模块文件

| 文件 | 格式 | 用途 |
| --- | --- | --- |
| `bookmarks.jsonl` | JSONL | 已保存的网址和资料 |
| `learning.yaml` | YAML | 技能和学习目标 |
| `competitors.md` | Markdown | 竞争格局 |
| `research/` | 目录 | 深入研究笔记 |
| `notes/` | 目录 | 快速记录 |

## 数据结构

### 收藏记录

```json
{
  "id": "bm_YYYYMMDD_HHMMSS",
  "saved_at": "ISO8601",
  "url": "https://...",
  "title": "页面标题",
  "source": "article|video|podcast|tool|tweet|paper",
  "category": "category_name",
  "summary": "一到两句摘要",
  "key_insights": ["见解一", "见解二"],
  "status": "unread|read|reviewed|archived",
  "rating": 1,
  "tags": ["标签一", "标签二"]
}
```

## 工作流

### 保存资料

1. 以 `unread` 状态追加到 `bookmarks.jsonl`。
2. 添加类别和初始标签。
3. 后续阅读、摘要并更新状态。

### 研究项目

1. 在 `research/[主题].md` 创建深入笔记。
2. 链接相关收藏资料。
3. 综合形成见解。
4. 提炼可创作的内容创意。

### 学习跟踪

1. 在 `learning.yaml` 中定义技能。
2. 将学习资源关联到技能。
3. 跟踪进度和里程碑。
4. 每季度回顾。

## 智能体指引

<instructions>
管理知识时：
1. **保存链接**：记录网址、标题和初始类别。
2. **整理资料**：使用一致的类别和标签。
3. **检索**：按类别、标签或关键词搜索 bookmarks.jsonl。
4. **综合研究**：用户询问某主题时，先检查 research/。
5. **更新学习记录**：完成资源后更新 learning.yaml。

类别建议：
- ai_agents：AI、智能体、自动化。
- building：创业、产品、工程。
- growth：营销、受众、内容。
- productivity：系统、工具、工作流。
- leadership：管理、团队、文化。
- industry：市场趋势、竞争者。
- personal：健康、关系、生活。
</instructions>

## 知识关联提示

检索时也要考虑关联：收藏可转成内容创意；研究可形成权威文章；学习经历可用于品牌表达；竞争格局可用于差异化定位。
