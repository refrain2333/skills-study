# 如何独立使用 Agent Skills 构建智能体项目

## 🎯 核心理念

这个 Agent Skills 项目**与任何平台无关**。它提供的是**可复用的架构原理和设计模式**，你可以用任何编程语言、任何框架来实现。

### 为什么它与平台无关？

1. **原理优先** - 不依赖于 Claude API 或 Cursor 的特定功能
2. **代码示例** - 提供的 Python 脚本是伪代码实现，可轻松适配任何 LLM API
3. **架构模式** - 多代理协调、内存系统、工具设计等模式适用于所有框架
4. **最佳实践** - 基于生产经验，与具体工具无关

---

## 📋 使用步骤

### 第一步：学习核心原理（1-2小时）

首先理解基础知识，这是所有其他决策的基础：

```
学习顺序：
1. context-fundamentals/SKILL.md
   └─ 理解：什么是上下文，为什么有限制，如何管理
   
2. context-degradation/SKILL.md
   └─ 理解：上下文会如何失败（丢失中间、干扰等）
   
3. tool-design/SKILL.md
   └─ 理解：如何设计代理能有效使用的工具
```

**关键概念速查表：**
- 上下文窗口 = 有限的"注意力预算"
- 质量 > 数量（精心选择的 1000 个令牌优于无关的 10000 个）
- 工具整合原则：若你自己不知道用哪个工具，代理也不知道

---

### 第二步：选择架构模式（1小时）

根据你的问题特性选择合适的架构：

#### **单代理系统** 
✅ 适用于：简单任务、轻量级应用
📖 参考：context-fundamentals

```
用户输入 → 系统提示 + 工具定义 → LLM → 工具调用 → 响应
```

#### **多代理系统**
✅ 适用于：复杂任务、需要并行处理、需要不同专业性
📖 参考：multi-agent-patterns

**三种主要模式：**

1. **监督者模式**（Supervisor）
```
用户 → 监督者代理（分解任务、协调）
         ├─ 工作代理1（专业1）
         ├─ 工作代理2（专业2）
         └─ 工作代理3（专业3）
         ← 聚合结果
```
🎯 最适合：清晰的任务分解、需要质量控制的场景

2. **对等模式**（Peer-to-Peer）
```
代理1 ←→ 代理2 ←→ 代理3
  ↓       ↓      ↓
所有代理可相互协作，无中心控制
```
🎯 最适合：灵活的任务流、自适应的工作流

3. **分层模式**（Hierarchical）
```
L1: 战略规划代理
L2: 执行代理组1、执行代理组2
L3: 执行单元
```
🎯 最适合：大规模复杂任务、多层抽象

---

### 第三步：设计内存系统（1小时）

选择数据持久化方案：

#### **选择决策树：**

```
你需要跨会话保存信息吗？
├─ NO → 使用会话上下文即可
└─ YES
   ├─ 只需简单的相似度搜索？
   │  └─ 使用向量存储（Vector Store + RAG）
   └─ 需要复杂的关系推理？
      ├─ 实体间的关系重要吗？
      │  └─ 使用知识图（Knowledge Graph）
      └─ 时间维度重要吗？
         └─ 使用时间知识图（Temporal Knowledge Graph）
```

**实现参考：** `memory-systems/scripts/memory_store.py`

```python
# 示例：集成内存系统
from memory_store import IntegratedMemorySystem
from datetime import datetime

memory = IntegratedMemorySystem()
memory.start_session("session_001")

# 存储事实
memory.store_fact(
    fact="用户询问了关于 Python 性能优化的问题",
    entity="user_001",
    timestamp=datetime.now(),
    relationships=[{
        "type": "ASKED_ABOUT",
        "target": "python_optimization"
    }]
)

# 检索相关记忆
memories = memory.retrieve_memories(
    query="性能优化",
    entity_filter="user_001"
)
```

---

### 第四步：构建你的项目（2-4小时）

#### **推荐架构：管道模式**

参考：`project-development/scripts/pipeline_template.py`

```
Acquire → Prepare → Process → Parse → Render
   ↓         ↓         ↓        ↓       ↓
获取数据  生成提示   LLM调用  解析结果  生成输出
(确定)   (确定)   (非确定)  (确定)   (确定)
```

**核心优势：**
- 每个阶段独立可调试
- 非确定性步骤（LLM调用）隔离在中间
- 文件系统作为状态管理，实现自然的幂等性
- 每个阶段失败都可以从该点恢复

#### **文件系统状态管理：**

```
data/
├── batch_20250115/
│   ├── item_001/
│   │   ├── raw.json          # 获取完成
│   │   ├── prompt.md         # 准备完成
│   │   ├── response.md       # 处理完成
│   │   └── parsed.json       # 解析完成
│   └── item_002/
│       └── ...
└── batch_20250116/
    └── ...
```

**优点：**
- 易于调试（查看中间状态）
- 易于缓存（已完成的步骤不重做）
- 易于并行处理（多个项目在不同阶段）
- 易于追踪成本（实时监控令牌使用）

---

### 第五步：实现多代理协调（可选，1-2小时）

如果使用多代理架构，参考：`multi-agent-patterns/scripts/coordination.py`

```python
from coordination import SupervisorAgent, AgentMessage, MessageType, AgentCommunication

# 初始化通信通道
communication = AgentCommunication()

# 创建监督者
supervisor = SupervisorAgent("supervisor_1", communication)

# 注册工作代理
supervisor.register_worker("worker_research", capabilities=["search", "analyze"])
supervisor.register_worker("worker_write", capabilities=["draft", "review"])

# 执行工作流
result = supervisor.run_workflow({
    "id": "task_001",
    "type": "research",
    "description": "Research AI safety",
    "priority": 1
})
```

**关键设计模式：**

1. **握手协议** - 代理间传输任务状态
2. **共识机制** - 多个代理投票决策
3. **故障处理** - 重试、断路器模式、替代路由

---

### 第六步：实现评估框架（1小时）

参考：`evaluation/scripts/evaluator.py`、`advanced-evaluation/`

```python
# 基础评估框架
evaluation_rubric = {
    "准确性": {
        "weight": 0.3,
        "criteria": "事实是否准确、有无幻觉",
        "scale": [1, 2, 3, 4, 5]
    },
    "完整性": {
        "weight": 0.2,
        "criteria": "是否涵盖了所有相关要点",
        "scale": [1, 2, 3, 4, 5]
    },
    "工具效率": {
        "weight": 0.2,
        "criteria": "使用了多少工具调用来完成任务",
        "scale": [1, 2, 3, 4, 5]
    },
    "可读性": {
        "weight": 0.3,
        "criteria": "输出的清晰度和组织性",
        "scale": [1, 2, 3, 4, 5]
    }
}

# LLM 评判者模式（推荐）
# 使用 LLM 的另一个实例来评估首个 LLM 的输出
# 优点：可扩展、一致性强
# 缺点：成本增加（一个输出需要额外的LLM调用进行评估）
```

---

## 🛠️ 实战示例：构建一个研究助手

### 场景
构建一个多代理研究助手系统，用户提出一个研究话题，系统能够：
1. 搜索相关信息
2. 分析来自多个来源的信息
3. 生成一份综合报告

### 实现步骤

#### 第一步：确认任务适合 LLM

- ✅ 综合性任务（综合多个来源）
- ✅ 需要推理和判断
- ✅ 输出是自然语言
- ✅ 错误容限度高（可由人审查）

#### 第二步：选择架构

```
监督者模式（三个工作代理）

监督者
├─ 搜索代理 → 搜索数据库或API
├─ 分析代理 → 分析信息、提取要点
└─ 综合代理 → 合并结果、生成报告
```

#### 第三步：实现通信

```python
class ResearchSystem:
    def __init__(self):
        self.communication = AgentCommunication()
        self.supervisor = SupervisorAgent("supervisor", self.communication)
        self.memory = IntegratedMemorySystem()
        
    def handle_research_query(self, query: str):
        # 步骤1：分解任务
        task = {
            "id": "research_001",
            "type": "research",
            "description": query,
            "priority": 1
        }
        
        # 步骤2：执行工作流
        result = self.supervisor.run_workflow(task)
        
        # 步骤3：存储到内存（以供未来使用）
        self.memory.store_fact(
            fact=result["final_result"]["summary"],
            entity=query,
            relationships=[{
                "type": "RESEARCHED_ON",
                "target": "research_system"
            }]
        )
        
        return result
```

#### 第四步：使用管道处理

```python
# 适用于批量研究任务
research_pipeline = ResearchPipeline()

# 阶段1：获取研究话题列表
topics = research_pipeline.acquire_topics()

# 阶段2：为每个话题生成研究计划
for topic in topics:
    research_pipeline.prepare_research_plan(topic)

# 阶段3：执行研究（LLM 调用）
research_pipeline.process_research(workers=4)

# 阶段4：解析结果
research_pipeline.parse_results()

# 阶段5：生成最终报告
research_pipeline.render_reports()
```

---

## 🔌 与不同 LLM 框架的集成

### OpenAI API

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def call_llm(prompt: str, system_prompt: str = None) -> str:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7,
        max_tokens=2000
    )
    return response.choices[0].message.content
```

### Anthropic Claude API

```python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")

def call_llm(prompt: str, system_prompt: str = None) -> str:
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        system=system_prompt or "You are a helpful assistant.",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text
```

### Ollama（本地模型）

```python
import requests
import json

def call_llm(prompt: str, system_prompt: str = None) -> str:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama2",
            "prompt": prompt,
            "system": system_prompt,
            "stream": False
        }
    )
    return response.json()["response"]
```

### LangChain 集成

```python
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = OpenAI(temperature=0.7)

template = """
{system_prompt}

User Question: {question}
"""

prompt = PromptTemplate(
    template=template,
    input_variables=["system_prompt", "question"]
)

chain = LLMChain(llm=llm, prompt=prompt)

result = chain.run(
    system_prompt="You are a helpful assistant.",
    question="How do I build a multi-agent system?"
)
```

---

## 📊 关键指标跟踪

无论使用哪个框架，都要跟踪这些指标：

```python
class SystemMetrics:
    def __init__(self):
        self.total_tokens = 0
        self.input_tokens = 0
        self.output_tokens = 0
        self.llm_calls = 0
        self.total_cost = 0.0
        self.errors = 0
    
    def log_call(self, input_tokens, output_tokens, cost):
        self.input_tokens += input_tokens
        self.output_tokens += output_tokens
        self.total_tokens += input_tokens + output_tokens
        self.llm_calls += 1
        self.total_cost += cost
    
    def get_report(self):
        return {
            "total_calls": self.llm_calls,
            "total_tokens": self.total_tokens,
            "avg_tokens_per_call": self.total_tokens / max(1, self.llm_calls),
            "total_cost": f"${self.total_cost:.2f}",
            "error_rate": self.errors / max(1, self.llm_calls)
        }
```

---

## ⚠️ 常见陷阱和解决方案

| 陷阱 | 症状 | 解决方案 |
|------|------|---------|
| 上下文过度填充 | 代理反应变慢、开始幻觉 | 使用递进式披露，实现观察遮蔽 |
| 工具太多 | 代理选错工具，执行缓慢 | 应用整合原则，减少工具数量 |
| 多代理混乱 | 代理相互冲突、死锁 | 实现显式握手协议和超时机制 |
| 成本失控 | 账单意外飙升 | 实时跟踪令牌、设置成本上限警告 |
| 记忆丢失 | 代理"忘记"之前的决定 | 使用时间知识图，而不是简单的向量存储 |

---

## 📚 深入学习路径

### 初级（第一周）
- ✅ 理解上下文基础
- ✅ 设计简单的单代理系统
- ✅ 学习工具设计原则
- ✅ 构建第一个管道项目

### 中级（第二周）
- ✅ 实现多代理系统
- ✅ 设计内存系统
- ✅ 构建评估框架
- ✅ 优化成本和性能

### 高级（第三周）
- ✅ 实现高级评估（LLM-as-Judge）
- ✅ 应用上下文压缩
- ✅ 设计复杂的协调协议
- ✅ 生产部署和监控

---

## 🎯 总结

**关键要点：**

1. **Skills 是原理库，不是工具库** - 提供设计模式，由你实现
2. **与 LLM 框架无关** - 使用任何 API（OpenAI、Claude、本地等）
3. **遵循四个核心原则**：
   - 上下文是有限资源 → 精心策划使用
   - 设计好工具 → 减少代理混淆
   - 隔离上下文 → 使用多代理架构
   - 测量一切 → 成本、性能、质量

4. **从简单到复杂** - 先单代理管道，再多代理系统
5. **以文件系统为中心** - 易于调试、缓存、成本追踪

**立即开始：**
```bash
# 第一步：复制 project-development 的管道模板
cp skills/project-development/scripts/pipeline_template.py my_project.py

# 第二步：根据你的 LLM API 自定义 call_llm() 函数

# 第三步：运行
python my_project.py all --batch-id 2025-01-15
```

祝你构建成功的智能体系统！🚀

