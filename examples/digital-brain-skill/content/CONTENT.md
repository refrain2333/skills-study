---
name: content-module
description: 内容创作中心，管理创意、草稿、日历和已发布帖子；用于规划、撰写和跟踪内容。
---

# 内容中心

用于创作和管理个人内容。

## 模块文件

| 文件 | 格式 | 用途 |
| --- | --- | --- |
| `ideas.jsonl` | JSONL | 原始创意，只追加 |
| `posts.jsonl` | JSONL | 已发布内容日志 |
| `calendar.md` | Markdown | 内容日程 |
| `drafts/` | 目录 | 尚在修改的内容 |
| `templates/` | 目录 | 可复用格式 |
| `engagement.jsonl` | JSONL | 收藏的帖子和串文灵感 |

## 工作流

### 记录创意

将以下结构追加到 `ideas.jsonl`，并填写当前时间和内容：

```json
{
  "id": "idea_YYYYMMDD_HHMMSS",
  "created": "ISO8601",
  "idea": "创意内容",
  "source": "来源",
  "pillar": "内容支柱",
  "status": "raw|developing|ready",
  "priority": "high|medium|low"
}
```

### 内容创作流程

```text
1. ideas.jsonl：记录创意
   ↓
2. drafts/draft_[主题].md：完善草稿
   ↓
3. 对照 voice.md 检查表达方式
   ↓
4. 发布
   ↓
5. 将内容和指标存入 posts.jsonl
```

### 每周内容回顾

1. 检查 `ideas.jsonl`，完善或归档过期创意。
2. 检查 `calendar.md`，规划下周内容。
3. 回顾 `posts.jsonl`，分析哪些内容有效。
4. 将有启发的内容保存到 `engagement.jsonl`。

## 智能体指引

<instructions>
处理内容时：

1. **记录创意**：只追加到 ideas.jsonl，不覆盖旧记录。
2. **创建草稿**：从 templates/ 中选模板开始。
3. **撰写内容**：必须先读取 identity/voice.md。
4. **发布内容**：将完整元数据写入 posts.jsonl。
5. **分析效果**：参考 posts.jsonl 中的历史表现模式。

优先级：
- 高：时效性强、价值高、符合当前目标。
- 中：创意不错，但不紧急。
- 低：值得记录，稍后完善。
</instructions>

## 内容指标

```yaml
engagement_metrics:
  - impressions
  - likes
  - comments
  - reposts
  - saves
  - link_clicks

quality_indicators:
  - comment_quality: "有意义的讨论而非表情回应"
  - share_context: "分享时人们附带的说明"
  - follower_conversion: "帖子带来的新增关注"
```
