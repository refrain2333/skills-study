---
name: multi-agent-patterns
description: Design multi-agent architectures for complex tasks. Use when single-agent context limits are exceeded, when tasks decompose naturally into subtasks, or when specializing agents improves quality.
---

# Multi-Agent Architecture Patterns

Multi-agent architectures distribute work across multiple language model instances, each with its own context window. When designed well, this distribution enables capabilities beyond single-agent limits. When designed poorly, it introduces coordination overhead that negates benefits. The critical insight is that sub-agents exist primarily to isolate context, not to anthropomorphize role division.

## When to Activate

Activate this skill when:
- Single-agent context limits constrain task complexity
- Tasks decompose naturally into parallel subtasks
- Different subtasks require different tool sets or system prompts
- Building systems that must handle multiple domains simultaneously
- Scaling agent capabilities beyond single-context limits
- Designing production agent systems with multiple specialized components

## Core Concepts

Multi-agent systems address single-agent context limitations through distribution. Three dominant patterns exist: supervisor/orchestrator for centralized control, peer-to-peer/swarm for flexible handoffs, and hierarchical for layered abstraction. The critical design principle is context isolation—sub-agents exist primarily to partition context rather than to simulate organizational roles.

Effective multi-agent systems require explicit coordination protocols, consensus mechanisms that avoid sycophancy, and careful attention to failure modes including bottlenecks, divergence, and error propagation.

## Detailed Topics

### Why Multi-Agent Architectures

**The Context Bottleneck**
Single agents face inherent ceilings in reasoning capability, context management, and tool coordination. As tasks grow more complex, context windows fill with accumulated history, retrieved documents, and tool outputs. Performance degrades according to predictable patterns: the lost-in-middle effect, attention scarcity, and context poisoning.

Multi-agent architectures address these limitations by partitioning work across multiple context windows. Each agent operates in a clean context focused on its subtask. Results aggregate at a coordination layer without any single context bearing the full burden.

**The Token Economics Reality**
Multi-agent systems consume significantly more tokens than single-agent approaches. Production data shows:

| Architecture | Token Multiplier | Use Case |
|--------------|------------------|----------|
| Single agent chat | 1× baseline | Simple queries |
| Single agent with tools | ~4× baseline | Tool-using tasks |
| Multi-agent system | ~15× baseline | Complex research/coordination |

Research on the BrowseComp evaluation found that three factors explain 95% of performance variance: token usage (80% of variance), number of tool calls, and model choice. This validates the multi-agent approach of distributing work across agents with separate context windows to add capacity for parallel reasoning.

Critically, upgrading to better models often provides larger performance gains than doubling token budgets. Claude Sonnet 4.5 showed larger gains than doubling tokens on earlier Sonnet versions. GPT-5.2's thinking mode similarly outperforms raw token increases. This suggests model selection and multi-agent architecture are complementary strategies.

**The Parallelization Argument**
Many tasks contain parallelizable subtasks that a single agent must execute sequentially. A research task might require searching multiple independent sources, analyzing different documents, or comparing competing approaches. A single agent processes these sequentially, accumulating context with each step.

Multi-agent architectures assign each subtask to a dedicated agent with a fresh context. All agents work simultaneously, then return results to a coordinator. The total real-world time approaches the duration of the longest subtask rather than the sum of all subtasks.

**The Specialization Argument**
Different tasks benefit from different agent configurations: different system prompts, different tool sets, different context structures. A general-purpose agent must carry all possible configurations in context. Specialized agents carry only what they need.

Multi-agent architectures enable specialization without combinatorial explosion. The coordinator routes to specialized agents; each agent operates with lean context optimized for its domain.

### Architectural Patterns

**Pattern 1: Supervisor/Orchestrator（监督者/编排者模式）**

The supervisor pattern places a central agent in control, delegating to specialists and synthesizing results. The supervisor maintains global state and trajectory, decomposes user objectives into subtasks, and routes to appropriate workers.

```
User Query -> Supervisor -> [Specialist, Specialist, Specialist] -> Aggregation -> Final Output
```

**易懂类比：项目经理模式**

想象生成一份"手机市场分析报告"：

```
【监督者/编排者】(项目经理角色)
"我来分配任务"
- 任务1：你去收集苹果数据
- 任务2：你去收集三星数据  
- 任务3：你去收集华为数据

【数据收集智能体A】(只专注苹果)
上下文：只有苹果相关知识
"我收集苹果的价格、销量、特点..."
→ 回报结果给监督者

【数据收集智能体B】(只专注三星)
上下文：只有三星相关知识
"我收集三星的价格、销量、特点..."
→ 回报结果给监督者

【数据收集智能体C】(只专注华为)
上下文：只有华为相关知识
"我收集华为的价格、销量、特点..."
→ 回报结果给监督者

【监督者】收到三个回报
"好的，现在我有所有数据了，整理成最终报告"
→ 输出完整报告
```

When to use: Complex tasks with clear decomposition, tasks requiring coordination across domains, tasks where human oversight is important.

Advantages: Strict control over workflow, easier to implement human-in-the-loop interventions, ensures adherence to predefined plans.

Disadvantages: Supervisor context becomes bottleneck, supervisor failures cascade to all workers, "telephone game" problem where supervisors paraphrase sub-agent responses incorrectly.

**The Telephone Game Problem and Solution**
LangGraph benchmarks found supervisor architectures initially performed 50% worse than optimized versions due to the "telephone game" problem where supervisors paraphrase sub-agent responses incorrectly, losing fidelity.

The fix: implement a `forward_message` tool allowing sub-agents to pass responses directly to users:

```python
def forward_message(message: str, to_user: bool = True):
    """
    Forward sub-agent response directly to user without supervisor synthesis.
    
    Use when:
    - Sub-agent response is final and complete
    - Supervisor synthesis would lose important details
    - Response format must be preserved exactly
    """
    if to_user:
        return {"type": "direct_response", "content": message}
    return {"type": "supervisor_input", "content": message}
```

With this pattern, swarm architectures slightly outperform supervisors because sub-agents respond directly to users, eliminating translation errors.

Implementation note: Implement direct pass-through mechanisms allowing sub-agents to pass responses directly to users rather than through supervisor synthesis when appropriate.

**Pattern 2: Peer-to-Peer/Swarm（点对点/群体模式）**

The peer-to-peer pattern removes central control, allowing agents to communicate directly based on predefined protocols. Any agent can transfer control to any other through explicit handoff mechanisms.

```python
def transfer_to_agent_b():
    return agent_b  # Handoff via function return

agent_a = Agent(
    name="Agent A",
    functions=[transfer_to_agent_b]
)
```

**易懂类比：传球模式**

想象生成同一份"手机市场分析报告"，但没有项目经理：

```
【智能体A - 搜索专家】(没有人告诉我做什么)
上下文：搜索工具、网络资源
"我从网上搜索手机市场信息..."
找到了一堆原始数据
"嘿，数据太杂乱了，我需要专业分析师"
→ 自动转向B (自己决定传给谁)

【智能体B - 数据分析专家】(接手A的工作)
收到A的原始数据
上下文：分析工具、统计知识
"我来分析哪个品牌性价比最好..."
分析完发现需要行业背景知识
"等等，我需要了解行业趋势，转给C吧"
→ 自动转向C

【智能体C - 行业专家】(接手B的工作)
收到B的分析结果
上下文：行业知识、趋势数据
"配合我的行业背景，我来生成最终报告"
输出完整报告
→ 直接返回给用户 (不需要经过B或A)
```

When to use: Tasks requiring flexible exploration, tasks where rigid planning is counterproductive, tasks with emergent requirements that defy upfront decomposition.

Advantages: No single point of failure, scales effectively for breadth-first exploration, enables emergent problem-solving behaviors.

Disadvantages: Coordination complexity increases with agent count, risk of divergence without central state keeper, requires robust convergence constraints.

Implementation note: Define explicit handoff protocols with state passing. Ensure agents can communicate their context needs to receiving agents.

**Pattern 3: Hierarchical（分层架构）**

Hierarchical structures organize agents into layers of abstraction: strategic, planning, and execution layers. Strategy layer agents define goals and constraints; planning layer agents break goals into actionable plans; execution layer agents perform atomic tasks.

```
Strategy Layer (Goal Definition) -> Planning Layer (Task Decomposition) -> Execution Layer (Atomic Tasks)
```

**易懂类比：公司组织结构**

想象生成同一份"手机市场分析报告"，用公司结构：

```
【第1层 - 战略智能体】(CEO角色，最高层)
"生成手机市场分析报告，重点关注性价比，面向消费者"
目标明确，但不关心怎么实现
↓ 把目标传给下一层

【第2层 - 规划智能体】(经理角色，中间层)
收到战略目标，详细规划：
"要完成这个目标，需要：
1. 收集价格、性能、口碑数据
2. 用这些数据做对比分析
3. 生成总结和建议"
知道怎么实现，但不自己去做
↓ 把计划分解给执行层

【第3层 - 执行智能体们】(员工们，底层)
执行员A：
"我的任务：收集价格数据" → 完成 ✓

执行员B：
"我的任务：收集性能数据" → 完成 ✓

执行员C：
"我的任务：收集口碑数据" → 完成 ✓

执行员D：
"我的任务：做对比分析" → 生成报告 ✓

【规划智能体】收集所有执行结果，汇总给战略智能体
【战略智能体】确认结果满足目标要求
→ 输出最终报告
```

When to use: Large-scale projects with clear hierarchical structure, enterprise workflows with management layers, tasks requiring both high-level planning and detailed execution.

Advantages: Mirrors organizational structures, clear separation of concerns, enables different context structures at different levels.

Disadvantages: Coordination overhead between layers, potential for misalignment between strategy and execution, complex error propagation.

### 三种模式快速对比

| 对比维度 | 监督者/编排者 | 点对点/群体 | 分层 |
|---------|-----------|----------|------|
| **控制方式** | 中央控制 | 分散控制 | 按层级 |
| **流程特点** | 固定且可预测 | 灵活且动态 | 分阶段递进 |
| **信息传递** | 都经过监督者 | 智能体间直接传递 | 从上向下逐层传递 |
| **最适应场景** | 任务分工明确 | 任务需要灵活探索 | 任务有战略→规划→执行 |
| **类比** | 项目经理分配任务 | 传球比赛，自动接力 | 公司组织结构 |
| **优点** | ✅ 控制严格 | ✅ 灵活高效 | ✅ 清晰有序 |
| | ✅ 易实施人工干预 | ✅ 无单点故障 | ✅ 职责清晰 |
| | ✅ 遵循计划 | ✅ 适合探索 | ✅ 易于扩展 |
| **缺点** | ❌ 监督者成为瓶颈 | ❌ 协调复杂度高 | ❌ 层间通信开销 |
| | ❌ 单点故障影响全局 | ❌ 容易偏离目标 | ❌ 可能信息失真 |
| | ❌ 电话游戏问题 | ❌ 需要汇聚约束 | ❌ 错误传递复杂 |
| **何时选择** | 明确的分工 | 任务边界不清 | 大型项目 |
| | 需要审核 | 多轮迭代 | 有层级管理 |
| | 小规模 | 中等规模 | 大规模 |

### Context Isolation as Design Principle

The primary purpose of multi-agent architectures is context isolation. Each sub-agent operates in a clean context window focused on its subtask without carrying accumulated context from other subtasks.

**Isolation Mechanisms**
Full context delegation: For complex tasks where the sub-agent needs complete understanding, the planner shares its entire context. The sub-agent has its own tools and instructions but receives full context for its decisions.

Instruction passing: For simple, well-defined subtasks, the planner creates instructions via function call. The sub-agent receives only the instructions needed for its specific task.

File system memory: For complex tasks requiring shared state, agents read and write to persistent storage. The file system serves as the coordination mechanism, avoiding context bloat from shared state passing.

**Isolation Trade-offs**
Full context delegation provides maximum capability but defeats the purpose of sub-agents. Instruction passing maintains isolation but limits sub-agent flexibility. File system memory enables shared state without context passing but introduces latency and consistency challenges.

The right choice depends on task complexity, coordination needs, and acceptable latency.

### Consensus and Coordination

**The Voting Problem**
Simple majority voting treats hallucinations from weak models as equal to reasoning from strong models. Without intervention, multi-agent discussions devolve into consensus on false premises due to inherent bias toward agreement.

**Weighted Voting**
Weight agent votes by confidence or expertise. Agents with higher confidence or domain expertise carry more weight in final decisions.

**Debate Protocols**
Debate protocols require agents to critique each other's outputs over multiple rounds. Adversarial critique often yields higher accuracy on complex reasoning than collaborative consensus.

**Trigger-Based Intervention**
Monitor multi-agent interactions for specific behavioral markers. Stall triggers activate when discussions make no progress. Sycophancy triggers detect when agents mimic each other's answers without unique reasoning.

### Framework Considerations

Different frameworks implement these patterns with different philosophies. LangGraph uses graph-based state machines with explicit nodes and edges. AutoGen uses conversational/event-driven patterns with GroupChat. CrewAI uses role-based process flows with hierarchical crew structures.

## Practical Guidance

### Failure Modes and Mitigations

**Failure: Supervisor Bottleneck**
The supervisor accumulates context from all workers, becoming susceptible to saturation and degradation.

Mitigation: Implement output schema constraints so workers return only distilled summaries. Use checkpointing to persist supervisor state without carrying full history.

**Failure: Coordination Overhead**
Agent communication consumes tokens and introduces latency. Complex coordination can negate parallelization benefits.

Mitigation: Minimize communication through clear handoff protocols. Batch results where possible. Use asynchronous communication patterns.

**Failure: Divergence**
Agents pursuing different goals without central coordination can drift from intended objectives.

Mitigation: Define clear objective boundaries for each agent. Implement convergence checks that verify progress toward shared goals. Use time-to-live limits on agent execution.

**Failure: Error Propagation**
Errors in one agent's output propagate to downstream agents that consume that output.

Mitigation: Validate agent outputs before passing to consumers. Implement retry logic with circuit breakers. Use idempotent operations where possible.

## Examples

**Example 1: Research Team Architecture**
```text
Supervisor
├── Researcher (web search, document retrieval)
├── Analyzer (data analysis, statistics)
├── Fact-checker (verification, validation)
└── Writer (report generation, formatting)
```

**Example 2: Handoff Protocol**
```python
def handle_customer_request(request):
    if request.type == "billing":
        return transfer_to(billing_agent)
    elif request.type == "technical":
        return transfer_to(technical_agent)
    elif request.type == "sales":
        return transfer_to(sales_agent)
    else:
        return handle_general(request)
```

## Guidelines

1. Design for context isolation as the primary benefit of multi-agent systems
2. Choose architecture pattern based on coordination needs, not organizational metaphor
3. Implement explicit handoff protocols with state passing
4. Use weighted voting or debate protocols for consensus
5. Monitor for supervisor bottlenecks and implement checkpointing
6. Validate outputs before passing between agents
7. Set time-to-live limits to prevent infinite loops
8. Test failure scenarios explicitly

## 核心洞察：为什么选择多智能体？

很多人误认为多智能体是为了"分角色"或"模拟组织"。**这是错的。**

多智能体的真实目的是：**隔离上下文，获得更多推理能力**

### ❌ 错误理解
```
"让智能体A扮演研究员，智能体B扮演分析师，智能体C扮演撰写员"

问题：这只是换了个说法，实际上：
- 智能体A仍然需要知道B和C的信息
- 上下文仍然很大
- 收益有限
```

### ✅ 正确理解
```
"给智能体A一个小上下文（搜索+收集信息）"
"给智能体B一个小上下文（分析工具+分析方法）"
"给智能体C一个小上下文（写作工具+格式规范）"

收益：
- 每个智能体的上下文都很清晰
- 推理质量更高（不被噪音干扰）
- 可以并行处理（3倍更快）
- 单个智能体失败不影响其他的
```

### 数字对比
```
单个智能体处理完整任务：
- 上下文大小：100K tokens
- 准确率：60%
- 处理时间：30秒

3个隔离上下文的智能体：
- 每个上下文：20K tokens（清晰专注）
- 准确率：85%（信噪比更高）
- 总时间：30秒（并行处理）
- Token成本：60K（高效使用）
```

**结论：多智能体的价值不在于"分工"，而在于"用小而专注的上下文做深层推理"。**

## Integration

This skill builds on context-fundamentals and context-degradation. It connects to:

- memory-systems - Shared state management across agents
- tool-design - Tool specialization per agent
- context-optimization - Context partitioning strategies

## References

Internal reference:
- [Frameworks Reference](./references/frameworks.md) - Detailed framework implementation patterns

Related skills in this collection:
- context-fundamentals - Context basics
- memory-systems - Cross-agent memory
- context-optimization - Partitioning strategies

External resources:
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/) - Multi-agent patterns and state management
- [AutoGen Framework](https://microsoft.github.io/autogen/) - GroupChat and conversational patterns
- [CrewAI Documentation](https://docs.crewai.com/) - Hierarchical agent processes
- [Research on Multi-Agent Coordination](https://arxiv.org/abs/2308.00352) - Survey of multi-agent systems

---

## Skill Metadata

**Created**: 2025-12-20
**Last Updated**: 2025-12-20
**Author**: Agent Skills for Context Engineering Contributors
**Version**: 1.0.0
