# 协调者智能体

## 用途

协调者智能体通过委派给专用智能体、协调各方输出并管理依赖，完成复杂工作流，是多智能体操作的主要入口。

## 智能体定义

```typescript
import { ToolLoopAgent } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { orchestrationTools } from "../tools";

export const orchestratorAgent = new ToolLoopAgent({
  name: "orchestrator",
  model: anthropic("claude-sonnet-4-20250514"),
  instructions: `你是一名工作流协调专家。

职责：分析复杂任务并拆分子任务；把子任务交给合适的专用智能体；协调输出和依赖；综合结果；妥善处理错误和重试。

原则：按能力要求拆分；可能时并行执行独立工作；交接时保持必要上下文；继续之前检查中间结果；长任务中提供状态；出错时恢复，不要直接放弃整体流程。

可用智能体：evaluator 评估输出；researcher 收集和综合信息；writer 创作并润色内容；analyst 分析数据和洞见。

委派时提供完整上下文、预期输出格式和明确的成功标准。`,
  tools: {
    delegateToAgent: orchestrationTools.delegateToAgent,
    parallelExecution: orchestrationTools.parallelExecution,
    waitForCompletion: orchestrationTools.waitForCompletion,
    synthesizeResults: orchestrationTools.synthesizeResults,
    handleError: orchestrationTools.handleError
  }
});
```

## 能力

- **任务委派**：输入智能体名称、任务、上下文/依赖和输出格式；返回智能体回复、执行元数据和状态。
- **并行执行**：输入多个（智能体、任务）组合及超时；返回各任务结果、状态和错误。
- **结果综合**：输入多智能体输出、综合指令和目标格式；返回综合结果、来源归属和置信度。
- **错误处理**：输入失败任务、错误详情和重试规则；返回重试结果、平稳降级方案或升级处理。

## 配置

```typescript
interface OrchestratorConfig {
  maxParallelTasks: number;
  defaultTimeout: number;
  retryPolicy: RetryPolicy;
  validateIntermediateOutputs: boolean;
  evaluateBeforeDelivery: boolean;
  enableProgressUpdates: boolean;
  updateFrequency: number;
}

interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}
```

默认并行任务数为 5，超时 60,000 毫秒，最多重试 3 次，退避倍率为 2；对 `RATE_LIMIT`、`TIMEOUT` 和 `TEMPORARY_ERROR` 重试。默认验证中间输出、开启进度更新，每 5,000 毫秒更新一次。

## 使用示例

用户要求研究 LLM 评估实践、分析方法权衡、撰写建议报告并评估报告质量时，协调者可依次或并行委派研究、分析、写作和评估任务。

## 编排模式

- **顺序流水线**：研究 → 分析 → 写作 → 评估 → 最终输出。
- **并行汇总**：多个独立智能体同时完成子任务，再综合结果。
- **迭代优化**：评估未通过时把反馈交回智能体，直到达标。

## 集成场景

可作为复杂请求的 API 网关入口，配合任务队列处理长任务，并使用监控与审计日志追踪多智能体执行。
