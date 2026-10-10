# 文件格式参考

本文详细说明数字大脑使用的各类文件格式。

---

## JSONL 文件

### 数据结构约定

每个 JSONL 文件都以一行数据结构说明开头：

```json
{"_schema": "schema_name", "_version": "1.0", "_description": "Purpose of this file"}
```

处理数据时会跳过这一行；它用于说明文件预期结构。

### 通用字段

所有数据项都应包含：

```json
{
  "id": "type_YYYYMMDD_HHMMSS",  // Unique identifier
  "created": "ISO8601",           // Creation timestamp
  "updated": "ISO8601"            // Last modification (optional)
}
```

### ideas.jsonl：内容创意

```json
{
  "id": "idea_20241229_143022",
  "created": "2024-12-29T14:30:22Z",
  "idea": "Content of the idea",
  "source": "observation|conversation|reading|shower_thought",
  "pillar": "content_pillar_name",
  "status": "raw|developing|ready|published|archived",
  "priority": "high|medium|low",
  "notes": "Additional context",
  "tags": ["tag1", "tag2"]
}
```

### posts.jsonl：已发布内容

```json
{
  "id": "post_20241229_160000",
  "published": "2024-12-29T16:00:00Z",
  "platform": "twitter|linkedin|newsletter|blog|youtube",
  "type": "post|thread|article|video|podcast",
  "content": "Full content or summary",
  "url": "https://...",
  "pillar": "content_pillar_name",
  "metrics": {
    "impressions": 0,
    "likes": 0,
    "comments": 0,
    "reposts": 0,
    "saves": 0
  },
  "metrics_updated": "2024-12-29T20:00:00Z",
  "notes": "What worked/didn't",
  "tags": ["tag1", "tag2"]
}
```

### contacts.jsonl：联系人

```json
{
  "id": "contact_johndoe",
  "created": "2024-01-15T00:00:00Z",
  "updated": "2024-12-29T00:00:00Z",
  "name": "John Doe",
  "handle": "@johndoe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "role": "CEO",
  "location": "San Francisco, USA",
  "circle": "inner|active|network|dormant",
  "how_met": "Met at conference",
  "relationship": "friend|mentor|peer|collaborator|investor|customer",
  "topics": ["ai", "startups"],
  "can_help_with": ["intros to VCs"],
  "you_can_help_with": ["technical advice"],
  "notes": "Personal context",
  "last_contact": "2024-12-15T00:00:00Z",
  "links": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "website": "https://johndoe.com"
  }
}
```

### interactions.jsonl：互动记录

```json
{
  "id": "int_20241229_100000",
  "date": "2024-12-29T10:00:00Z",
  "contact_id": "contact_johndoe",
  "type": "call|coffee|dm|email|event|collab",
  "context": "Discussed partnership opportunity",
  "key_points": ["Point 1", "Point 2"],
  "follow_ups": ["Send proposal", "Intro to Sarah"],
  "sentiment": "positive|neutral|needs_attention"
}
```

### bookmarks.jsonl：收藏资料

```json
{
  "id": "bm_20241229_120000",
  "saved_at": "2024-12-29T12:00:00Z",
  "url": "https://example.com/article",
  "title": "Article Title",
  "source": "article|video|podcast|tool|tweet|paper",
  "category": "ai_agents|building|growth|productivity|leadership|industry|personal",
  "summary": "1-2 sentence summary",
  "key_insights": ["Insight 1", "Insight 2"],
  "status": "unread|read|reviewed|archived",
  "rating": 1-5,
  "tags": ["tag1", "tag2"]
}
```

### meetings.jsonl：会议记录

```json
{
  "id": "mtg_20241229_140000",
  "date": "2024-12-29T14:00:00Z",
  "title": "Meeting Title",
  "type": "1on1|team|external|interview|pitch|advisory",
  "attendees": ["John Doe", "Jane Smith"],
  "duration_mins": 30,
  "agenda": ["Topic 1", "Topic 2"],
  "notes": "Discussion summary",
  "decisions": ["Decision made"],
  "action_items": [
    {"task": "Task description", "owner": "John", "due": "2024-12-31"}
  ],
  "follow_up": "Next steps"
}
```

### metrics.jsonl：指标快照

```json
{
  "id": "metrics_20241229",
  "week_of": "2024-12-23",
  "recorded_at": "2024-12-29T00:00:00Z",
  "audience": {
    "twitter_followers": 5000,
    "newsletter_subscribers": 1200,
    "linkedin_connections": 3000,
    "youtube_subscribers": 500
  },
  "engagement": {
    "avg_impressions": 10000,
    "avg_engagement_rate": 0.05,
    "newsletter_open_rate": 0.45
  },
  "content": {
    "posts_published": 7,
    "threads_published": 2,
    "newsletters_sent": 1
  },
  "business": {
    "revenue": 0,
    "mrr": 0,
    "customers": 0,
    "leads": 5
  },
  "personal": {
    "deep_work_hours": 25,
    "exercise_sessions": 4,
    "books_read": 0.5
  },
  "notes": "Strong week for content"
}
```

---

## YAML 文件

### values.yaml：价值观

```yaml
core_values:
  - name: "Value Name"
    description: "What it means"
    in_practice: "How it shows up"

beliefs:
  - "Belief statement"

contrarian_views:
  - view: "The view"
    reasoning: "Why you hold it"

non_negotiables:
  - "Line you won't cross"

principles:
  content_creation:
    - "Principle"
  business:
    - "Principle"
```

### goals.yaml：目标

```yaml
current_period:
  quarter: "Q1 2025"
  theme: "Growth focus"

objectives:
  - objective: "Objective statement"
    why: "Why it matters"
    key_results:
      - description: "KR description"
        target: 100
        current: 25
        unit: "followers"
        status: "on_track|at_risk|behind|completed"

north_star:
  metric: "The one metric"
  current: 1000
  target: 10000
  why: "Why this matters most"
```

### learning.yaml：学习记录

```yaml
current_focus:
  skill: "Skill name"
  why: "Why learning this"
  target_level: "Target proficiency"
  deadline: "2025-03-31"

skills:
  - name: "Skill name"
    category: "technical|creative|business|personal"
    current_level: "beginner|intermediate|advanced|expert"
    target_level: "Target"
    status: "learning|practicing|maintaining"
    resources:
      - type: "course|book|tutorial|project"
        title: "Resource name"
        url: "https://..."
        status: "not_started|in_progress|completed"
    milestones:
      - "Milestone description"
    last_practiced: "2024-12-29"
```

### circles.yaml：关系层级

```yaml
circles:
  inner:
    description: "Close relationships"
    touchpoint_frequency: "weekly"
    members:
      - "Name - context"

  active:
    description: "Current collaborators"
    touchpoint_frequency: "bi-weekly"
    members:
      - "Name - context"

groups:
  founders:
    description: "Fellow founders"
    members:
      - "Name"

goals:
  this_quarter:
    - "Relationship goal"
```

---

## Markdown 文件

### 结构约定

所有 Markdown 文件遵循以下结构：

```markdown
# Title

Brief description.

---

## Section 1

Content...

---

## Section 2

Content...

---

*Last updated: [DATE]*
```

### 占位符约定

用户需要填写的字段使用 `[PLACEHOLDER: description]` 标记：

```markdown
### Your Story
```
[PLACEHOLDER: Write your founder journey here]
```
```

---

## XML 文件

### 提示词模板结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<prompt name="prompt-name" version="1.0">
  <description>
    What this prompt does
  </description>

  <instructions>
    <context>
      Background for the task
    </context>

    <guidelines>
      Rules to follow
    </guidelines>

    <output_requirements>
      Expected output format
    </output_requirements>
  </instructions>

  <examples>
    Input/output examples
  </examples>
</prompt>
```

---

## ID 生成

### 命名约定

`{type}_{YYYYMMDD}_{HHMMSS}` or `{type}_{unique_slug}`

示例：
- `idea_20241229_143022`
- `contact_johndoe`
- `post_20241229_160000`
- `bm_20241229_120000`

### 唯一性

每个文件内的 ID 必须唯一。时间戳形式的 ID 可保证时序数据的唯一性。
