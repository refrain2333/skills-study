# 架构精简：生产实践证据

本文档提供了智能体工具设计的架构精简（Architectural Reduction）方法的详细证据和实现模式。

## 案例研究：Text-to-SQL 智能体

一个生产环境下的 Text-to-SQL 智能体根据架构精简原则进行了重构。原始架构使用了大量经过繁重提示词工程和精细上下文管理的专用工具。精简后的架构仅使用了一个单一的 Bash 命令执行工具。

### 原始架构（许多专用工具）

原始系统包含：
- GetEntityJoins: 查找实体间的关系
- LoadCatalog: 加载数据目录信息
- RecallContext: 检索先前的上下文
- LoadEntityDetails: 获取实体规范
- SearchCatalog: 搜索数据目录
- ClarifyIntent: 澄清用户意图
- SearchSchema: 搜索数据库模式
- GenerateAnalysisPlan: 创建查询计划
- FinalizeQueryPlan: 完成查询计划
- FinalizeNoData: 处理无数据情况
- JoinPathFinder: 查找连接路径
- SyntaxValidator: 验证 SQL 语法
- FinalizeBuild: 完成查询构建
- ExecuteSQL: 执行 SQL 查询
- FormatResults: 格式化查询结果
- VisualizeData: 创建可视化
- ExplainResults: 解释查询结果

每个工具都旨在解决团队预见到的模型可能面临的特定问题。当时的假设是，模型会在复杂的模式中迷失方向，做出错误的连接，或者幻觉出表名。

### 精简架构（两个原始工具）

精简后的系统包含：
- ExecuteCommand: 在沙箱中执行任意 Bash 命令
- ExecuteSQL: 对数据库执行 SQL 查询

智能体现在使用标准的 Unix 工具探索语义层：

```python
from vercel_sandbox import Sandbox

sandbox = Sandbox.create()
await sandbox.write_files(semantic_layer_files)

def execute_command(command: str):
    """在沙箱中执行任意 Bash 命令。"""
    result = sandbox.exec(command)
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.exit_code
    }
```

智能体现在使用 `grep`、`cat`、`find` 和 `ls` 来导航包含维度定义、度量计算和连接关系的 YAML、Markdown 和 JSON 文件。

### 对比结果

| 指标 | 原始架构 (17 个工具) | 精简架构 (2 个工具) | 变化 |
|--------|---------------------|-------------------|--------|
| 平均执行时间 | 274.8s | 77.4s | 快 3.5 倍 |
| 成功率 | 80% (4/5) | 100% (5/5) | +20% |
| 平均 Token 使用量 | ~102k tokens | ~61k tokens | 减少 37% |
| 平均步骤数 | ~12 步 | ~7 步 | 减少 42% |

原始架构中最糟糕的情况：724 秒，100 个步骤，145,463 个 Token，且最终失败。精简后的架构在 141 秒内通过 19 个步骤和 67,483 个 Token 成功完成了同样的查询。

## 为什么精简有效

### 文件系统是强大的抽象

文件系统经过了 50 多年的精炼。像 `grep` 这样的标准 Unix 工具文档齐全、可预测，且被模型深刻理解。为 Unix 已经解决的问题构建自定义工具只会增加复杂性而没有价值。

### 工具约束了推理

专用工具解决的是模型本身可以处理的问题：
- 预过滤模型可以自行导航的上下文
- 限制模型可以评估的选项
- 将交互包装在模型并不需要的验证逻辑中

每个护栏都变成了维护负担。每次模型更新都需要重新校准约束。团队花在维护脚手架上的时间比改进智能体的时间还要多。

### 良好的文档取代了工具的复杂性

语义层本身就已经文档齐全：
- 结构化 YAML 中的维度定义
- 命名清晰的度量计算
- 可导航文件中的连接关系

自定义工具只是在总结那些原本就很清晰的内容。模型需要的是直接阅读文档的权限，而不是建立在文档之上的抽象。

## 实现模式

### 文件系统智能体

```python
from ai import ToolLoopAgent, tool
from sandbox import Sandbox

# 创建包含数据层的沙箱环境
sandbox = Sandbox.create()
await sandbox.write_files(data_layer_files)

# 单一原始工具
def create_execute_tool(sandbox):
    return tool(
        name="execute_command",
        description="""
        在沙箱环境中执行 Bash 命令。
        
        使用标准 Unix 工具探索和理解数据层：
        - ls: 列出目录内容
        - cat: 读取文件内容
        - grep: 搜索模式
        - find: 查找文件
        
        沙箱包含语义层文档：
        - /data/entities/*.yaml: 实体定义
        - /data/measures/*.yaml: 度量计算
        - /data/joins/*.yaml: 连接关系
        - /docs/*.md: 补充文档
        """,
        execute=lambda command: sandbox.exec(command)
    )

# 极简智能体
agent = ToolLoopAgent(
    model="claude-opus-4.5",
    tools={
        "execute_command": create_execute_tool(sandbox),
        "execute_sql": sql_tool,
    }
)
```

### 成功的先决条件

此模式在以下情况下奏效：

1. **文档质量高**：文件结构良好、命名一致且包含清晰的定义。
2. **模型能力足够**：模型可以在没有手把手引导的情况下推理复杂性。
3. **安全约束允许**：沙箱限制了智能体可以访问和修改的内容。
4. **领域可导航**：问题空间可以通过文件检查来探索。

### 何时不使用

精简在以下情况下会失败：

1. **数据层混乱**：遗留的命名规范、未记录的连接、不一致的结构。模型只会更快地产生糟糕的查询。
2. **需要专业知识**：无法在文件中记录的领域专业知识。
3. **安全需要限制**：出于安全或合规性考虑必须严格限制的操作。
4. **工作流真正复杂**：受益于结构化编排的多步骤过程。

## 设计原则

### 以减为增（Addition by Subtraction）

最好的智能体可能是工具最少的智能体。每一个工具都是为模型做出的选择。有时，当给予模型原始能力而不是受限的工作流时，模型能做出更好的选择。

### 信任模型推理

现代模型可以处理复杂性。因为不信任模型的推理能力而约束推理通常适得其反。在构建护栏之前，先测试模型实际能做什么。

### 投资于上下文，而非工具

基础比精巧的工具更重要：
- 清晰的文件命名规范
- 结构良好的文档
- 一致的数据组织
- 清晰的关系定义

### 为未来的模型构建

模型的进步速度超过了工具的更新速度。为今天的模型局限性优化的架构可能会对明天的模型能力产生过度约束。构建能从模型改进中受益的极简架构。

## 评估框架

在考虑架构精简时，评估：

1. **维护开销**：花在维护工具与改进产出上的时间比例是多少？
2. **故障分析**：故障是由模型局限性还是工具约束引起的？
3. **文档质量**：如果给予模型访问权限，它能否直接导航你的数据层？
4. **约束必要性**：护栏是在防范真实风险还是假设的顾虑？
5. **模型能力**：自工具设计以来，模型是否有所改进？

## 结论

架构精简并非普适，但这一原则挑战了一个普遍假设：更复杂的工具必然带来更好的结果。有时事实恰恰相反。从最简单的架构开始，仅在证明必要时增加复杂性，并持续质疑工具是在赋能还是在约束模型的能力。

## 参考资料

- Vercel Engineering: "We removed 80% of our agent's tools" (2025年12月)
- AI SDK ToolLoopAgent 文档
- Vercel Sandbox 文档

