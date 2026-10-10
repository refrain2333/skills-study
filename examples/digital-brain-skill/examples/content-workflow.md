# 示例：内容创作流程

本示例完整展示如何使用数字大脑创作内容。

## 场景

你想写一条关于“公开记录建设过程的经验”的 Twitter 串文。

## 第 1 步：启用技能

**用户请求**：“帮我写一条关于公开建设过程经验的串文。”

**智能体判断**：

- 触发点：“写串文”属于内容创作。
- 主题：“公开建设”可能符合品牌内容支柱。
- 操作：加载数字大脑技能。

## 第 2 步：读取身份信息（必需）

先读取 `identity/voice.md`，例如：

```yaml
formal_casual: 7/10
signature_phrases:
  - "说重点"
  - "我来拆解一下"
power_words:
  - "发布"
  - "迭代"
avoid:
  - "协同效应"
  - "之后再对齐"
  - 过多表情符号
```

再读取 `identity/brand.md`，确认主题符合内容支柱：

```yaml
content_pillars:
  - building_in_public
  - ai_agents
  - founder_lessons
target_audience: "早期技术创业者"
```

## 第 3 步：参考过去表现

智能体扫描 `content/posts.jsonl`，发现类似的高表现串文采用故事结构。

```json
{
  "type": "thread",
  "pillar": "building_in_public",
  "metrics": {"likes": 234, "reposts": 45},
  "notes": "故事形式效果较好"
}
```

## 第 4 步：检查创意库

智能体在 `content/ideas.jsonl` 中找到一条尚未完善的创意：

```json
{
  "idea": "写一条关于公开建设过程中的情绪起伏的串文",
  "status": "raw",
  "priority": "high"
}
```

可以把这个角度融入串文。

## 第 5 步：生成草稿

智能体以 `content/templates/thread.md` 为框架，生成 9 条串文，包括开场、背景、五个经验、总结和行动号召。生成后对照表达风格检查标志性短语、语气、专业术语和表情使用。

## 第 6 步：根据反馈迭代

用户说：“能把第 3 点改成关于害怕被评价吗？”

智能体保留整体语气与结构，重写第 3 点，并确保与其他内容连贯。

## 第 7 步：保存创意（若暂不发布）

```json
{
  "id": "idea_20241229_160000",
  "created": "2024-12-29T16:00:00Z",
  "idea": "串文：公开建设的五个经验（恐惧、成果、社区等）",
  "source": "developed_draft",
  "pillar": "building_in_public",
  "status": "ready",
  "priority": "high",
  "notes": "草稿已完成，并检查表达一致性",
  "tags": ["thread", "building_in_public", "founder_lessons"]
}
```

## 第 8 步：发布后记录

```json
{
  "id": "post_20241229_180000",
  "published": "2024-12-29T18:00:00Z",
  "platform": "twitter",
  "type": "thread",
  "content": "示例串文正文……",
  "url": "https://twitter.com/user/status/123456789",
  "pillar": "building_in_public",
  "metrics": {"impressions": 0, "likes": 0, "comments": 0, "reposts": 0},
  "metrics_updated": "2024-12-29T18:00:00Z",
  "notes": "采用故事结构，起草时的害怕被评价角度引发共鸣",
  "tags": ["thread", "building_in_public"]
}
```

## 读取的文件

| 文件 | 用途 | 令牌估算 |
| --- | --- | ---: |
| `SKILL.md` | 路由 | 50 |
| `identity/voice.md` | 表达模式 | 200 |
| `identity/brand.md` | 主题检查 | 150 |
| `content/posts.jsonl` | 历史表现 | 100 |
| `content/ideas.jsonl` | 既有创意 | 50 |
| `content/templates/thread.md` | 内容结构 | 100 |

总计约 650 个令牌；若加载整个系统约需 5,000 个。

## 关键经验

1. 起草前先读取表达风格。
2. 渐进加载，只访问相关模块。
3. 参考历史表现改进新内容。
4. 完成从创意、草稿、发布到记录的完整流程。
5. 创意和帖子只追加，不删除。
