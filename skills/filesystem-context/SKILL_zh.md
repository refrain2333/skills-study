---
name: filesystem-context
description: "This skill should be used when agent work needs file-backed context: durable scratchpads, tool-output offloading, just-in-time discovery, cross-agent handoff files, filesystem memory, or cleanup policies for context stored outside the prompt."
---

> 本文件是同目录下 `SKILL.md` 的中文译文；正式安装和调用的规范文件仍为 `SKILL.md`。

# 基于文件系统的上下文工程

将文件系统作为智能体上下文的主要溢出层，因为上下文窗口有限，而任务所需的信息往往多到无法放进一个窗口。智能体可以通过统一的接口，借助文件存储、检索和更新几乎无限量的上下文。

优先采用动态发现上下文的方式——按需提取相关内容，而不是静态纳入，因为静态内容无论是否相关都会消耗 token，并挤占留给当前任务的信息空间。

## 何时启用

遇到以下情况时启用本技能：
- 工具输出正在使上下文窗口变得臃肿。
- 智能体需要在较长的执行过程中保留状态。
- 子智能体需要在不直接互发消息的情况下共享信息。
- 任务所需的上下文超过单个窗口的容量。
- 正在构建能够学习并更新自身指令的智能体。
- 正在实现中间结果用的草稿区。
- 终端输出或日志需要能够被智能体访问。

以下相邻工作由其他技能负责，不要为此启用本技能：
- 语义跨会话记忆、实体追踪或时间知识图谱：`memory-systems`。
- 对话摘要、压缩或持久交接内容：`context-compression`。
- 不需要基于文件的存储时所采用的 token 效率技巧：`context-optimization`。
- 多智能体拓扑或交接协议设计：`multi-agent-patterns`。
- 模型直接编辑并从实时窗口中移除内容：`self-managed-context`。

## 核心概念

根据以下四种模式诊断上下文失效，因为每种模式都需要不同的文件系统补救方法：

1. **上下文缺失**——可用上下文中没有必要的信息。应将工具输出和中间结果持久化到文件中，确保不丢信息。
2. **上下文检索不足**——检索到的内容无法涵盖智能体需要的信息。应把文件组织成便于精准检索的形式（支持 grep 的格式、清晰的章节标题）。
3. **上下文检索过多**——检索到的内容远超实际需要，浪费 token 并削弱注意力。应将大量内容卸载到文件中，只返回简短引用。
4. **上下文埋藏过深**——细节信息散落在许多文件中。应结合 glob 和 grep 进行结构搜索，并使用语义搜索查找概念性内容。

使用文件系统作为持久层来处理以上四种情况：写入一次、持久存储、按需选择性检索。

## 详细主题

### 静态上下文与动态上下文的权衡

应把静态上下文（系统指令、工具定义、关键规则）视为昂贵的空间：每一轮都会消耗 token，无论是否相关。随着智能体能力增加，静态上下文会变得更大，并挤占动态信息。

改用动态上下文发现：静态上下文中只保留最精简的指针（名称、一句话描述、文件路径），需要时使用搜索工具加载完整内容。这样更节省 token，而且通常能通过减少上下文中的矛盾或无关信息来提升回答质量。

应接受这种权衡：动态发现要求模型意识到何时需要更多上下文。当前前沿模型能够很好地做到这一点，但能力较弱的模型可能不会触发加载。拿不准时，应优先在静态上下文中包含关键的安全或正确性约束。

### 模式 1：将文件系统用作草稿区

把大型工具输出重定向到文件，而不是直接返回到上下文中。一次网页搜索或数据库查询就可能输出数千 token；这些内容进入消息历史后，会在整个对话过程中一直占用空间。

先把输出写入草稿文件，提取一份简短摘要，再返回文件引用。随后智能体可以定向检索（用 grep 搜索模式、通过行范围读取），只加载需要的内容。

```python
def handle_tool_output(output: str, threshold: int = 2000) -> str:
    if len(output) < threshold:
        return output

    file_path = f"scratch/{tool_name}_{timestamp}.txt"
    write_file(file_path, output)

    key_summary = extract_summary(output, max_tokens=200)
    return f"[Output written to {file_path}. Summary: {key_summary}]"
```

使用 grep 搜索已卸载到文件中的内容，并使用带行范围的 `read_file` 提取目标章节。这样既保留了完整输出供之后查阅，又只需在活动上下文中保留约 100 个 token。

### 模式 2：持久保存计划

把计划写入文件，因为长周期任务中的计划一旦失去关注或被摘要掉，就容易偏离原目标。智能体可以随时重新读取计划，恢复对目标和进展的认识。

以结构化格式保存计划，让它既便于人阅读，也便于机器解析：
```yaml
# scratch/current_plan.yaml
objective: "Refactor authentication module"
status: in_progress
steps:
  - id: 1
    description: "Audit current auth endpoints"
    status: completed
  - id: 2
    description: "Design new token validation flow"
    status: in_progress
  - id: 3
    description: "Implement and test changes"
    status: pending
```

每轮开始时或每次上下文刷新后，都重新读取计划以重新校准方向，因为这相当于“通过复述来操控注意力”。

### 模式 3：通过文件系统在子智能体间通信

通过文件系统传递子智能体的发现结果，而不是依赖消息传递，因为多跳消息链会在每次摘要中逐渐损失信息（类似“传话游戏”）。

让每个子智能体直接写入自己的工作区目录。协调者直接读取这些文件，以保留完整信息：
```
workspace/
  agents/
    research_agent/
      findings.md
      sources.jsonl
    code_agent/
      changes.md
      test_results.txt
  coordinator/
    synthesis.md
```

为每个智能体设置独立的目录，避免写入冲突，并明确每份输出产物的负责人。

### 模式 4：动态加载技能

将技能存为文件，静态上下文中只放技能名称和简短描述，因为把所有指令都塞进系统提示词会浪费 token，还可能让模型面对相互矛盾的指导。

```
Available skills (load with read_file when relevant):
- database-optimization: Query tuning and indexing strategies
- api-design: REST/GraphQL best practices
- testing-strategies: Unit, integration, and e2e testing patterns
```

只有当前任务需要某项技能时，才加载完整技能文件（例如 `skills/database-optimization/SKILL.md`）。这样可将静态 token 成本从 O(n) 降到每个任务 O(1)。

### 模式 5：持久化终端输出和日志

自动将终端输出持久化到文件，并通过 grep 定向检索。长时间运行的进程会快速累积大量终端输出，手动复制粘贴也容易出错。

```
terminals/
  1.txt    # Terminal session 1 output
  2.txt    # Terminal session 2 output
```

使用定向 grep（例如 `grep -A 5 "error" terminals/1.txt`）查询内容，而不要把整个终端历史都加载进上下文。

### 模式 6：通过自我修改进行学习

让智能体把学到的偏好和模式写入自身的指令文件，使后续会话能够自动加载这些上下文，而不必手动更新系统提示词。

```python
def remember_preference(key: str, value: str):
    preferences_file = "agent/user_preferences.yaml"
    prefs = load_yaml(preferences_file)
    prefs[key] = value
    write_yaml(preferences_file, prefs)
```

这种模式需要配套验证机制，因为自我修改可能会积累错误或相互矛盾的指令。应将它视为实验性做法，并定期审查持久化的偏好。

### 文件系统搜索技巧

将 `ls`/`list_dir`、`glob`、`grep` 和带行范围的 `read_file` 结合起来发现上下文。模型经过专门训练，熟悉文件系统遍历；对于结构清晰的技术内容，这种组合往往比语义搜索更有效。

- `ls` / `list_dir`：查看目录结构
- `glob`：查找符合模式的文件（例如 `**/*.py`）
- `grep`：搜索文件内容，并返回匹配行及其上下文
- 带范围的 `read_file`：读取特定章节，避免加载整个文件

结构搜索和精确匹配查询应使用文件系统搜索；概念性问题则使用语义搜索。结合两者，才能全面发现相关内容。

## 实践指南

### 何时使用文件系统上下文

只有当 token 节省或持久化需求值得承担 I/O 开销时，才应用基于文件的模式：

**适用情况：**
- 工具输出超过约 2,000 token。
- 任务跨越多轮对话。
- 多个智能体需要共享状态。
- 技能或指令超过系统提示词的舒适容量。
- 需要定向查询日志或终端输出。

**不适用情况：**
- 任务在一轮内完成（额外开销不值得）。
- 上下文可以轻松容纳全部内容（没有需要解决的问题）。
- 延迟要求严格（文件 I/O 会增加可测量的延迟）。
- 模型无法使用文件系统工具。

### 文件组织

按便于智能体发现的方式组织文件，因为智能体通常通过列出目录并读取文件名来导航：
```
project/
  scratch/           # Temporary working files
    tool_outputs/    # Large tool results
    plans/           # Active plans and checklists
  memory/            # Persistent learned information
    preferences.yaml # User preferences
    patterns.md      # Learned patterns
  skills/            # Loadable skill definitions
  agents/            # Sub-agent workspaces
```

使用一致的命名约定；草稿文件中加入时间戳或 ID，以便区分。

对于自主研究循环，将原始检索证据保存在使用该证据的运行目录下，例如 `researcher/runs/<run-id>/sources/evidence/raw/`。不要把原始研究数据堆在仓库根目录；根目录产物难以审计，也容易在缺少来源记录时被引用。

### Token 核算

应用文件系统模式前后都应衡量 token 的来源，因为不经测量的优化会白费功夫：
- 追踪静态上下文与动态上下文的比例。
- 监控卸载前后的工具输出大小。
- 衡量动态加载的上下文被实际使用的频率。

## 示例

**示例 1：将工具输出卸载到文件**
```
Input: Web search returns 8000 tokens
Before: 8000 tokens added to message history
After:
  - Write to scratch/search_results_001.txt
  - Return: "[Results in scratch/search_results_001.txt. Key finding: API rate limit is 1000 req/min]"
  - Agent greps file when needing specific details
Result: ~100 tokens in context, 8000 tokens accessible on demand
```

**示例 2：动态加载技能**
```
Input: User asks about database indexing
Static context: "database-optimization: Query tuning and indexing"
Agent action: read_file("skills/database-optimization/SKILL.md")
Result: Full skill loaded only when relevant
```

**示例 3：用文件引用保存聊天历史**
```
Trigger: Context window limit reached, summarization required
Action:
  1. Write full history to history/session_001.txt
  2. Generate summary for new context window
  3. Include reference: "Full history in history/session_001.txt"
Result: Agent can search history file to recover details lost in summarization
```

## 指南

1. 将大型输出写入文件，在上下文中只返回摘要和引用。
2. 将计划和状态保存在结构化文件中，方便重新读取。
3. 使用子智能体的文件工作区，代替多跳消息链。
4. 动态加载技能，不要把所有技能都塞进系统提示词。
5. 将终端输出和日志持久化为可搜索的文件。
6. 结合 grep/glob 与语义搜索，全面查找相关信息。
7. 用清晰的命名组织文件，方便智能体发现。
8. 衡量 token 节省量，验证文件系统模式确实有效。
9. 清理草稿文件，防止其无限增长。
10. 为自我修改模式添加验证。
11. 将原始证据保存在使用它的运行、评估和提案旁边。

## 易错点

1. **草稿目录不断增长**：智能体创建临时文件却不清理，最终会占满磁盘，让目录列表变得杂乱。应设置保留策略（按时间或数量），并在每次会话结束时清理。
2. **多智能体同时访问文件会产生竞态条件**：并发写入同一文件，可能在没有明显提示的情况下破坏状态。应为每个智能体设置独立目录，或使用带智能体标识的只追加文件。
3. **移动或重命名后文件引用过时**：重构或重新组织文件后，智能体可能仍保留之前轮次的路径。每次读取缓存路径前都应验证文件是否存在；验证失败时用 glob 重新发现文件。
4. **glob 模式会误匹配**：模式过于宽泛（例如 `**/*`）会把无关文件加载到上下文中，浪费 token 并混淆模型。应把 glob 范围限定到具体目录和扩展名。
5. **文件大小估算错误**：不检查大小就读取文件，可能一次性把 10 万以上 token 倒进上下文。读取前先检查文件大小；大型文件使用按行范围读取。
6. **没有检查文件是否存在**：智能体可能误以为前几轮见过的文件仍然存在，但文件可能已经被删除或移动。读取前始终检查文件是否存在，并妥善处理文件缺失错误。
7. **草稿区格式逐渐漂移**：多次追加后，未结构化的草稿可能变得无法解析，因为格式约定会逐渐失效。应从第一次写入起就定义并执行 schema（YAML、JSON 或结构化 Markdown）。
8. **硬编码绝对路径**：在不同检出目录或容器中运行时，绝对路径就会失效。应使用相对于项目根目录的路径，或动态解析路径。

## 集成

本技能负责基于文件的上下文存储和检索。相邻技能负责语义记忆、摘要和拓扑设计：

- `context-optimization`：当完整输出仍可检索时，文件卸载是实现观察屏蔽的一种方式。
- `memory-systems`：文件笔记已不足以满足需求，需要语义、实体或时间维度的检索时使用。
- `multi-agent-patterns`：子智能体的文件工作区有助于隔离上下文并直接交接结果。
- `context-compression`：文件引用可以锚定摘要，并保留摘要中省略的细节。
- `tool-design`：对于大型输出，工具应返回文件引用，并提供安全的读取和搜索操作。
- `self-managed-context`：文件卸载不会从实时上下文中移除原始内容；要移除内容，需要模型编辑自己的上下文。

## 参考资料

内部参考资料：
- [Implementation Patterns](./references/implementation-patterns.md) - 阅读时机：实现草稿区、计划持久化或工具输出卸载，需要正文内示例之外的具体代码时

本系列的相关技能：
- context-optimization - 阅读时机：在文件卸载的同时应用 token 缩减技术
- memory-systems - 阅读时机：构建生命周期超出单次会话的持久存储
- multi-agent-patterns - 阅读时机：设计使用共享文件工作区的智能体协作方式

外部资源：
- LangChain Deep Agents - 阅读时机：在 LangChain/LangGraph 流水线中实现基于文件系统的上下文模式
- Cursor context discovery - 阅读时机：研究生产级 IDE 如何实现动态上下文加载
- Anthropic Agent Skills 规范 - 阅读时机：构建利用文件实现渐进式披露的技能

---

## 技能元数据

**创建时间**：2026-01-07
**最后更新**：2026-05-15
**作者**：Agent Skills for Context Engineering Contributors
**版本**：1.2.0
