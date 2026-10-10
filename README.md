# 智能体上下文工程技能集

> 本仓库是对[原项目](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)的中文学习副本。

按 MIT 许可证保留原作者署名。当前内容同步到上游提交 [58b55a8（2026-10-01）](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/commit/58b55a8921758d13453b440704fb1b5b208c0b0e)。

技能共 18 个。上游英文文件 skills/<技能名>/SKILL.md 是规范版本；同目录的 SKILL_zh.md 是便于阅读的中文译文。英文入口见 [README.en.md](README.en.md)。

这个项目收集了帮助智能体管理上下文、设计工具、组织多智能体协作和评估结果的技能，也包括自主智能体运行框架、记忆和长任务规划等主题。

## 什么是上下文工程？

上下文不只是提示词。它包括模型回答时能看到的系统指令、工具定义、检索到的资料、对话历史和工具结果。上下文工程关注如何挑选、组织并维护这些信息，让模型把注意力放在当前任务真正需要的内容上。

## 技能目录

### 基础与上下文管理

| 技能 | 说明 |
| --- | --- |
| [context-fundamentals](skills/context-fundamentals/SKILL_zh.md) | 认识上下文的组成部分，以及它们如何影响智能体。 |
| [context-degradation](skills/context-degradation/SKILL_zh.md) | 识别上下文变长后出现的信息遗漏、干扰和错误累积。 |
| [context-compression](skills/context-compression/SKILL_zh.md) | 在长对话中压缩历史，同时保留继续工作所需的决定和文件信息。 |
| [context-optimization](skills/context-optimization/SKILL_zh.md) | 使用压缩、遮蔽冗长输出、缓存和上下文分区来管理 token。 |
| [filesystem-context](skills/filesystem-context/SKILL_zh.md) | 把大段资料和工作状态放入文件，供智能体按需查找和更新。 |
| [self-managed-context](skills/self-managed-context/SKILL_zh.md) | 让模型通过可编辑文件管理当前上下文，同时保留程序必须遵守的边界。 |

### 智能体架构

| 技能 | 说明 |
| --- | --- |
| [multi-agent-patterns](skills/multi-agent-patterns/SKILL_zh.md) | 比较监督者、点对点和分层协作，设计任务拆分与交接。 |
| [memory-systems](skills/memory-systems/SKILL_zh.md) | 设计跨轮次记忆、实体关系和检索更新方式。 |
| [tool-design](skills/tool-design/SKILL_zh.md) | 设计清楚的工具参数、结果和错误信息。 |
| [hosted-agents](skills/hosted-agents/SKILL_zh.md) | 了解在隔离云端环境中运行的后台编程智能体。 |
| [latent-briefing](skills/latent-briefing/SKILL_zh.md) | 在运行环境支持时，研究怎样把协调者的相关状态压缩后交给工作智能体。 |
| [bdi-mental-states](skills/bdi-mental-states/SKILL_zh.md) | 用信念、愿望和意图表示智能体状态，支持可追溯的推理过程。 |
| [long-horizon-prompting](skills/long-horizon-prompting/SKILL_zh.md) | 为长时间运行的任务写清目标、停止条件、检查点和并行工作边界。 |

### 评估与运行框架

| 技能 | 说明 |
| --- | --- |
| [evaluation](skills/evaluation/SKILL_zh.md) | 为智能体建立可重复的检查、评分标准和质量门槛。 |
| [advanced-evaluation](skills/advanced-evaluation/SKILL_zh.md) | 学习直接评分、两两比较、评分标准生成和偏差控制。 |
| [harness-engineering](skills/harness-engineering/SKILL_zh.md) | 设计围绕智能体运行的循环、日志、指标、回退和人工审核边界。 |
| [self-improvement-loops](skills/self-improvement-loops/SKILL_zh.md) | 研究如何有约束地改进智能体运行框架本身。 |
| [project-development](skills/project-development/SKILL_zh.md) | 从任务适配分析、原型和分阶段流程开始规划 LLM 项目。 |

## 如何使用

先在上面的表格中选一个技能，再打开中文译文阅读。运行前请查看同目录的英文 SKILL.md，将整个技能文件夹安装到智能体所支持的技能目录。文件夹里的 references 和 scripts 可能是正文使用的资料或代码；只复制一份平铺的 Markdown 文件会丢失这些相对路径。

例如，将单个技能用于使用 Agent Skills 目录布局的项目：

~~~bash
mkdir -p .agents/skills
cp -R skills/context-fundamentals .agents/skills/
~~~

如果使用 Claude Code 插件，可在 Claude Code 中添加本仓库并安装插件：

~~~text
/plugin marketplace add refrain2333/skills-study
/plugin install context-engineering@context-engineering-marketplace
~~~

Cursor、Codex 和其他插件宿主支持的安装方式可能不同，请按对应工具的官方说明选择插件安装或项目级技能目录。插件清单只发布英文规范技能；中文文件用于阅读。

## 示例与配套资料

- examples/ 收录 LLM 评估、书籍微调、多智能体工作流、思考轨迹实验和长任务提示实验等示例。运行条件和依赖见各示例目录的 README。长任务 Prompt Lab 的 Pages 工作流需手动触发；这个仓库目前未启用 GitHub Pages。
- researcher/ 记录上游使用的技能评估、资料来源、机制注册、变更门槛和文件化研究流程。其中的榜单与量化结果来自带日期的报告，应结合对应报告理解。
- Database/ 是这个学习副本早期保留的语义检索数据库示例。它已从当前上游版本移除，目录中的依赖、云服务价格和设置说明属于旧材料，使用前需要按当前服务文档复核。

## 参与修改

新增或大幅修改技能时，需要一并维护根目录技能总览、插件清单、技能地图和对应的中文说明。详细结构及上游维护流程见[中文贡献说明](CONTRIBUTING.md)和[上游英文说明](CONTRIBUTING.en.md)。

## 致谢与许可

来源项目为 [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)，作者 Muratcan Koylan。上游声明采用 MIT 许可证，许可范围以仓库中的 [LICENSE](LICENSE) 为准。
