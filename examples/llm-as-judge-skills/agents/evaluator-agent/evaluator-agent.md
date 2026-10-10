# 评估智能体

## 用途

评估智能体根据可配置的评价标准判断大语言模型回复质量，支持直接评分和成对比较两种 LLM-as-a-Judge 方法。

## 智能体定义

```typescript
import { ToolLoopAgent } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { evaluationTools } from "../tools";

export const evaluatorAgent = new ToolLoopAgent({
  name: "evaluator",
  model: anthropic("claude-sonnet-4-20250514"),
  instructions: `你是一名大语言模型输出质量评审员。

工作职责：
1. 根据明确标准评估回复质量。
2. 给出结构化分数和理由。
3. 指出具体问题与优点。
4. 按要求比较多个回复。

评估原则：客观一致；引用回复中的具体证据；考虑原任务要求；避免位置偏差；除非内容确实更有价值，不要仅因回复更长而偏好它。

始终提供每项标准的数值评分、支持判断的具体示例，以及可执行的改进建议。`,
  tools: {
    directScore: evaluationTools.directScore,
    pairwiseCompare: evaluationTools.pairwiseCompare,
    extractCriteria: evaluationTools.extractCriteria,
    generateRubric: evaluationTools.generateRubric
  }
});
```

## 能力

### 直接评分

按预先定义的标准和评分规则评估单份回复。输入为待评估回复、原始提示/上下文、评价标准和评分规则；输出为每项标准的 1—5 分、总分、详细理由、问题和优点。

### 成对比较

比较回复 A 和回复 B，选择更好者。输出包括 A/B/平局、置信度、比较分析和关键差异。

### 提取评价标准

根据任务描述、领域背景和质量要求自动提取标准、说明及建议权重。

### 生成评分规则

根据标准名称、质量维度和评分范围（默认 1—5）生成各级描述、示例和边界情况指导。

## 配置

```typescript
interface EvaluatorConfig {
  scoringMode: "direct" | "pairwise";
  useChainOfThought: boolean;
  nShotExamples: number;
  swapPositionsForPairwise: boolean;
  normalizeForLength: boolean;
  includeJustification: boolean;
  includeExamples: boolean;
  outputFormat: "structured" | "prose";
}

const defaultConfig: EvaluatorConfig = {
  scoringMode: "direct",
  useChainOfThought: true,
  nShotExamples: 2,
  swapPositionsForPairwise: true,
  normalizeForLength: false,
  includeJustification: true,
  includeExamples: true,
  outputFormat: "structured"
};
```

## 使用示例

直接评分时提供原始问题、回复和准确性、清晰度、吸引力、完整性等标准。成对比较时提供两个回复及比较标准，并要求说明判断理由。

## 集成场景

- 内容生成流程：交付前评估输出。
- 模型比较：比较不同模型的回复。
- 质量监控：长期追踪回复质量。
- 微调数据：生成 RLHF 偏好数据。
