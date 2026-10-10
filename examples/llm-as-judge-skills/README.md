# 大语言模型评审技能示例

> 基于 Eugene Yan 的 LLM-Evaluators 研究和 Vercel AI SDK 6 构建的 LLM 评估技能实现示例。

本仓库展示如何把研究洞见转化为可用于生产的 LLM 评估技能，是智能体上下文工程项目的一部分。

## 项目目的

1. **技能开发**：将研究成果转化为可执行智能体技能。
2. **工具设计**：为 AI 工具设计恰当的数据结构和错误处理。
3. **评估模式**：实现用于质量评估的 LLM-as-a-Judge 模式。

项目依赖 `context-fundamentals` 和 `tool-design` 等基础技能。

## 背景与研究

评估 AI 生成内容具有挑战性，BLEU、ROUGE 等传统指标常常捕捉不到重要细节。Eugene Yan 的 LLM-Evaluators 研究总结了使用大语言模型评审输出的实用模式。本示例采用以下做法：

| 研究洞见 | 实现方式 |
| --- | --- |
| 直接评分适合客观标准 | 提供支持评分规则的 `directScore` 工具 |
| 主观偏好更适合成对比较 | 提供会交换答案位置的 `pairwiseCompare` 工具 |
| 位置会造成判断偏差 | 比较时自动交换 A/B 位置 |
| 展示推理依据能提升可靠性 | 每次评估都要求提供证据和理由 |
| 清晰评分规则可减少差异 | 用 `generateRubric` 生成一致标准 |

项目使用 AI SDK 6 的模式：可复用的 `EvaluatorAgent`、基于 Zod 的类型安全工具、经过解析和验证的结构化 JSON 输出，以及 API 失败时的平稳降级。

## 架构

```text
技能文档 → 提示词模板 → TypeScript 工具
                    ↘ EvaluatorAgent → GPT API
```

目录包括：

- `skills/`：评估、上下文基础和工具设计等基础知识。
- `prompts/`：直接评分、成对比较、研究综合和协调者系统提示。
- `tools/`：评估、研究及编排工具说明。
- `agents/`：评估、研究和协调者智能体说明。
- `src/`：TypeScript 实现。
- `tests/`：工具和技能测试。
- `examples/`：使用示例。

## 实现的核心工具

### 直接评分（`directScore`）

根据指定标准对单个回复评分，适用于事实准确性、指令遵循、内容质量和合规检查。支持加权标准、要求引用证据和解释理由、提取文本证据、提供改进建议，以及 1—3、1—5 和 1—10 等评分范围。

### 成对比较（`pairwiseCompare`）

比较两份回复，判断哪份更好，适用于 A/B 测试、偏好评估、风格和语气比较。默认会交换答案位置再评估，并检查两次结果是否一致；不一致时可返回平局并降低置信度。

### 生成评分规则（`generateRubric`）

按领域和严格程度生成评分标准，包括各等级说明、示例、评分指导和边界情况。

### 评估智能体

`EvaluatorAgent` 将上述工具整合为统一接口，支持评分、比较、生成评分规则、先生成规则再评分，以及对话式评估。

## 历史测试结果

上游示例记录曾有 19 项测试全部通过：评估工具 9 项，技能验证 10 项。该数字是历史记录，不代表当前工作区已重新运行测试。

## 快速开始

```bash
git clone https://github.com/muratcankoylan/llm-as-judge-skills.git
cd llm-as-judge-skills
npm install
```

在 `.env` 中配置：

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.2
```

运行示例：

```bash
npm run build
npm test
```

基础用法：

```typescript
import { EvaluatorAgent } from './src/agents/evaluator';

const agent = new EvaluatorAgent();
const result = await agent.score({
  response: 'AI 生成的回复',
  prompt: '原始提示词',
  criteria: [
    { name: '准确性', description: '事实是否正确', weight: 1 }
  ]
});

console.log(result.overallScore);
```

## 与技能集合的关系

该示例展示“技能知识 → 提示词 → 可执行工具”的实现过程，并应用上下文基础、工具设计和智能体抽象。它是[智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)中的独立示例。

## 许可证与致谢

采用 MIT 许可证。感谢 Eugene Yan 的 LLM 评审研究、Vercel AI SDK，以及智能体上下文工程技能集。
