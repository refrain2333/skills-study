---
name: network-module
description: 联系人和关系管理，包含互动历史与人际网络笔记；用于会议准备、人际引荐和关系维护。
---

# 人际网络模块

用于维护有意义关系的个人 CRM。

## 模块文件

| 文件 | 格式 | 用途 |
| --- | --- | --- |
| `contacts.jsonl` | JSONL | 联系人数据库 |
| `interactions.jsonl` | JSONL | 会议和沟通记录 |
| `circles.yaml` | YAML | 关系层级和群组 |
| `intros.md` | Markdown | 待完成和已完成的引荐 |

## 数据结构

### 联系人记录

```json
{
  "id": "contact_[unique]",
  "created": "ISO8601",
  "updated": "ISO8601",
  "name": "姓名",
  "handle": "@social_handle",
  "email": "email@example.com",
  "company": "公司名称",
  "role": "职位",
  "location": "城市、国家",
  "circle": "inner|active|network|dormant",
  "how_met": "相识方式",
  "relationship": "friend|mentor|peer|collaborator|investor|customer",
  "topics": ["主题一", "主题二"],
  "can_help_with": ["对方能提供的帮助"],
  "you_can_help_with": ["你能提供的帮助"],
  "notes": "个人备注",
  "last_contact": "ISO8601",
  "links": {"twitter": "url", "linkedin": "url", "website": "url"}
}
```

### 互动记录

```json
{
  "id": "int_YYYYMMDD_HHMMSS",
  "date": "ISO8601",
  "contact_id": "contact_[id]",
  "type": "call|coffee|dm|email|event|collab",
  "context": "讨论内容",
  "key_points": ["要点一", "要点二"],
  "follow_ups": ["行动一", "行动二"],
  "sentiment": "positive|neutral|needs_attention"
}
```

## 工作流

### 会前准备

1. 在 `contacts.jsonl` 查找联系人。
2. 在 `interactions.jsonl` 查看近期互动。
3. 检查 `circles.yaml` 中的关系背景。
4. 列出待跟进事项和待完成引荐。

### 会后处理

1. 将互动追加到 `interactions.jsonl`。
2. 更新 `contacts.jsonl` 中的 `last_contact`。
3. 将跟进事项加入 `operations/todos.md`。
4. 必要时更新关系备注。

### 引荐他人

1. 在 `contacts.jsonl` 中检查双方资料。
2. 查看 `can_help_with` 字段，确认双方都能获益。
3. 在 `intros.md` 记录引荐。
4. 跟进引荐进展。

## 智能体指引

<instructions>
管理关系时：
1. 按姓名、账号、公司或主题检索联系人。
2. 会前准备时汇总联系人资料、近期互动和共同兴趣。
3. 记录互动时至少包含日期、类型、背景和后续事项。
4. 根据双方的 `can_help_with` 信息匹配引荐。
5. 根据 `last_contact` 发现长期未联系的人。

关系层级：
- `inner`：亲近关系，定期联系。
- `active`：当前合作伙伴，互动频繁。
- `network`：认识的人，周期性联系。
- `dormant`：历史关系，可考虑重新联系。
</instructions>

## 关系原则

```yaml
networking_philosophy:
  - "先提供帮助，再提出请求"
  - "重质量，不重数量"
  - "及时跟进至关重要"
  - "提供真诚帮助"
  - "先征求双方同意，再进行引荐"
```
