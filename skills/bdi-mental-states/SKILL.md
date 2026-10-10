---
name: bdi-mental-states
description: "用于使用信念、愿望和意图建模智能体心智状态，支持理性决策、RDF 转换与决策过程追踪。"
---

# BDI 心理状态建模

使用形式化 BDI 本体模式，将外部 RDF 上下文转化为智能体的心理状态：信念、愿望和意图。该技能让智能体能够通过认知架构推理上下文，并支持审议式推理、可解释性，以及多智能体系统中的语义互操作。

## 何时启用

在以下情况下启用此技能：

- 将外部 RDF 上下文处理成关于世界状态的智能体信念。
- 使用感知、审议和行动循环建模理性智能体。
- 通过可追踪的推理链实现可解释性。
- 实现 BDI 框架（SEMAS、JADE、JADEX）。
- 使用形式化认知结构增强 LLM（逻辑增强生成，Logic Augmented Generation）。
- 在多智能体平台之间协调心理状态。
- 追踪信念、愿望和意图随时间的演变。
- 将动机状态关联到行动计划。

相邻任务由其他技能负责，不要为这些任务启用本技能：

- 一般的上下文窗口说明或注意力机制：`context-fundamentals`。
- 不涉及形式化 BDI 状态的用户、实体或对话持久记忆：`memory-systems`。
- 监督者、群体或交接拓扑决策：`multi-agent-patterns`。
- 通用智能体评估标准或质量门槛：`evaluation`。

## 核心概念

### 心理现实架构

将心理状态分为两个本体类别，因为 BDI 推理必须区分持续存在的状态与发生的过程：

**心理状态（延续体，Endurants）**——将它们建模为在一段时间内持续存在的认知属性：

- `Belief`（信念）：表示智能体认为关于世界的事实。每个信念都应关联到一个世界状态引用。
- `Desire`（愿望）：表示智能体希望促成的状态。每个愿望都应关联到产生该动机的信念。
- `Intention`（意图）：表示智能体承诺要实现的目标。意图必须满足某个愿望，并指定一个计划。

**心理过程（发生体，Perdurants）**——将它们建模为能够创建或修改心理状态的事件，因为记录因果转变有助于解释行为：

- `BeliefProcess`（信念过程）：由感知触发信念的形成或更新。始终关联到生成该信念的世界状态。
- `DesireProcess`（愿望过程）：根据既有信念产生愿望，保留动机链。
- `IntentionProcess`（意图过程）：将选定的愿望确立为可执行的意图。

### 认知链模式

使用双向属性（`motivates` / `isMotivatedBy`、`fulfils` / `isFulfilledBy`）将信念、愿望和意图连接成有向链。这样既支持正向推理（智能体应该做什么？），也支持反向追踪（智能体为什么采取行动？）：

```turtle
:Belief_store_open a bdi:Belief ;
    rdfs:comment "Store is open" ;
    bdi:motivates :Desire_buy_groceries .

:Desire_buy_groceries a bdi:Desire ;
    rdfs:comment "I desire to buy groceries" ;
    bdi:isMotivatedBy :Belief_store_open .

:Intention_go_shopping a bdi:Intention ;
    rdfs:comment "I will buy groceries" ;
    bdi:fulfils :Desire_buy_groceries ;
    bdi:isSupportedBy :Belief_store_open ;
    bdi:specifies :Plan_shopping .
```

### 以世界状态作为依据

应让心理状态关联到世界状态，而不是只用自由文本描述。缺乏依据的信念会妨碍语义查询和跨智能体互操作：

```turtle
:Agent_A a bdi:Agent ;
    bdi:perceives :WorldState_WS1 ;
    bdi:hasMentalState :Belief_B1 .

:WorldState_WS1 a bdi:WorldState ;
    rdfs:comment "Meeting scheduled at 10am in Room 5" ;
    bdi:atTime :TimeInstant_10am .

:Belief_B1 a bdi:Belief ;
    bdi:refersTo :WorldState_WS1 .
```

### 目标导向规划

用 `bdi:specifies` 将意图关联到计划，并用 `bdi:precedes` 将计划拆解为有序任务序列。这样计划可以被不同意图复用，执行顺序也能明确表示：

```turtle
:Intention_I1 bdi:specifies :Plan_P1 .

:Plan_P1 a bdi:Plan ;
    bdi:addresses :Goal_G1 ;
    bdi:beginsWith :Task_T1 ;
    bdi:endsWith :Task_T3 .

:Task_T1 bdi:precedes :Task_T2 .
:Task_T2 bdi:precedes :Task_T3 .
```

### T2B2T 范式

实现“**三元组 → 信念 → 三元组**”（Triples-to-Beliefs-to-Triples，T2B2T）双向流程，因为智能体既要消费外部 RDF 上下文，也要生成新的 RDF 断言。每个 T2B2T 实现都应明确分成两个阶段：

**阶段 1：三元组转信念**——将传入的 RDF 三元组转换成信念实例。使用 `bdi:triggers` 将外部世界状态关联到 `BeliefProcess`，再用 `bdi:generates` 生成信念。这样可以保留源数据到内部认知的来源链：

```turtle
:WorldState_notification a bdi:WorldState ;
    rdfs:comment "Push notification: Payment request $250" ;
    bdi:triggers :BeliefProcess_BP1 .

:BeliefProcess_BP1 a bdi:BeliefProcess ;
    bdi:generates :Belief_payment_request .
```

**阶段 2：信念转三元组**——BDI 审议选定意图并执行计划后，使用 `bdi:bringsAbout` 将结果投影回 RDF。这样就闭合了流程，下游系统可以把智能体输出当作标准关联数据来消费：

```turtle
:Intention_pay a bdi:Intention ;
    bdi:specifies :Plan_payment .

:PlanExecution_PE1 a bdi:PlanExecution ;
    bdi:satisfies :Plan_payment ;
    bdi:bringsAbout :WorldState_payment_complete .
```

### 根据抽象层级选择表示法

根据要建模的 C4 抽象层级选择表示法；在不合适的层级混用表示法会模糊而不是澄清认知架构：

| C4 层级 | 表示法 | 心理状态表示内容 |
|----------|----------|----------------------------|
| L1 上下文 | ArchiMate | 智能体边界、外部感知来源 |
| L2 容器 | ArchiMate | BDI 推理引擎、信念存储、计划执行器 |
| L3 组件 | UML | 心理状态管理器、过程处理器 |
| L4 代码 | UML/RDF | 信念/愿望/意图类、本体实例 |

### 理由与可解释性

为每个心理实体附加 `bdi:Justification` 实例，并使用 `bdi:isJustifiedBy` 关联。缺少依据的心理状态无法解释、追踪。每条理由都应记录产生该状态的证据或规则：

```turtle
:Belief_B1 a bdi:Belief ;
    bdi:isJustifiedBy :Justification_J1 .

:Justification_J1 a bdi:Justification ;
    rdfs:comment "Official announcement received via email" .

:Intention_I1 a bdi:Intention ;
    bdi:isJustifiedBy :Justification_J2 .

:Justification_J2 a bdi:Justification ;
    rdfs:comment "Location precondition satisfied" .
```

### 时间维度

使用 `bdi:hasValidity` 和 `TimeInterval` 实例为每个心理状态标注有效时间区间。缺乏时间边界的信念无法在历时推理中清理或检查冲突：

```turtle
:Belief_B1 a bdi:Belief ;
    bdi:hasValidity :TimeInterval_TI1 .

:TimeInterval_TI1 a bdi:TimeInterval ;
    bdi:hasStartTime :TimeInstant_9am ;
    bdi:hasEndTime :TimeInstant_11am .
```

使用带时间筛选的 SPARQL 查询某一时刻有效的心理状态。当多个关于同一世界状态的信念在时间上重叠时，可以使用此模式处理冲突：

```sparql
SELECT ?mentalState WHERE {
    ?mentalState bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
    FILTER(?start <= "2025-01-04T10:00:00"^^xsd:dateTime &&
           ?end >= "2025-01-04T10:00:00"^^xsd:dateTime)
}
```

### 组合式心理实体

用 `bdi:hasPart` 将复杂信念拆成组成部分，因为单体信念在局部更新时必须整体替换。采用组合式建模后，每条子信念都可以独立更新、查询或失效：

```turtle
:Belief_meeting a bdi:Belief ;
    rdfs:comment "Meeting at 10am in Room 5" ;
    bdi:hasPart :Belief_meeting_time , :Belief_meeting_location .

# Update only location component without touching time
:BeliefProcess_update a bdi:BeliefProcess ;
    bdi:modifies :Belief_meeting_location .
```

## 实践指南

### 分六步构建 BDI 模型

将外部语义上下文转换为 BDI 表示时，按以下流程操作：

1. **定义世界状态底层**：识别智能体可以感知的外部事实或事件。先将这些事实或事件建模为世界状态，再创建信念。
2. **创建信念实例**：把相关世界状态转换为信念，并附上来源、有效时间和理由引用。
3. **从信念推导愿望**：只有当信念产生与目标相关的动机时才添加愿望，并将愿望关联到产生动机的信念。
4. **审慎地确立意图**：只有当智能体承诺执行计划时，才将愿望提升为意图。记录所选计划及其前置条件。
5. **将行动结果投影回三元组**：执行后输出由此产生的世界状态，使下游系统可以消费新的 RDF 状态。
6. **用能力问题验证**：查询来源、动机、计划顺序和有效时间范围，确认模型可靠后再使用。

### 保持本体精简

从 `Agent`、`WorldState`、`Belief`、`Desire`、`Intention`、`Plan`、`Task`、`Justification` 和 `TimeInterval` 开始。只有当能力问题证明核心模型无法回答所需查询时，才添加专用类。紧凑的本体更容易序列化到提示词中、更容易验证，也不容易产生脆弱的推理链。

### 只有在心理状态语义重要时才使用 BDI

当系统需要解释智能体行为时，BDI 建模才有价值：智能体为什么相信某事、这个信念产生了什么愿望、选择了哪个意图，以及执行了什么计划。如果系统只需要跨会话记住事实，使用 `memory-systems`。如果系统只需要在智能体之间分配工作，使用 `multi-agent-patterns`。

## 详细主题

### 集成模式

### 逻辑增强生成（Logic Augmented Generation，LAG）

使用 LAG 通过本体结构约束 LLM 输出，因为不受约束的生成可能会产生违反 BDI 类限制的三元组。将本体序列化后放入提示词上下文，生成三元组后先进行验证，再接受结果：

```python
def augment_llm_with_bdi_ontology(prompt, ontology_graph):
    ontology_context = serialize_ontology(ontology_graph, format='turtle')
    augmented_prompt = f"{ontology_context}\n\n{prompt}"

    response = llm.generate(augmented_prompt)
    triples = extract_rdf_triples(response)

    is_consistent = validate_triples(triples, ontology_graph)
    return triples if is_consistent else retry_with_feedback()
```

### SEMAS 规则转换

在部署到基于规则的智能体平台时，将 BDI 本体模式转换为可执行的产生式规则。把认知链上的每个连接（信念到愿望、愿望到意图）映射到 `HEAD/CONDITIONALS/TAIL` 规则，以保留审议语义并支持运行时执行：

```prolog
% Belief triggers desire formation
[HEAD: belief(agent_a, store_open)] /
[CONDITIONALS: time(weekday_afternoon)] »
[TAIL: generate_desire(agent_a, buy_groceries)].

% Desire triggers intention commitment
[HEAD: desire(agent_a, buy_groceries)] /
[CONDITIONALS: belief(agent_a, has_shopping_list)] »
[TAIL: commit_intention(agent_a, buy_groceries)].
```

## 指南

1. 将世界状态建模为独立于智能体视角的配置，为心理状态提供可引用的底层事实。
2. 区分延续体（持续存在的心理状态）和发生体（随时间发生的心理过程），与 DOLCE 本体保持一致。
3. 将目标视为描述，而不是心理状态，从而将认知层和规划层分开。
4. 对整体—部分结构使用 `hasPart`，以便选择性更新信念。
5. 使用 `atTime` 或 `hasValidity` 将每个心理实体与时间概念关联。
6. 使用双向属性对（`motivates` / `isMotivatedBy`、`generates` / `isGeneratedBy`），便于灵活查询。
7. 将心理实体关联到 `Justification` 实例，以支持可解释性和可信度。
8. 按三个步骤实现 T2B2T：(1) 将 RDF 转为信念，(2) 执行 BDI 推理，(3) 将心理状态投影回 RDF。
9. 为心理过程定义存在限制（例如 `BeliefProcess ⊑ ∃generates.Belief`）。
10. 为实现互操作性，复用成熟的模式（ODP）：EventCore、Situation、TimeIndexedSituation、BasicPlan、Provenance。

## 能力问题

使用以下 SPARQL 查询验证实现：

```sparql
# CQ1: What beliefs motivated formation of a given desire?
SELECT ?belief WHERE {
    :Desire_D1 bdi:isMotivatedBy ?belief .
}

# CQ2: Which desire does a particular intention fulfill?
SELECT ?desire WHERE {
    :Intention_I1 bdi:fulfils ?desire .
}

# CQ3: Which mental process generated a belief?
SELECT ?process WHERE {
    ?process bdi:generates :Belief_B1 .
}

# CQ4: What is the ordered sequence of tasks in a plan?
SELECT ?task ?nextTask WHERE {
    :Plan_P1 bdi:hasComponent ?task .
    OPTIONAL { ?task bdi:precedes ?nextTask }
} ORDER BY ?task
```

## 示例

**示例 1：将 RDF 通知转换为 BDI 链**

输入世界状态：

```turtle
:WorldState_invoice_due a bdi:WorldState ;
    rdfs:comment "Invoice INV-42 is due tomorrow" ;
    bdi:atTime :Time_2026_05_15 .
```

BDI 投影：

```turtle
:Belief_invoice_due a bdi:Belief ;
    bdi:refersTo :WorldState_invoice_due ;
    bdi:isJustifiedBy :Justification_billing_system ;
    bdi:motivates :Desire_avoid_late_fee .

:Desire_avoid_late_fee a bdi:Desire ;
    bdi:isMotivatedBy :Belief_invoice_due .

:Intention_pay_invoice a bdi:Intention ;
    bdi:fulfils :Desire_avoid_late_fee ;
    bdi:specifies :Plan_pay_invoice .
```

**示例 2：判断职责边界**

如果任务是“记住 Alice 喜欢简洁的摘要”，使用 `memory-systems`。如果任务是“表示智能体为什么相信 Alice 需要摘要、这个信念产生什么目标，以及它承诺执行哪个计划”，使用本技能。

## 常见问题

1. **混淆心理状态与世界状态**：心理状态通过 `bdi:refersTo` 引用世界状态，本身并不是世界状态。混淆二者会抹去感知与认知的边界，并破坏按类型筛选的 SPARQL 查询。
2. **缺少时间边界**：每个心理状态都需要有效时间区间以支持历时推理。否则过时信念会无限期保留，也无法检测冲突。
3. **信念结构扁平**：对复杂信念使用 `hasPart` 组合建模。单体信念在只需修改某个属性时也必须整体替换。
4. **理由隐含不明**：始终将心理实体关联到明确的 `Justification` 实例。没有理由的心理状态无法审计或追踪。
5. **意图直接映射到行动**：意图应指定计划，计划包含任务，行动执行任务。跳过计划层会失去复用、重新排序或共享执行策略的能力。
6. **本体过于复杂**：从 5–10 个核心类和属性开始（Belief、Desire、Intention、WorldState、Plan 及关键关系）。过早扩充本体会增加提示词上下文和 SPARQL 查询耗时，却未必能改善推理质量。
7. **推理成本爆炸**：将信念链限制在 3 层或更少（信念 → 愿望 → 意图）。更深的链会显著增加 LLM 推理成本，而且相较于浅层替代方案，很少能改善决策质量。

## 集成

本技能负责形式化心理状态建模。相邻技能负责不同层面：

- `memory-systems`：不涉及 BDI 信念/愿望/意图语义的持久事实、实体记忆和时序知识图。
- `multi-agent-patterns`：智能体拓扑、交接协议和智能体间协调。
- `evaluation`：BDI 实现的能力问题、回归检查和质量门槛。
- `context-fundamentals`：用于构造提示词的上下文窗口和注意力机制概念。
- `tool-design`：BDI 查询、验证或投影工具的模式与契约。

## 参考资料

内部参考：

- [BDI 本体核心](./references/bdi-ontology-core.md)——实现 BDI 类层级或从零定义本体属性时阅读。
- [RDF 示例](./references/rdf-examples.md)——编写心理状态的 Turtle 序列化或排查三元组结构时阅读。
- [SPARQL 能力查询](./references/sparql-competency.md)——依据能力问题验证实现或编写自定义查询时阅读。
- [框架集成](./references/framework-integration.md)——将 BDI 模型部署到 SEMAS、JADE 或 LAG 流程时阅读。

主要来源：

- Zuppiroli 等人，《信念—愿望—意图本体》（2025）——实现形式化 BDI 类层级或验证本体一致性时阅读。
- Rao 与 Georgeff，《BDI 智能体：从理论到实践》（1995）——了解实用推理智能体的理论基础时阅读。
- Bratman，《意图、计划与实践理性》（1987）——从意图的哲学基础出发制定实现决策时阅读。

---

## 技能元数据

**创建时间**：2026-01-07
**最后更新**：2026-05-15
**作者**：Agent Skills for Context Engineering 贡献者
**版本**：2.1.0
