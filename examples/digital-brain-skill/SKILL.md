---
name: digital-brain
description: "用于个人工作系统任务：创作内容、保持表达风格一致、查询人际关系、准备会议、进行周度回顾、跟踪目标、管理个人品牌和维护人际网络。"
version: 1.0.0
---

# 数字大脑

一个借助 AI 管理数字形象、知识、人际关系和目标的结构化个人工作系统。适合公开记录创业过程的创始人、内容创作者，以及希望借助 AI 管理个人事务的技术从业者。

**重要**：本技能采用渐进披露。各子目录的 `.md` 文件包含对应模块说明。只加载当前任务需要的模块。

## 何时启用

用户提出以下请求时启用：

- 创作帖子、串文或简报；先加载 `identity/voice.md`。
- 寻求个人品牌或定位建议。
- 查询或管理联系人与人际关系。
- 记录或拓展内容创意。
- 准备会议或处理会后跟进。
- 进行周度回顾或跟踪目标。
- 保存或检索收藏资料。
- 整理研究或学习材料。

常见说法包括：“写一篇帖子”“按我的风格写”“有哪些内容创意”“某某是谁”“帮我准备会议”“周度回顾”“保存这个”“我的目标是什么”。

## 核心概念

### 渐进披露架构

数字大脑采用三级加载模式：

| 层级 | 加载时机 | 内容 |
| --- | --- | --- |
| **L1：元数据** | 始终 | 本 `SKILL.md` 概览 |
| **L2：模块说明** | 按需 | `[模块]/[模块名].md` 文件 |
| **L3：数据文件** | 任务需要时 | `.jsonl`、`.yaml`、`.md` 数据 |

### 文件格式策略

按智能体解析需求选择格式：

- **JSONL**（`.jsonl`）：只追加日志，如创意、帖子、联系人和互动记录。
- **YAML**（`.yaml`）：结构化配置，如目标、价值观和关系层级。
- **Markdown**（`.md`）：叙述内容，如表达风格、品牌、日历和待办。
- **XML**（`.xml`）：结构复杂的提示词和内容生成模板。

### 只追加数据完整性

JSONL 文件只追加，绝不删除记录：

- 使用 `"status": "archived"` 标记归档，而不是删行。
- 保留历史，便于分析模式。
- 支持回顾“哪些做法有效”。

## 详细主题

### 模块概览

```
digital-brain/
├── identity/     → 表达方式、品牌、价值观（创作内容前先读）
├── content/      → 创意、草稿、帖子、日历
├── knowledge/    → 收藏、研究、学习
├── network/      → 联系人、互动、引荐
├── operations/   → 待办、目标、会议、指标
└── agents/       → 自动化脚本
```

### 身份模块（创作内容时必读）

生成任何内容前，**始终先读 `identity/voice.md`**。

- `voice.md`：语气、风格、词汇和表达模式。
- `brand.md`：定位、受众和内容支柱。
- `values.yaml`：核心信念和原则。
- `bio-variants.md`：针对不同平台的个人简介。
- `prompts/`：可重复使用的生成模板。

### 内容模块

流程为 `ideas.jsonl` → `drafts/` → `posts.jsonl`：

- 立即把创意记入 `ideas.jsonl`。
- 使用 `templates/` 在 `drafts/` 中继续完善。
- 发布后将内容和指标记入 `posts.jsonl`。
- 在 `calendar.md` 中规划发布时间。

### 人际网络模块

通过关系层级管理个人 CRM：

- `inner`：每周联系。
- `active`：每两周联系。
- `network`：每月联系。
- `dormant`：每季度检查是否重新联系。

### 日常运营模块

任务优先级分为：

- P0：今天完成，会阻塞其他工作。
- P1：本周完成，重要。
- P2：本月完成，有价值。
- P3：待办列表，有余力时处理。

## 实践指南

### 内容创作流程

```text
1. 读取 identity/voice.md（必需）。
2. 查看 identity/brand.md，确认主题是否匹配。
3. 查阅 content/posts.jsonl，参考效果较好的表达方式。
4. 使用 content/templates/ 中的模板组织内容。
5. 按表达风格起草。
6. 如果暂不发布，将内容记入 posts.jsonl 或 ideas.jsonl。
```

### 会前准备

```text
1. 在 network/contacts.jsonl 中查找联系人。
2. 从 network/interactions.jsonl 获取历史互动。
3. 在 operations/todos.md 中检查待办。
4. 生成包含关系背景的会前摘要。
```

### 周度回顾

```text
1. 运行 python agents/scripts/weekly_review.py。
2. 检查 operations/metrics.jsonl 中的指标。
3. 检查近期未联系的人：agents/scripts/stale_contacts.py。
4. 更新 operations/goals.yaml 中的目标进度。
5. 在 content/calendar.md 中规划下周安排。
```

## 示例

### 示例：撰写 X 帖子

**输入**：“帮我写一篇关于 AI 智能体的帖子。”

**流程**：读取 `identity/voice.md` 提取表达特点；查看 `identity/brand.md` 确认 `ai_agents` 属于内容支柱；查阅 `content/posts.jsonl` 寻找类似的成功帖子；起草符合表达风格的内容；若不立即发布，建议记入 `content/ideas.jsonl`。

**输出**：符合用户真实表达方式且适合对应平台的帖子草稿。

### 示例：查询联系人

**输入**：“帮我准备和 Sarah Chen 的通话。”

**流程**：在 `network/contacts.jsonl` 搜索联系人；读取 `network/interactions.jsonl` 中近期互动；检查 `operations/todos.md` 中与 Sarah 相关的待办；整理职位、背景、最近讨论内容和待跟进事项。

**输出**：包含关系背景的会前摘要。

## 指南

1. **先了解表达方式**：生成内容前总是读取 `identity/voice.md`。
2. **只追加记录**：不要删除 JSONL 记录，改为归档。
3. **更新时间戳**：修改跟踪数据时设置 `updated` 字段。
4. **交叉引用模块**：知识支持内容创作，人际网络支持日常运营。
5. **记录互动**：会面和通话后写入 `interactions.jsonl`。
6. **保留历史**：`posts.jsonl` 中的过去内容有助于改善后续表现。

## 集成

本技能应用以下上下文工程原则：

- `context-fundamentals`：渐进披露和注意力预算管理。
- `memory-systems`：使用 JSONL 保存持久记忆并结构化检索。
- `tool-design`：`agents/scripts/` 中的脚本遵循工具设计原则。
- `context-optimization`：通过模块隔离避免上下文膨胀。

## 参考资料

内部参考：

- [身份模块](./identity/IDENTITY.md)：表达风格和个人品牌。
- [内容模块](./content/CONTENT.md)：内容流程文档。
- [人际网络模块](./network/NETWORK.md)：联系人管理说明。
- [日常运营模块](./operations/OPERATIONS.md)：生产力系统。
- [智能体脚本](./agents/AGENTS.md)：自动化文档。

外部参考：

- [智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [Anthropic 上下文工程指南](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

## 技能元数据

创建时间：2024-12-29；最后更新：2024-12-29；作者：Murat Can Koylan；版本：1.0.0。
