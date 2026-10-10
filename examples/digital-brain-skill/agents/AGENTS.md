---
name: agents-module
description: 数字大脑的自动化脚本和智能体辅助工具；用于周期任务、摘要和维护。
---

# 智能体自动化

帮助维护和使用数字大脑的脚本与工作流。

## 可用脚本

| 脚本 | 用途 | 频率 |
| --- | --- | --- |
| `weekly_review.py` | 根据数据生成周度回顾 | 每周 |
| `content_ideas.py` | 从知识库生成内容创意 | 按需 |
| `stale_contacts.py` | 查找需要重新联系的人 | 每周 |
| `metrics_snapshot.py` | 汇总并记录指标 | 每周 |
| `idea_to_draft.py` | 将创意扩展成草稿 | 按需 |

## 使用方式

脚本位于 `agents/scripts/`。它们读取数字大脑数据，智能体可以在需要时运行。

```bash
python agents/scripts/weekly_review.py
python agents/scripts/content_ideas.py --pillar "ai_agents" --count 5
```

脚本会向标准输出返回智能体可处理的结果；适当时也会写入文件，例如生成周度回顾文档。

## 智能体指引

<instructions>
使用自动化脚本时：

1. **周度回顾**：每周日运行，并用数据填充回顾模板。
2. **内容创意**：用户请求创意时运行，结合知识库生成建议。
3. **长期未联系的人**：每周运行，找出需要维护的关系。
4. **指标快照**：每周运行并追加到 metrics.jsonl。
5. **创意转草稿**：用户要完善某条创意时使用。

脚本从数字大脑文件读取数据，并返回可执行的结果。
</instructions>

## 自动化流程

### 周日回顾

```text
1. 运行 metrics_snapshot.py 更新 metrics.jsonl。
2. 运行 stale_contacts.py 找出待联系对象。
3. 运行 weekly_review.py 生成回顾文档。
4. 向用户展示摘要。
```

### 内容创意整理

```text
1. 阅读 knowledge/bookmarks.jsonl 中近期保存的资料。
2. 检查 content/ideas.jsonl 中尚未完善的创意。
3. 运行 content_ideas.py 获取新建议。
4. 对照内容日历检查安排。
```

### 会前准备

```text
1. 在 network/contacts.jsonl 查找联系人。
2. 从 network/interactions.jsonl 获取近期互动。
3. 检查涉及该联系人的待办事项。
4. 生成包含背景的会前摘要。
```

## 开发自定义脚本

1. 在 `agents/scripts/` 中创建 Python 文件。
2. 遵循现有模式（读取 JSONL、输出结构化数据）。
3. 在本文件中记录脚本用途。
4. 使用示例数据检查脚本行为。
