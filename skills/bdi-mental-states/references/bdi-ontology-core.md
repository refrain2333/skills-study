# BDI 本体核心模式

信念—愿望—意图（BDI）心理状态建模的核心本体设计模式。

## 类层级

### 心理实体（持续存在物）

```
bdi:MentalEntity
├── bdi:Belief          # 信息维度
├── bdi:Desire          # 动机维度
├── bdi:Intention       # 审议维度
├── bdi:Goal            # 对期望最终状态的描述
└── bdi:Plan            # 有结构的行动序列
```

### 心理过程（延续过程）

```
bdi:MentalProcess
├── bdi:BeliefProcess      # 根据感知形成或更新信念
├── bdi:DesireProcess      # 根据信念生成愿望
├── bdi:IntentionProcess   # 将愿望确立为意图
├── bdi:Planning           # 将意图转化为计划
└── bdi:PlanExecution      # 执行计划中的动作
```

### 支持性实体

```
bdi:WorldState        # 环境状态配置
bdi:Justification     # 心理状态的证据依据
bdi:Task              # 计划行动的原子单元
bdi:Action            # 执行任务
bdi:TimeInterval      # 时间有效范围
bdi:TimeInstant       # 时间点引用
```

## 对象属性

### 动机关系

| 属性 | 定义域 | 值域 | 说明 |
|----------|--------|-------|-------------|
| `motivates` | Belief | Desire | 信念为愿望提供理由 |
| `isMotivatedBy` | Desire | Belief | `motivates` 的逆关系 |
| `fulfils` | Intention | Desire | 意图承诺实现某项愿望 |
| `isFulfilledBy` | Desire | Intention | `fulfils` 的逆关系 |
| `isSupportedBy` | Intention | Belief | 支持意图可行性的信念 |

### 生成关系

| 属性 | 定义域 | 值域 | 说明 |
|----------|--------|-------|-------------|
| `generates` | MentalProcess | MentalEntity | 过程创建心理状态 |
| `isGeneratedBy` | MentalEntity | MentalProcess | `generates` 的逆关系 |
| `modifies` | MentalProcess | MentalEntity | 过程更新既有状态 |
| `suppresses` | MentalProcess | MentalEntity | 过程停用某个状态 |
| `isTriggeredBy` | MentalProcess | MentalEntity | 状态触发过程 |

### 指代关系

| 属性 | 定义域 | 值域 | 说明 |
|----------|--------|-------|-------------|
| `refersTo` | MentalEntity | WorldState | 关于世界的心理状态 |
| `perceives` | Agent | WorldState | 智能体观察世界 |
| `bringsAbout` | Action | WorldState | 动作引起世界变化 |
| `reasonsUpon` | MentalProcess | MentalEntity | 推理过程的输入 |

### 结构关系

| 属性 | 定义域 | 值域 | 说明 |
|----------|--------|-------|-------------|
| `hasPart` | MentalEntity | MentalEntity | 整体与部分的组成关系 |
| `specifies` | Intention | Plan | 意图规定计划 |
| `addresses` | Plan | Goal | 计划实现目标 |
| `hasComponent` | Plan | Task | 计划包含任务 |
| `precedes` | Task | Task | 任务顺序 |

### 时间关系

| 属性 | 定义域 | 值域 | 说明 |
|----------|--------|-------|-------------|
| `atTime` | Entity | TimeInstant | 发生时间点 |
| `hasValidity` | MentalEntity | TimeInterval | 持续有效的时间范围 |
| `hasStartTime` | TimeInterval | TimeInstant | 时间范围起点 |
| `hasEndTime` | TimeInterval | TimeInstant | 时间范围终点 |

### 理由关系

| 属性 | 定义域 | 值域 | 说明 |
|----------|--------|-------|-------------|
| `isJustifiedBy` | MentalEntity | Justification | 证据支持 |
| `justifies` | Justification | MentalEntity | Inverse relation |

## 本体约束

### 信念约束

```turtle
bdi:Belief rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:refersTo ;
    owl:someValuesFrom bdi:WorldState
] .

bdi:Belief rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:hasValidity ;
    owl:maxCardinality 1
] .
```

### 愿望约束

```turtle
bdi:Desire rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:isMotivatedBy ;
    owl:someValuesFrom bdi:Belief
] .
```

### 意图约束

```turtle
bdi:Intention rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:fulfils ;
    owl:cardinality 1
] .

bdi:Intention rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:isSupportedBy ;
    owl:someValuesFrom bdi:Belief
] .
```

### 心理过程约束

```turtle
bdi:BeliefProcess rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:generates ;
    owl:allValuesFrom bdi:Belief
] .

bdi:DesireProcess rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:generates ;
    owl:allValuesFrom bdi:Desire
] .

bdi:IntentionProcess rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:generates ;
    owl:allValuesFrom bdi:Intention
] .
```

## 与 DOLCE 本体对齐

BDI 本体与 DOLCE Ultra Lite（DUL）基础本体对齐：

| BDI 类 | DUL 父类 | 理由 |
|-----------|----------------|-----------|
| `Agent` | `dul:Agent` | 具有行动能力的意向性实体 |
| `Belief` | `dul:InformationObject` | 承载信息的实体 |
| `Desire` | `dul:Description` | 描述期望状态 |
| `Intention` | `dul:Description` | 描述已承诺的行动路线 |
| `Goal` | `dul:Goal` | 对期望最终状态的描述 |
| `Plan` | `dul:Plan` | 有组织的行动序列 |
| `WorldState` | `dul:Situation` | 实体的状态配置 |
| `MentalProcess` | `dul:Event` | 具有时间跨度的事件 |
| `Task` | `dul:Task` | 计划工作中的一个单元 |
| `Action` | `dul:Action` | 已执行的任务实例 |

## 复用的本体设计模式

### EventCore 模式
用于表示具有时间属性和参与者角色的心理过程。

### Situation 模式
用于表示心理状态所指向的世界状态配置。

### TimeIndexedSituation 模式
用于把心理状态与其有效时间范围关联起来。

### BasicPlan 模式
用于构建把意图与行动连接起来的目标—计划—任务结构。

### 来源追踪模式
用于追踪理由和证据链。

## 命名空间声明

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix dul: <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
```
