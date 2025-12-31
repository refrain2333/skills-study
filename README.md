# 智能体上下文工程技能集

> **⚠️ 学习用途复刻版本**
> 
> 本仓库为学习目的复刻自 [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
> 
> 原作者：Muratcan Koylan | 许可证：MIT
> 
> 仅用于个人学习和研究，不用于商业用途

一个全面、开放的智能体技能集合，专注于上下文工程原则，用于构建生产级 AI 智能体系统。这些技能传授通过精心策划上下文来最大化智能体效能的艺术和科学，适用于任何智能体平台。

## 什么是上下文工程？

上下文工程是管理语言模型上下文窗口的学科。与关注于制作有效指令的提示词工程不同，上下文工程处理进入模型有限注意力预算的所有信息的整体策划：系统提示词、工具定义、检索文档、消息历史和工具输出。

根本挑战是上下文窗口受到的限制不是原始token容量，而是注意力机制。随着上下文长度增加，模型表现出可预见的退化模式："迷失在中间"现象、U形注意力曲线和注意力稀缺。有效的上下文工程意味着找到最小的高信号token集合，最大化期望结果的可能性。

## 技能概览

### 基础技能

这些技能建立了所有后续上下文工程工作所需的基础理解。

| 技能 | 描述 |
|-------|-------------|
| [context-fundamentals](skills/context-fundamentals/) | 理解什么是上下文、为什么重要，以及智能体系统中上下文的剖析 |
| [context-degradation](skills/context-degradation/) | 识别上下文失败的模式：迷失在中间、中毒、分心和冲突 |
| [context-compression](skills/context-compression/) | 为长时间运行的会话设计和评估压缩策略 |

### 架构技能

这些技能涵盖构建有效智能体系统的模式和结构。

| 技能 | 描述 |
|-------|-------------|
| [multi-agent-patterns](skills/multi-agent-patterns/) | 掌握编排者、点对点和分层多智能体架构 |
| [memory-systems](skills/memory-systems/) | 设计短期、长期和基于图的内存架构 |
| [tool-design](skills/tool-design/) | 构建智能体可以有效使用的工具 |

### 运营技能

这些技能处理智能体系统的持续运营和优化。

| 技能 | 描述 |
|-------|-------------|
| [context-optimization](skills/context-optimization/) | 应用紧缩、屏蔽和缓存策略 |
| [evaluation](skills/evaluation/) | 构建智能体系统的评估框架 |
| [advanced-evaluation](skills/advanced-evaluation/) | 掌握 LLM 即评判器技术：直接评分、配对比较、评分标准生成和偏差缓解 |

### 开发方法论

这些技能涵盖构建 LLM 驱动项目的元级别实践。

| 技能 | 描述 |
|-------|-------------|
| [project-development](skills/project-development/) | 从理想到部署设计和构建 LLM 项目，包括任务-模型拟合分析、管道架构和结构化输出设计 |

## 设计理念

### 渐进式披露

每项技能的结构都考虑了有效的上下文使用。启动时，智能体仅加载技能名称和描述。只有在为相关任务激活技能时，完整内容才会加载。

### 平台无关性

这些技能专注于可转移原则而非特定供应商的实现。这些模式适用于 Claude Code、Cursor 和任何支持技能或允许自定义指令的智能体平台。

### 概念基础与实践示例

脚本和示例使用在任何环境中都能运行的 Python 伪代码演示概念，无需特定依赖安装。

## 学习路径

### 快速开始（1小时）

1. 阅读本 README 了解项目结构
2. 打开 `SKILL.md` 查看技能总览
3. 选择一个感兴趣的技能模块开始深入

### 系统学习（8-10小时）

1. **基础层**：学习三个基础技能
   - context-fundamentals
   - context-degradation
   - context-compression

2. **架构层**：学习三个架构技能
   - multi-agent-patterns
   - memory-systems
   - tool-design

3. **运营层**：学习三个运营技能
   - context-optimization
   - evaluation
   - advanced-evaluation

4. **项目层**：学习项目开发方法
   - project-development

### 实践应用

查看 `examples/` 文件夹中的完整项目示例：

| 示例 | 描述 | 关键技能 |
|---------|-------------|----------------|
| [llm-as-judge-skills](examples/llm-as-judge-skills/) | LLM 评估工具，TypeScript 实现 | 高级评估、工具设计 |
| [book-sft-pipeline](examples/book-sft-pipeline/) | 模型微调训练流程 | 项目开发、上下文压缩 |
| [x-to-book-system](examples/x-to-book-system/) | 多智能体内容生成系统 | 多智能体模式、内存系统 |

## 项目结构

```
skills-study/
├── README.md                    # 本文件
├── SKILL.md                     # 技能集总览
├── CONTRIBUTING.md              # 贡献指南
├── skills/                      # 技能模块
│   ├── context-fundamentals/
│   ├── context-degradation/
│   ├── context-compression/
│   ├── multi-agent-patterns/
│   ├── memory-systems/
│   ├── tool-design/
│   ├── context-optimization/
│   ├── evaluation/
│   ├── advanced-evaluation/
│   └── project-development/
├── examples/                    # 完整示例项目
│   ├── llm-as-judge-skills/
│   ├── book-sft-pipeline/
│   └── x-to-book-system/
├── Database/                    # 语义知识库（可选）
├── getting-started/             # 快速入门指南
└── template/                    # 技能模板
```

## 贡献

本学习项目欢迎改进建议。当提交改进时：

1. 遵循现有的技能结构和格式
2. 提供清晰的示例和说明
3. 保持每个 SKILL.md 在 500 行以下
4. 记录权衡和注意事项

## 许可证

MIT 许可证 - 详见 LICENSE 文件。

## 致谢

感谢原作者 [Muratcan Koylan](https://x.com/koylanai) 创建了这个优秀的框架。

- **原仓库**：[muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- **原作者**：Muratcan Koylan
- **许可证**：MIT

本仓库基于原作者的工作进行学习用复刻，所有内容遵循 MIT 许可证。
