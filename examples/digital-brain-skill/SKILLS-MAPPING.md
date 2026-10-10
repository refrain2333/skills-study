# 技能映射：数字大脑

本文说明[智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)中的原则如何应用于数字大脑。

## 应用的上下文工程原则

### 1. 上下文基础

| 概念 | 来源技能 | 在数字大脑中的应用 |
| --- | --- | --- |
| **注意力预算** | context-fundamentals | 模块隔离，只加载相关内容。创作时加载约 200 行的 voice 文件；处理人际网络时加载联系人文件，不要一次加载全部内容。 |
| **渐进披露** | context-fundamentals | 三级架构：L1（SKILL.md 元数据）、L2（模块说明）、L3（数据文件）。每层仅在需要时加载。 |
| **高信号令牌** | context-fundamentals | JSONL 结构只保留必要字段；表达风格资料聚焦可区分的模式，而非详尽列举模型已掌握的通用写作规则。 |

**设计决策**：

> 找出最少量的高信号内容，以最大化期望结果出现的可能性。

因此，`voice.md` 重点记录标志性表达和应避免的模式，而不是 Claude 已经掌握的一般写作建议。

### 2. 记忆系统

| 概念 | 来源技能 | 在数字大脑中的应用 |
| --- | --- | --- |
| **只追加日志** | memory-systems | 所有 `.jsonl` 文件只追加。通过 `"status": "archived"` 修改状态，不删除记录，以保留完整历史。 |
| **结构化回忆** | memory-systems | 文件采用一致结构，便于匹配模式。`contact_id` 将 `contacts.jsonl` 与 `interactions.jsonl` 关联。 |
| **情景记忆** | memory-systems | `interactions.jsonl` 记录独立事件；`posts.jsonl` 记录内容和表现指标，便于回顾分析。 |
| **语义记忆** | memory-systems | `knowledge/bookmarks.jsonl` 使用类别和标签，支持按主题检索。 |

**设计决策**：

> 智能体维护持久记忆文件，以便在复杂连续任务中追踪进展。

`operations/metrics.jsonl` 通过累积每周快照体现这一原则，可分析趋势而无需从原始数据重新计算。

### 3. 工具设计

| 概念 | 来源技能 | 在数字大脑中的应用 |
| --- | --- | --- |
| **自包含工具** | tool-design | `agents/scripts/` 中的脚本都是独立 Python 文件，各自完成一项工作：`weekly_review.py` 生成回顾，`stale_contacts.py` 查找长期未联系的人。 |
| **输入输出清楚** | tool-design | 脚本读取已知路径，并向标准输出提供结构化文本；除非明确说明，否则不产生副作用。 |
| **节省令牌** | tool-design | 脚本处理数据后只返回摘要，智能体接收结果，不必了解原始数据处理细节。 |

**设计决策**：

> 工具应自包含、含义清楚，并帮助提高令牌使用效率。

`content_ideas.py` 会在内部分析收藏与历史帖子，只返回可执行建议，不倾倒原始分析内容。

### 4. 上下文优化

| 概念 | 来源技能 | 在数字大脑中的应用 |
| --- | --- | --- |
| **模块隔离** | context-optimization | 将系统分成 `identity/`、`content/`、`knowledge/`、`network/`、`operations/` 和 `agents/` 六个模块，避免内容互相污染。创作内容时无需加载人际网络数据。 |
| **按需加载** | context-optimization | 只有模块与当前任务相关时，才加载 `IDENTITY.md`、`CONTENT.md` 等模块说明。 |
| **引用深度** | context-optimization | 主 `SKILL.md` 链接到模块说明，再由模块说明链接数据文件；最多两步即可找到目标信息。 |

**设计决策**：

> 不要预先加载所有数据；保留轻量标识，并在运行时动态加载内容。

例如处理人际网络时，智能体先在 `contacts.jsonl` 中查找姓名，再只加载该联系人的 `interactions.jsonl` 记录。

### 5. 缓解上下文退化

| 风险 | 来源技能 | 数字大脑的缓解方式 |
| --- | --- | --- |
| **上下文腐化** | context-degradation | 模块隔离限制单次加载量；voice 文件少于 300 行；数据通过 JSONL 逐行读取。 |
| **上下文过时** | context-degradation | 联系人记录包含 `last_contact` 时间戳；`stale_contacts.py` 主动找出需要维护的关系。 |
| **指令冲突** | context-degradation | 每个领域只设一个事实来源：表达风格只维护在 `voice.md`，目标只维护在 `goals.yaml`，避免重复。 |

**设计决策**：

> 上下文越长，准确率和回忆能力的边际收益越低。

因此，`SKILL.md` 控制在 200 行内，模块说明文件控制在 100 行内，数据保存在外部文件而非内嵌到指令中。

## 架构决策

### 为什么日志使用 JSONL？

```text
优点：只追加；可流式读取，无需解析整个文件；首行可说明结构；可用标准 JSON 工具处理；支持快速搜索。
缺点：不适合人工大量编辑（配置改用 YAML/Markdown）；不支持事务（个人数据场景可以接受）。
```

### 为什么叙述内容使用 Markdown？

```text
优点：易读易改；支持表格、列表和代码等格式；Git 差异清晰；工具普遍支持。
适用内容：表达风格、品牌、日历、待办和模板。
```

### 为什么配置使用 YAML？

```text
优点：层级结构清楚；可读性好；支持注释；嵌套配置语法简洁。
适用内容：目标、价值观、关系层级和学习记录。
```

### 为什么提示词使用 XML？

```text
优点：结构明确；指令、上下文和输出可分别标记；支持变量占位符；便于验证。
适用内容：内容生成模板和复杂提示词。
```

## 工作流映射

### 内容创作

```text
用户：“写一篇关于公开建设过程的帖子”

技能流程：
1. context-fundamentals → 只加载身份模块。
2. memory-systems → 从 voice.md 读取表达模式。
3. context-optimization → 不加载 network/operations。
4. tool-design → 用内容模板作为结构化框架。

加载文件：
- SKILL.md（约 50 个令牌）：路由。
- identity/IDENTITY.md（约 80 个令牌）：模块说明。
- identity/voice.md（约 200 个令牌）：表达模式。
- identity/brand.md：扫描内容支柱并检查主题。

总计约 400 个令牌；若加载整个数字大脑则约需 5,000 个令牌。
```

### 人际关系管理

```text
用户：“帮我准备和 Alex 的电话”

技能流程：
1. context-fundamentals → 只加载人际网络模块。
2. memory-systems → 先查联系人，再查互动记录。
3. context-optimization → 按需加载指定联系人的内容。
4. tool-design → 使用结构化会前摘要格式。

加载文件：
- SKILL.md（约 50 个令牌）：路由。
- network/NETWORK.md（约 60 个令牌）：模块说明。
- network/contacts.jsonl：搜索 Alex。
- network/interactions.jsonl：按 contact_id 筛选历史。

只为相关上下文加载约 300 个令牌。
```

## 取舍与原因

| 决策 | 取舍 | 原因 |
| --- | --- | --- |
| 拆分模块 | 需要导航更多文件 | 防止上下文膨胀，支持定向加载 |
| 数据使用 JSONL | 不如表格直观 | 适合智能体解析和只追加操作 |
| 不使用数据库 | 没有查询语言 | 结构简单、离线可用、无额外依赖 |
| 使用 Python 脚本 | 需要 Python 运行环境 | 通用、可读、容易扩展 |
| 使用占位符而非填充示例 | 用户需自行填写 | 避免生成空泛内容，促使个性化 |

## 验证清单

扩展数字大脑时，检查：

- [ ] 新文件遵循 JSONL、YAML、Markdown 或 XML 格式约定。
- [ ] 模块说明文件少于 100 行。
- [ ] JSONL 文件首行包含结构说明。
- [ ] 跨模块引用保持精简。
- [ ] 脚本自包含，输入输出清楚。
- [ ] 没有重复的事实来源。

## 相关技能

| 技能 | 主要应用 |
| --- | --- |
| `context-fundamentals` | 总体架构和渐进披露 |
| `context-degradation` | 缓解策略和文件大小限制 |
| `context-optimization` | 模块隔离和按需加载 |
| `memory-systems` | JSONL 设计和只追加模式 |
| `tool-design` | 智能体脚本及输入输出模式 |
| `multi-agent-patterns` | 后续可用于委派给专用子智能体 |

*本文展示了如何把上下文工程理论原则应用到实际系统设计中。*
