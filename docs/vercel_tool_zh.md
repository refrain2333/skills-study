---
name: vercel-tool-reduction
description: Vercel的案例研究，通过删除80%的agent特化工具并将其替换为单个文件系统agent工具，实现了100%成功率并改进了性能。
doc_type: blog
source_url: https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools
---

# 我们删除了80%的Agent工具

**作者**：Andrew Qu，Vercel首席软件官  
**发布时间**：2025年12月22日  
**阅读时间**：4分钟

> 它变得更好了。

## 问题：复杂架构的脆弱性

我们花了几个月时间构建了一个复杂的内部文本转SQL agent——d0，配备了专门工具、大量的提示词工程和仔细的上下文管理。它工作...差不多。但它很脆弱、缓慢，需要不断的维护。

## 解决方案：激进的简化

所以我们尝试了不同的做法。我们删除了大部分代码，将agent简化到单个工具：执行任意的bash命令。我们称这为文件系统agent。Claude可以直接访问你的文件，并使用grep、cat和ls来解决问题。

**结果令人惊人**：agent同时变得更简单和更好。成功率从80%提高到100%。更少的步骤、更少的令牌、更快的响应。一切都通过做更少的工作实现了。

---

## d0是什么

如果v0是我们用于构建UI的AI，那么d0就是我们用于理解数据的AI。

d0让任何人通过在Slack中提问来做出数据驱动的决策。它将自然语言问题转换为针对我们分析基础设施的SQL查询，让团队的任何人都可以获取答案，无需编写代码或等待数据团队。

当d0工作良好时，它会在整个公司民主化数据访问。当它崩溃时，人们失去信心，回到在Slack中ping分析师。我们需要d0快速、准确和可靠。

---

## 摆脱模型的方式

回顾过去，我们在解决模型能够自己处理的问题。我们假设它会在复杂的模式中迷失，做出糟糕的连接，或幻觉表名。所以我们构建了护栏。我们预过滤了上下文，限制了它的选项，并用验证逻辑包裹了每个交互。我们在为模型思考：

- 构建了多个专门工具(模式查询、查询验证、错误恢复等)
- 添加了大量的提示词工程来限制推理
- 利用仔细的上下文管理来避免压倒模型
- 编写了手工编码的检索来表面"相关"的模式信息和维度属性

每个边界案例都意味着另一个补丁，每个模型更新都意味着重新校准我们的限制。我们花在维护脚手架上的时间比改进agent的时间还多。

### 旧架构代码示例

```typescript
import { ToolLoopAgent } from 'ai';
import { GetEntityJoins, LoadCatalog, /*...*/ } from '@/lib/tools'

const agent = new ToolLoopAgent({
  model: "anthropic/claude-opus-4.5",
  instructions: "",
  tools: {
      GetEntityJoins, LoadCatalog, RecallContext, LoadEntityDetails, 
      SearchCatalog, ClarifyIntent, SearchSchema, GenerateAnalysisPlan, 
      FinalizeQueryPlan, FinalizeNoData, JoinPathFinder, SyntaxValidator, 
      FinalizeBuild, ExecuteSQL, FormatResults, VisualizeData, ExplainResults
    },
});
```

---

## 一个新想法：如果我们干脆停止呢？

我们意识到我们在对抗重力。限制模型的推理。总结它可以自己阅读的信息。构建工具来保护它免受它可以处理的复杂性的影响。

所以我们停止了。假设是，如果我们只是给Claude原始Cube DSL文件的访问权限并让它自己解决呢？如果bash就是你所需要的呢？模型变得越来越聪明，上下文窗口越来越大，也许最好的agent架构几乎没有架构。

---

## v2：文件系统即agent

### 新堆栈

- **模型**：Claude Opus 4.5通过AI SDK
- **执行**：Vercel Sandbox用于上下文探索
- **路由**：Vercel Gateway用于请求处理和可观测性
- **服务器**：使用Vercel Slack Bolt的Next.js API路由
- **数据层**：Cube语义层作为YAML、Markdown和JSON文件的目录

### 工作原理

文件系统agent现在像人类分析师一样浏览我们的语义层。它读取文件、grep搜索模式、构建心理模型，并使用标准Unix工具如grep、cat、find和ls来编写SQL。

这之所以工作是因为语义层已经是很好的文档。文件包含维度定义、度量计算和连接关系。我们构建的工具是对已经易读的东西的总结。Claude只需要直接读取它的访问权限。

### 新架构代码示例

```typescript
import { Sandbox } from "@vercel/sandbox";
import { files } from './semantic-catalog'
import { tool, ToolLoopAgent } from "ai";
import { ExecuteSQL } from "@/lib/tools";

const sandbox = await Sandbox.create();
await sandbox.writeFiles(files);

const executeCommandTool(sandbox: Sandbox) {
  return tool({
    /* ... */
    execute: async ({ command }) => {
      const result = await sandbox.exec(command);
      return { /* */ };
    }
  })
}

const agent = new ToolLoopAgent({
  model: "anthropic/claude-opus-4.5",
  instructions: "",
  tools: {
    ExecuteCommand: executeCommandTool(sandbox),
    ExecuteSQL,
   },
})
```

---

## 结果：3.5倍更快，37%更少令牌，100%成功率

我们对旧架构与新文件系统方法进行了5个代表性查询的基准测试。

| 指标 | 高级(旧) | 文件系统(新) | 变化 |
|------|----------|------------|------|
| 平均执行时间 | 274.8秒 | 77.4秒 | **3.5倍更快** |
| 成功率 | 4/5 (80%) | 5/5 (100%) | **+20%** |
| 平均令牌使用 | ~102k令牌 | ~61k令牌 | **37%更少** |
| 平均步骤数 | ~12步 | ~7步 | **42%更少步骤** |

文件系统agent在每次比较中都赢了。旧架构的最坏情况是查询2，耗时724秒、100步和145,463个令牌后失败。文件系统agent完成相同的查询耗时141秒、19步和67,483个令牌，并且实际上成功了。

定性转变同样重要。agent捕捉到了我们从未预期的边界案例，并以我们可以遵循的方式解释其推理。

---

## 学到的教训

### 1. 不要对抗重力
文件系统是一个令人难以置信的强大抽象。Grep已经50岁了，仍然做我们需要的一切。我们为Unix已经解决的东西构建了自定义工具。

### 2. 我们因为不信任模型而限制推理
有了Opus 4.5，那个限制变成了一个负债。当我们停止为它做决定时，模型做出了更好的选择。

### 3. 这仅在语义层已经很好时工作
这仅在我们的语义层已经是很好的文档时工作。YAML文件结构良好、命名一致、包含清晰的定义。如果你的数据层是遗留命名约定和未文档连接的混乱，给Claude原始文件访问不会拯救你。你只会得到更快的糟糕查询。

### 4. 减法是真实的
最好的agents可能是那些工具最少的。每个工具都是你为模型做出的一个选择。有时模型做出更好的选择。

---

## 对Agent构建者的含义

诱惑总是要说明每种可能性。抵制它。从最简单可能的架构开始。模型+文件系统+目标。仅当你已经证明它必要时才添加复杂性。

但仅有简单架构还不够。模型需要好的上下文来工作。投资于文档、清晰的命名和结构良好的数据。那个基础比聪明的工具更重要。

模型改进的速度比你的工具能跟上的还要快。为你在六个月内会有的模型构建，而不是为你今天有的模型。

---

## 总结

如果你正在构建agents，我们很想听听你在学什么。

通过删除80%的工具并信任模型处理文件系统，Vercel的d0实现了显著的改进。关键的洞察是：**有时候，做更少的工作导致更好的结果**。这是一个强有力的提醒，即在系统设计中，简单和信任往往胜过复杂和控制。
