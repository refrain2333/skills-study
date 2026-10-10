# BDI 框架集成模式

将 BDI 本体接入可执行智能体框架的集成模式。

## SEMAS 规则转换

将 BDI 本体结构映射为 SEMAS 产生式规则。

### 本体到规则的映射

| BDI 结构 | SEMAS 元素 | 示例 |
|---------------|---------------|---------|
| 信念 | HEAD fact | `belief(agent_a, store_open)` |
| 支持信念 | CONDITIONALS | `[CONDITIONALS: time(weekday)]` |
| 生成愿望 | TAIL action | `generate_desire(agent, goal)` |
| 确立意图 | TAIL action | `commit_intention(agent, goal)` |
| 规定计划 | TAIL action | `create_plan(agent, plan_id)` |

### 规则模板

**信念触发愿望形成：**
```prolog
[HEAD: belief(Agent, Fact)] /
[CONDITIONALS: context_condition(Agent, Context)] »
[TAIL: generate_desire(Agent, DesiredState)].
```

**愿望触发意图确立：**
```prolog
[HEAD: desire(Agent, Goal)] /
[CONDITIONALS: belief(Agent, SupportingFact1),
               belief(Agent, SupportingFact2)] »
[TAIL: commit_intention(Agent, Goal)].
```

**意图触发计划制定：**
```prolog
[HEAD: intention(Agent, Goal)] /
[CONDITIONALS: goal(GoalSpec)] »
[TAIL: create_plan(Agent, PlanId)].
```

**计划触发执行：**
```prolog
[HEAD: plan(Agent, PlanId)] /
[CONDITIONALS: ready_to_execute(Agent)] »
[TAIL: execute_plan(Agent, PlanId)].
```

### 完整的 SEMAS 示例

```prolog
% ============================================================
% GROCERY SHOPPING SCENARIO
% ============================================================

% Phase 1: Belief formation from world state
[HEAD: perceive(agent_a, store_open)] /
[CONDITIONALS: time(weekday_afternoon)] »
[TAIL: add_belief(agent_a, store_open)].

% Phase 2: Desire generation from belief
[HEAD: belief(agent_a, store_open)] /
[CONDITIONALS: belief(agent_a, needs_groceries)] »
[TAIL: generate_desire(agent_a, buy_groceries)].

% Phase 3: Intention commitment from desire
[HEAD: desire(agent_a, buy_groceries)] /
[CONDITIONALS: belief(agent_a, has_shopping_list),
               belief(agent_a, store_open),
               belief(agent_a, has_transportation)] »
[TAIL: commit_intention(agent_a, buy_groceries)].

% Phase 4: Plan creation from intention
[HEAD: intention(agent_a, buy_groceries)] /
[CONDITIONALS: goal(complete_shopping)] »
[TAIL: create_plan(agent_a, shopping_plan)].

% Phase 5: Plan execution
[HEAD: plan(agent_a, shopping_plan)] /
[CONDITIONALS: preconditions_met(shopping_plan)] »
[TAIL: execute_task(agent_a, drive_to_store),
       execute_task(agent_a, select_items),
       execute_task(agent_a, checkout),
       execute_task(agent_a, return_home)].

% Phase 6: World state update
[HEAD: task_complete(agent_a, checkout)] /
[CONDITIONALS: items_purchased(agent_a)] »
[TAIL: update_world_state(has_groceries),
       remove_desire(agent_a, buy_groceries),
       remove_intention(agent_a, buy_groceries)].
```

### Python 转换层

```python
from rdflib import Graph, Namespace, RDF

BDI = Namespace("https://w3id.org/fossr/ontology/bdi/")

def ontology_to_semas_rules(bdi_graph: Graph) -> list[str]:
    """
    Translate BDI ontology instances to SEMAS production rules.
    """
    rules = []

    # 提取信念—愿望—意图链
    for intention in bdi_graph.subjects(RDF.type, BDI.Intention):
        # 获取支持信念
        supporting_beliefs = list(bdi_graph.objects(intention, BDI.isSupportedBy))

        # 获取要实现的愿望
        fulfilled_desires = list(bdi_graph.objects(intention, BDI.fulfils))

        # 获取指定计划
        specified_plans = list(bdi_graph.objects(intention, BDI.specifies))

        if fulfilled_desires and supporting_beliefs:
            desire = fulfilled_desires[0]
            beliefs_str = ", ".join([format_belief(b, bdi_graph) for b in supporting_beliefs])

            rule = (
                f"[HEAD: {format_desire(desire, bdi_graph)}] / "
                f"[CONDITIONALS: {beliefs_str}] » "
                f"[TAIL: commit_intention({format_intention(intention, bdi_graph)})]"
            )
            rules.append(rule)

        if specified_plans:
            plan = specified_plans[0]
            rule = (
                f"[HEAD: {format_intention(intention, bdi_graph)}] / "
                f"[CONDITIONALS: ready_to_plan] » "
                f"[TAIL: create_plan({format_plan(plan, bdi_graph)})]"
            )
            rules.append(rule)

    return rules

def format_belief(belief_uri, graph):
    label = graph.value(belief_uri, RDFS.label)
    return f"belief({label or belief_uri.split('/')[-1]})"

def format_desire(desire_uri, graph):
    label = graph.value(desire_uri, RDFS.label)
    return f"desire({label or desire_uri.split('/')[-1]})"

def format_intention(intention_uri, graph):
    label = graph.value(intention_uri, RDFS.label)
    return f"intention({label or intention_uri.split('/')[-1]})"

def format_plan(plan_uri, graph):
    label = graph.value(plan_uri, RDFS.label)
    return f"plan({label or plan_uri.split('/')[-1]})"
```

## 逻辑增强生成（LAG）

使用 BDI 本体约束增强大语言模型的输出。

### LAG 流程架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Query    │────▶│  Ontology       │────▶│  Augmented      │
│                 │     │  Injection      │     │  Prompt         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Validated      │◀────│  Ontology       │◀────│  LLM Response   │
│  RDF Triples    │     │  Validation     │     │  (Triples)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### LAG 实现

```python
from rdflib import Graph, Namespace
from rdflib.plugins.parsers.notation3 import BadSyntax

BDI = Namespace("https://w3id.org/fossr/ontology/bdi/")

class BDILogicAugmentedGenerator:
    def __init__(self, ontology_path: str, llm_client):
        self.ontology = Graph()
        self.ontology.parse(ontology_path, format='turtle')
        self.llm = llm_client

    def generate_mental_states(self, context: str) -> Graph:
        """
        Generate BDI mental states from context using LAG.
        """
        # 阶段 1：将本体注入提示词
        ontology_turtle = self.ontology.serialize(format='turtle')
        augmented_prompt = self._build_augmented_prompt(context, ontology_turtle)

        # 阶段 2：使用大语言模型生成
        response = self.llm.generate(augmented_prompt)

        # 阶段 3：提取并验证三元组
        triples = self._extract_triples(response)
        validated = self._validate_against_ontology(triples)

        if not validated['is_consistent']:
            # 根据反馈重试
            return self._retry_with_feedback(context, validated['errors'])

        return validated['graph']

    def _build_augmented_prompt(self, context: str, ontology: str) -> str:
        return f"""
你是一个 BDI 心理状态建模器。请根据以下上下文生成表示智能体信念、愿望和意图的
RDF 三元组。

## BDI 本体（使用以下类和属性）：
{ontology}

## 要建模的上下文：
{context}

## 指令：
1. 从上下文中识别世界状态
2. 生成指向这些世界状态的信念
3. 生成由这些信念促成的愿望
4. 生成实现愿望且有信念支持的意图
5. 为每项心理状态补充理由
6. 补充时间有效范围

只输出有效的 Turtle RDF 三元组。
"""

    def _extract_triples(self, response: str) -> str:
        """从大语言模型回复中提取 Turtle 内容。"""
        # 查找回复中的 Turtle 代码块
        if "```turtle" in response:
            start = response.find("```turtle") + 9
            end = response.find("```", start)
            return response[start:end].strip()
        return response

    def _validate_against_ontology(self, triples: str) -> dict:
        """根据 BDI 本体验证生成的三元组。"""
        result = {'is_consistent': True, 'errors': [], 'graph': None}

        try:
            generated = Graph()
            generated.parse(data=triples, format='turtle')
            result['graph'] = generated

            # 检查约束
            errors = []

            # 检查：每项意图都必须实现一项愿望
            for intention in generated.subjects(RDF.type, BDI.Intention):
                if not list(generated.objects(intention, BDI.fulfils)):
                    errors.append(f"Intention {intention} does not fulfill any desire")

            # 检查：每项信念都应指向一个世界状态
            for belief in generated.subjects(RDF.type, BDI.Belief):
                if not list(generated.objects(belief, BDI.refersTo)):
                    errors.append(f"Belief {belief} does not reference a world state")

            # 检查：愿望应由信念促成
            for desire in generated.subjects(RDF.type, BDI.Desire):
                if not list(generated.objects(desire, BDI.isMotivatedBy)):
                    errors.append(f"Desire {desire} has no motivating belief")

            if errors:
                result['is_consistent'] = False
                result['errors'] = errors

        except BadSyntax as e:
            result['is_consistent'] = False
            result['errors'] = [f"Invalid Turtle syntax: {e}"]

        return result

    def _retry_with_feedback(self, context: str, errors: list) -> Graph:
        """根据错误反馈重试生成。"""
        feedback_prompt = f"""
上一次生成存在以下错误：
{chr(10).join(errors)}

请修复这些问题并重新生成心理状态。

上下文：{context}
"""
        response = self.llm.generate(feedback_prompt)
        triples = self._extract_triples(response)
        result = self._validate_against_ontology(triples)

        if result['is_consistent']:
            return result['graph']
        else:
            raise ValueError(f"Failed to generate valid mental states: {result['errors']}")
```

### 不一致检测示例

```python
def detect_location_inconsistency(graph: Graph) -> list[str]:
    """
    Detect inconsistencies where agent cannot be in two places.
    """
    inconsistencies = []

    # 查询地点信念
    query = """
    PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

    SELECT ?agent ?belief1 ?belief2 ?loc1 ?loc2 WHERE {
        ?agent bdi:hasBelief ?belief1 , ?belief2 .
        ?belief1 bdi:refersTo ?ws1 .
        ?belief2 bdi:refersTo ?ws2 .
        ?ws1 bdi:hasLocation ?loc1 .
        ?ws2 bdi:hasLocation ?loc2 .
        FILTER(?belief1 != ?belief2 && ?loc1 != ?loc2)

        # Check temporal overlap
        ?belief1 bdi:hasValidity ?interval1 .
        ?belief2 bdi:hasValidity ?interval2 .
        ?interval1 bdi:hasStartTime ?start1 ; bdi:hasEndTime ?end1 .
        ?interval2 bdi:hasStartTime ?start2 ; bdi:hasEndTime ?end2 .
        FILTER(?start1 < ?end2 && ?start2 < ?end1)
    }
    """

    for row in graph.query(query):
        inconsistencies.append(
            f"Agent {row.agent} has conflicting location beliefs: "
            f"{row.loc1} and {row.loc2} at overlapping times"
        )

    return inconsistencies
```

## JADE/JADEX 集成

将 BDI 本体映射到 JADE/JADEX 智能体平台结构。

### JADE 智能体结构

```java
public class BDIAgent extends Agent {
    // 心理状态存储（映射到本体个体）
    private Set<Belief> beliefs = new HashSet<>();
    private Set<Desire> desires = new HashSet<>();
    private Set<Intention> intentions = new HashSet<>();

    // 基于本体管理心理状态
    private Graph mentalStateGraph;

    public void addBelief(Belief belief) {
        beliefs.add(belief);

        // 添加到 RDF 图
        Resource beliefResource = mentalStateGraph.createResource(belief.getUri());
        beliefResource.addProperty(RDF.type, BDI.Belief);
        beliefResource.addProperty(BDI.refersTo, belief.getWorldState().getUri());
        beliefResource.addProperty(BDI.hasValidity, createInterval(belief.getValidity()));

        // 触发愿望形成
        triggerDesireProcess(belief);
    }

    public void commitIntention(Intention intention) {
        intentions.add(intention);

        Resource intentionResource = mentalStateGraph.createResource(intention.getUri());
        intentionResource.addProperty(RDF.type, BDI.Intention);
        intentionResource.addProperty(BDI.fulfils, intention.getDesire().getUri());

        for (Belief support : intention.getSupportingBeliefs()) {
            intentionResource.addProperty(BDI.isSupportedBy, support.getUri());
        }

        // 触发计划制定
        triggerPlanning(intention);
    }

    // 将心理状态导出为 RDF
    public String exportMentalStates() {
        return mentalStateGraph.serialize(Format.TURTLE);
    }

    // 从 RDF 导入心理状态
    public void importMentalStates(String turtle) {
        Graph imported = new Graph();
        imported.parse(turtle, Format.TURTLE);

        // 根据 RDF 重建 Java 对象
        for (Resource belief : imported.listSubjectsWithProperty(RDF.type, BDI.Belief)) {
            Belief b = reconstructBelief(belief);
            beliefs.add(b);
        }
        // ... similar for desires and intentions
    }
}
```

### JADEX 目标映射

```java
// 将 BDI 本体目标映射到 JADEX 目标
@Goal
public class OntologyBackedGoal {
    @GoalParameter
    protected String goalUri;

    @GoalParameter
    protected Graph ontologyGraph;

    public OntologyBackedGoal(Resource goalResource, Graph graph) {
        this.goalUri = goalResource.getURI();
        this.ontologyGraph = graph;
    }

    @GoalTargetCondition
    public boolean isAchieved() {
        // 查询本体，判断目标是否实现
        String query = """
            PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
            ASK {
                ?execution bdi:addresses <%s> ;
                           bdi:bringsAbout ?worldState .
            }
            """.formatted(goalUri);

        return ontologyGraph.ask(query);
    }

    @GoalDropCondition
    public boolean shouldDrop() {
        // 检查支持信念是否已失效
        String query = """
            PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
            ASK {
                ?intention bdi:specifies ?plan .
                ?plan bdi:addresses <%s> .
                ?intention bdi:isSupportedBy ?belief .
                ?belief bdi:hasValidity ?interval .
                ?interval bdi:hasEndTime ?end .
                FILTER(?end < NOW())
            }
            """.formatted(goalUri);

        return ontologyGraph.ask(query);
    }
}
```

## RDF 三元组存储集成

### 三元组存储配置

```python
from rdflib import Graph
from rdflib.plugins.stores.sparqlstore import SPARQLUpdateStore

class BDIMentalStateStore:
    def __init__(self, endpoint: str):
        self.store = SPARQLUpdateStore()
        self.store.open((endpoint + "/query", endpoint + "/update"))
        self.graph = Graph(store=self.store, identifier="http://example.org/bdi")

    def add_belief(self, agent_uri: str, belief_data: dict):
        """将信念添加到三元组存储。"""
        belief_uri = f"{agent_uri}/belief/{belief_data['id']}"

        self.graph.add((URIRef(belief_uri), RDF.type, BDI.Belief))
        self.graph.add((URIRef(belief_uri), RDFS.label, Literal(belief_data['label'])))
        self.graph.add((URIRef(belief_uri), BDI.refersTo, URIRef(belief_data['world_state'])))
        self.graph.add((URIRef(agent_uri), BDI.hasMentalState, URIRef(belief_uri)))

        # Add temporal validity
        interval_uri = f"{belief_uri}/validity"
        self.graph.add((URIRef(belief_uri), BDI.hasValidity, URIRef(interval_uri)))
        self.graph.add((URIRef(interval_uri), BDI.hasStartTime,
                        Literal(belief_data['start_time'], datatype=XSD.dateTime)))
        self.graph.add((URIRef(interval_uri), BDI.hasEndTime,
                        Literal(belief_data['end_time'], datatype=XSD.dateTime)))

    def get_active_beliefs(self, agent_uri: str, at_time: datetime) -> list:
        """查询指定时间有效的信念。"""
        query = """
        PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?belief ?label WHERE {
            <%s> bdi:hasMentalState ?belief .
            ?belief a bdi:Belief ;
                    rdfs:label ?label ;
                    bdi:hasValidity ?interval .
            ?interval bdi:hasStartTime ?start ;
                      bdi:hasEndTime ?end .
            FILTER(?start <= "%s"^^xsd:dateTime && ?end >= "%s"^^xsd:dateTime)
        }
        """ % (agent_uri, at_time.isoformat(), at_time.isoformat())

        return list(self.graph.query(query))

    def get_cognitive_chain(self, intention_uri: str) -> dict:
        """追踪某项意图的完整认知链。"""
        query = """
        PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

        SELECT ?intention ?desire ?belief ?worldState ?plan WHERE {
            <%s> a bdi:Intention ;
                 bdi:fulfils ?desire ;
                 bdi:isSupportedBy ?belief .
            OPTIONAL { <%s> bdi:specifies ?plan }
            ?desire bdi:isMotivatedBy ?belief .
            ?belief bdi:refersTo ?worldState .
        }
        """ % (intention_uri, intention_uri)

        results = list(self.graph.query(query))
        if results:
            row = results[0]
            return {
                'intention': str(row.intention),
                'desire': str(row.desire),
                'belief': str(row.belief),
                'world_state': str(row.worldState),
                'plan': str(row.plan) if row.plan else None
            }
        return None
```

## FIPA ACL 集成

将 BDI 心理状态映射到 FIPA 智能体通信语言。

```python
from fipa_acl import ACLMessage, Performative

class BDICommunicator:
    def __init__(self, agent_id: str, mental_state_store: BDIMentalStateStore):
        self.agent_id = agent_id
        self.store = mental_state_store

    def share_belief(self, belief_uri: str, receiver: str) -> ACLMessage:
        """创建用于分享信念的 INFORM 消息。"""
        belief_triples = self.store.get_belief_as_turtle(belief_uri)

        message = ACLMessage()
        message.performative = Performative.INFORM
        message.sender = self.agent_id
        message.receiver = receiver
        message.content = belief_triples
        message.ontology = "https://w3id.org/fossr/ontology/bdi/"
        message.language = "turtle"

        return message

    def request_belief_confirmation(self, belief_uri: str, receiver: str) -> ACLMessage:
        """创建用于确认共享信念的 QUERY-IF 消息。"""
        message = ACLMessage()
        message.performative = Performative.QUERY_IF
        message.sender = self.agent_id
        message.receiver = receiver
        message.content = f"ASK {{ <{belief_uri}> a bdi:Belief }}"
        message.language = "sparql"

        return message

    def propose_intention(self, intention_uri: str, receiver: str) -> ACLMessage:
        """创建用于协调意图的 PROPOSE 消息。"""
        intention_triples = self.store.get_intention_as_turtle(intention_uri)

        message = ACLMessage()
        message.performative = Performative.PROPOSE
        message.sender = self.agent_id
        message.receiver = receiver
        message.content = intention_triples
        message.ontology = "https://w3id.org/fossr/ontology/bdi/"

        return message
```
