# 示例：会议准备流程

本示例展示如何用数字大脑准备会议。

## 场景

你将在 30 分钟后与 Sarah Chen 通话，需要一份简短背景摘要。

## 第 1 步：启用技能

**用户请求**：“帮我准备和 Sarah Chen 的通话。”

**智能体判断**：姓名加“准备通话”表示会议准备任务；加载数字大脑技能和人际网络模块。

## 第 2 步：查找联系人

在 `network/contacts.jsonl` 中找到 Sarah：

```json
{
  "id": "contact_sarahchen",
  "name": "Sarah Chen",
  "handle": "@sarahchen_ai",
  "company": "AI Ventures",
  "role": "合伙人",
  "circle": "active",
  "how_met": "她看到我关于智能体系统的串文后主动联系",
  "relationship": "potential_investor",
  "topics": ["ai_agents", "investing", "founder_market_fit"],
  "can_help_with": ["融资引荐", "市场策略建议"],
  "you_can_help_with": ["技术尽调", "智能体架构见解"],
  "notes": "技术背景很强的投资人；曾在 Google 做机器学习工程师；重视内容深度而非包装。",
  "last_contact": "2024-12-15T00:00:00Z"
}
```

## 第 3 步：查看互动历史

智能体按 `contact_id` 过滤 `network/interactions.jsonl`，发现最近一次电话讨论了合作机会、技术架构以及她的被投公司 BuildAI；待跟进事项包括发送技术方案和引荐 BuildAI 团队。

## 第 4 步：检查待办

在 `operations/todos.md` 中发现 BuildAI 引荐已超期，发送技术方案仍是 P1 任务，因此应在会议摘要中提醒。

## 第 5 步：生成会前摘要

摘要包括：会议时间、对方职位和关系状态、最后联系时间、个人背景、上次讨论要点、待跟进事项、双方可交换的价值、建议议题以及社交资料链接。

建议议题：

1. 为技术方案延误致歉，并提出现场讲解。
2. 询问 BuildAI 引荐进展。
3. 分享相关功能的近期进展。
4. 了解对方投资计划的时间安排。

## 第 6 步：会后记录

通话后，用户告知：“刚和 Sarah 通完电话，她会推进 BuildAI 引荐，希望我周五前发技术方案。”智能体应：

- 向 `network/interactions.jsonl` 追加一条互动记录，包含日期、主题、关键点、待跟进事项和情绪。
- 在 `operations/todos.md` 中将技术方案列为今天或本周的优先事项。
- 更新联系人 `last_contact` 时间。

## 读取的文件

| 文件 | 用途 | 令牌估算 |
| --- | --- | ---: |
| `SKILL.md` | 路由 | 50 |
| `network/NETWORK.md` | 模块说明 | 60 |
| `network/contacts.jsonl` | 查找联系人 | 80 |
| `network/interactions.jsonl` | 互动历史 | 150 |
| `operations/todos.md` | 待处理事项 | 50 |

总计约 390 个令牌。

## 关键经验

1. 从多个来源拼接必要背景。
2. 输出应便于行动，而不只是重复原始数据。
3. 主动发现逾期待办。
4. 完成会前准备、会后记录、更新待办和联系人信息的闭环。
5. 使用关系备注调整会议准备方式。
