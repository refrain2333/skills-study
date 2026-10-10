# 数字大脑

> 面向创始人、创作者和建设者的个人工作系统。此项目是[智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)中的完整示例。

## 概述

数字大脑是为 AI 辅助个人效率设计的结构化知识管理系统，以文件夹组织个人事务：

- **个人品牌**：表达方式、定位、价值观。
- **内容创作**：创意、草稿、发布流程。
- **知识库**：收藏、研究、学习。
- **人际网络**：联系人、关系和引荐。
- **日常运营**：目标、任务、会议和指标。

系统采用上下文工程原则：渐进披露、只追加数据和模块隔离，以适配智能体工作方式。

## 架构

```
digital-brain/
├── SKILL.md                 # 主技能说明，兼容 Claude Code
├── SKILLS-MAPPING.md        # 上下文工程技能在本示例中的应用
├── identity/                # 个人品牌与表达方式
│   ├── IDENTITY.md          # 模块说明
│   ├── voice.md             # 语气、风格、表达模式
│   ├── brand.md             # 定位与受众
│   ├── values.yaml          # 核心原则
│   ├── bio-variants.md      # 不同平台的个人简介
│   └── prompts/             # 内容生成模板
├── content/                 # 内容创作中心
│   ├── CONTENT.md           # 模块说明
│   ├── ideas.jsonl          # 内容创意，只追加
│   ├── posts.jsonl          # 已发布内容记录
│   ├── calendar.md          # 内容日历
│   ├── engagement.jsonl     # 灵感收藏
│   ├── drafts/              # 进行中的草稿
│   └── templates/           # 串文、简报和帖子模板
├── knowledge/               # 个人知识库
│   ├── KNOWLEDGE.md         # 模块说明
│   ├── bookmarks.jsonl      # 收藏的资料
│   ├── learning.yaml        # 技能和目标
│   ├── competitors.md       # 市场情况
│   ├── research/            # 深入研究笔记
│   └── notes/               # 快速记录
├── network/                 # 人际关系管理
│   ├── NETWORK.md           # 模块说明
│   ├── contacts.jsonl       # 联系人数据库
│   ├── interactions.jsonl   # 会面和沟通记录
│   ├── circles.yaml         # 关系层级
│   └── intros.md            # 引荐追踪
├── operations/              # 个人事务管理
│   ├── OPERATIONS.md        # 模块说明
│   ├── todos.md             # P0—P3 任务列表
│   ├── goals.yaml           # OKR 与目标
│   ├── meetings.jsonl       # 会议记录
│   ├── metrics.jsonl        # 关键指标
│   └── reviews/             # 周度回顾
├── agents/                  # 自动化
│   ├── AGENTS.md            # 脚本说明
│   └── scripts/             # 周度回顾、创意建议、联系人检查等脚本
├── references/              # 详细参考
│   └── file-formats.md
└── examples/                # 使用流程示例
    ├── content-workflow.md
    └── meeting-prep.md
```

## 技能集成

此示例展示以下上下文工程技能的应用：

| 技能 | 应用方式 |
| --- | --- |
| `context-fundamentals` | 渐进披露和注意力预算 |
| `memory-systems` | 只追加 JSONL 日志和结构化回忆 |
| `tool-design` | 自包含的自动化脚本 |
| `context-optimization` | 模块隔离和按需加载 |

详细设计映射见 [SKILLS-MAPPING.md](./SKILLS-MAPPING.md)。

## 安装

### 作为 Claude Code 技能

```bash
# 安装到当前用户
 git clone https://github.com/muratcankoylan/digital-brain-skill.git \
  ~/.claude/skills/digital-brain

# 或安装到指定项目
 git clone https://github.com/muratcankoylan/digital-brain-skill.git \
  .claude/skills/digital-brain
```

### 作为独立模板

```bash
git clone https://github.com/muratcankoylan/digital-brain-skill.git ~/digital-brain
cd ~/digital-brain
```

## 快速开始

1. **定义表达方式**：在 `identity/voice.md` 中填写语气和风格。
2. **明确定位**：在 `identity/brand.md` 中填写受众和内容支柱。
3. **添加联系人**：将重要关系写入 `network/contacts.jsonl`。
4. **设定目标**：在 `operations/goals.yaml` 中定义 OKR。
5. **开始创作**：请 AI “写一篇帖子”，观察它如何使用你的表达方式。

## 文件格式约定

| 格式 | 用途 | 原因 |
| --- | --- | --- |
| `.jsonl` | 只追加日志 | 便于智能体处理并保留历史 |
| `.yaml` | 结构化配置 | 层级清晰，便于人阅读 |
| `.md` | 叙述性内容 | 可编辑且格式丰富 |
| `.xml` | 复杂提示词 | 结构明确，便于智能体读取 |

## 使用示例

### 创作内容

```text
用户：“帮我写一条关于 AI 智能体的 X 串文”

智能体流程：
1. 读取 identity/voice.md，了解语气模式。
2. 检查 identity/brand.md，确认 ai_agents 是内容支柱。
3. 查阅 content/posts.jsonl，参考表现良好的内容格式。
4. 按表达风格起草串文。
```

### 准备会议

```text
用户：“帮我准备和 Sarah 的通话”

智能体流程：
1. 在 network/contacts.jsonl 中查找 Sarah。
2. 从 network/interactions.jsonl 读取沟通历史。
3. 在 operations/todos.md 中检查待办事项。
4. 生成会前摘要。
```

### 周度回顾

```text
用户：“进行本周回顾”

智能体流程：
1. 执行 agents/scripts/weekly_review.py。
2. 汇总 operations/metrics.jsonl 中的指标。
3. 执行 agents/scripts/stale_contacts.py。
4. 汇报摘要和待办行动。
```

## 自动化脚本

| 脚本 | 用途 | 运行频率 |
| --- | --- | --- |
| `weekly_review.py` | 根据数据生成周度回顾 | 每周 |
| `content_ideas.py` | 从知识库提出内容创意 | 按需 |
| `stale_contacts.py` | 查找近期未联系的人 | 每周 |
| `idea_to_draft.py` | 将创意扩展为草稿框架 | 按需 |

```bash
python agents/scripts/weekly_review.py
python agents/scripts/content_ideas.py --pillar ai_agents --count 5
```

## 设计原则

1. **渐进披露**：只加载当前任务需要的内容。
2. **只追加数据**：不删除记录，保留历史供后续分析。
3. **模块隔离**：各领域独立，避免无关上下文互相污染。
4. **先加载表达方式**：生成内容前总是先读取 `voice.md`。
5. **跨平台**：可用于 Claude Code、Cursor 和其他 AI 助手。

## 参与贡献

本示例属于[智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)。欢迎提交新的内容模板、自动化脚本、模块改进和文档完善。

## 许可证

MIT。可自由使用，建议保留署名。

作者：Muratcan Koylan
版本：1.0.0
最后更新：2025-12-29
