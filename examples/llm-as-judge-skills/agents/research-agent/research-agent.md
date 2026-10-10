# 研究智能体

## 用途

研究智能体从多个来源收集、核验和综合信息，以回答复杂研究问题；执行多步骤研究流程，并追踪引用来源。

## 智能体定义

```typescript
import { ToolLoopAgent } from "ai";
import { openai } from "@ai-sdk/openai";
import { researchTools } from "../tools";

export const researchAgent = new ToolLoopAgent({
  name: "researcher",
  model: openai("gpt-4o"),
  instructions: `你是一名研究分析员。

职责：把复杂问题拆成可检索查询；从多个来源收集资料；核验并交叉引用主张；综合发现；为主张提供适当引用。

研究方法：先用宽泛搜索了解领域，再深入具体来源；尽可能从多个来源核验事实；区分事实、主张和观点；记录来源时效与权威性。

质量要求：不得编造信息或来源；明确说明不确定性；精确性重要时引用原文；为可核验的主张提供来源网址或引用。`,
  tools: {
    webSearch: researchTools.webSearch,
    readUrl: researchTools.readUrl,
    extractClaims: researchTools.extractClaims,
    verifyClaim: researchTools.verifyClaim,
    synthesize: researchTools.synthesize
  }
});
```

## 能力

- **网页搜索**：输入查询和可选日期/来源类别筛选；返回相关结果、摘要、网址和来源元数据。
- **读取网址**：输入网址和内容类别；返回正文、关键章节及发布元数据。
- **提取主张**：输入来源文本和目标主张类别；返回主张列表、置信度和支持上下文。
- **核验主张**：输入待核验主张及原始来源；返回核验状态、支持/反对来源和置信度。
- **综合研究**：输入研究发现、目标格式和关键问题；返回综合摘要、洞见和引用。

## 配置

```typescript
interface ResearchConfig {
  maxSearchResults: number;
  preferredSources: string[];
  excludedDomains: string[];
  minSourcesForVerification: number;
  requireRecentSources: boolean;
  maxSourceAge: "1month" | "6months" | "1year" | "any";
  citationStyle: "inline" | "footnote" | "endnote";
  summaryLength: "brief" | "standard" | "comprehensive";
  includeSourceQuality: boolean;
}
```

默认最多取 10 条结果，至少两个来源用于核验；不强制来源必须近期；引用采用行内格式；摘要使用标准长度，并纳入来源质量评估。

## 使用示例

研究 LLM 评估实践时，可依次回答：主要评估方法有哪些？人工评估有哪些限制？LLM 评估器与人类相比有多可靠？实施 LLM-as-a-Judge 的最佳实践是什么？最终提供带引用的综合摘要。

## 研究流程

```text
研究问题 → 拆分查询 → 初步搜索 → 选择来源 → 深入阅读
        → 提取主张 → 交叉核验 → 综合 → 最终报告
```

## 集成场景

用于构建知识库、事实核验、市场研究和技术实现方案调查。
