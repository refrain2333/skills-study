---
name: advanced-evaluation
description: "This skill should be used for advanced LLM evaluation: LLM-as-judge systems, direct scoring, pairwise comparison, rubric calibration, evaluator bias mitigation, confidence scoring, and automated quality assessment."
---

> 本文是同目录 `SKILL.md` 的中文翻译；安装和调用时以 `SKILL.md` 为准。

# 高级评估

本技能涵盖使用 LLM 作为判官评估 LLM 输出的生产级技术，将学术论文、行业实践和实际实现经验综合为构建可靠评估系统的可操作模式。

**关键洞见**：LLM 判官不是单一技术，而是一组适用于不同评估场景的方法。掌握如何选择合适方法并缓解已知偏差，是本技能的核心。

## 何时启用

在以下情况下启用本技能：

- 为 LLM 输出构建 LLM 判官系统
- 比较多个模型响应并选出最佳结果
- 在评估团队间建立一致的质量标准
- 调试结果不稳定的评估系统
- 为提示词或模型变更设计 A/B 测试
- 专门为 LLM 判官或人工与 LLM 混合判官创建评分标准
- 分析自动化判断与人工判断之间的相关性

以下相邻工作由其他技能负责，不要为它们启用本技能：

- 通用确定性检查、回归套件、生产质量门禁或结果指标：`evaluation`。
- 自主循环治理、锁定评分标准、回滚或 PR 审批边界：`harness-engineering`。
- 评估工具的工具 API 契约：`tool-design`。

## 核心概念

### 评估方法分类

根据是否存在真实答案，在两种主要方法中选择：

**直接评分** —— 当存在客观标准时使用（事实准确性、指令遵循、毒性检测）。单个 LLM 按定义好的量表给一条响应评分。在标准定义清楚时可靠性中等至较高。需注意分数校准漂移以及量表解释不一致。

**成对比较** —— 用于主观偏好（语气、风格、说服力）。LLM 比较两条响应并选出更好的一条。对于主观任务，成对方法往往比开放式直接评分更符合人类偏好（claim-advanced-evaluation-position-swap）。需注意位置偏差和长度偏差。

### 偏差类型

每个评估系统都应缓解以下系统性偏差：

**位置偏差**：排在第一位的响应更容易获得偏爱。缓解方法：交换顺序评估两次，然后采用多数投票或一致性检查。

**长度偏差**：较长的响应不论质量如何都容易获得更高评分。缓解方法：在提示词中明确要求忽略长度，并使用按长度归一化的评分。

**自我增强偏差**：模型更偏爱自己的输出。缓解方法：生成模型与评估模型使用不同模型。

**冗长偏差**：即使内容不必要，过多细节也可能得到更高评分。缓解方法：使用针对具体标准的评分标准，对无关细节扣分。

**权威偏差**：无论准确性如何，自信的语气更容易得到高分。缓解方法：要求引用证据并增加事实核查层。

### 指标选择框架

根据评估任务结构匹配指标：

| 任务类型 | 主要指标 | 次要指标 |
|-----------|-----------------|-------------------|
| 二元分类（通过/失败） | 召回率、精确率、F1 | Cohen's kappa |
| 序数量表（1–5 分） | Spearman's rho、Kendall's tau | Cohen's kappa（加权） |
| 成对偏好 | 一致率、位置一致性 | 置信度校准 |
| 多标签 | Macro-F1、Micro-F1 | 各标签的精确率/召回率 |

相较于绝对一致率，应优先关注系统性的分歧模式，因为判官若在特定标准上持续与人类意见不同，比随机噪声更值得担忧。

## 评估方法

### 实现直接评分

直接评分需要三个组成部分：清晰的评估标准、经过校准的量表，以及结构化输出格式。

**评估标准定义模板**：
```
Criterion: [Name]
Description: [What this criterion measures]
Weight: [Relative importance, 0-1]
```

**量表校准** —— 根据评分标准的细致程度选择量表粒度：
- 1–3：带中立选项的二元判断，认知负担最低
- 1–5：标准李克特量表，在粒度与可靠性之间最平衡
- 1–10：只有在每个分值都有详细说明时才使用，因为校准更困难

**直接评分提示词结构**：
```
You are an expert evaluator assessing response quality.

## Task
Evaluate the following response against each criterion.

## Original Prompt
{prompt}

## Response to Evaluate
{response}

## Criteria
{for each criterion: name, description, weight}

## Instructions
For each criterion:
1. Find specific evidence in the response
2. Score according to the rubric (1-{max} scale)
3. Justify your score with evidence
4. Suggest one specific improvement

## Output Format
Respond with structured JSON containing scores, justifications, and summary.
```

在评分提示词中要求先找出证据再打分，让判官先依据输出中可观察到的特征作判断，再给出数字。

### 实现成对比较

每次成对评估都要缓解位置偏差：

1. 先运行确定性预检查：两个候选都必须符合相同的模式、来源证据要求和范围限制。
2. 第一轮判定：响应 A 放在第一位，响应 B 放在第二位。
3. 第二轮判定：响应 B 放在第一位，响应 A 放在第二位。
4. 一致性检查：两轮意见不同时，返回 TIE（平局），并降低置信度。
5. 最终结论：若胜者一致，则采用胜者、平均置信度，并明确说明平局判定依据。

**成对比较提示词结构**：
```
You are an expert evaluator comparing two AI responses.

## Critical Instructions
- Do NOT prefer responses because they are longer
- Do NOT prefer responses based on position (first vs second)
- Focus ONLY on quality according to the specified criteria
- Ties are acceptable when responses are genuinely equivalent

## Original Prompt
{prompt}

## Response A
{response_a}

## Response B
{response_b}

## Comparison Criteria
{criteria list}

## Instructions
1. Analyze each response independently first
2. Compare them on each criterion
3. Determine overall winner with confidence level

## Output Format
JSON with per-criterion comparison, overall winner, confidence (0-1), and reasoning.
```

**置信度校准** —— 根据位置一致性映射置信度：
- 两轮意见一致：置信度为两轮各自置信度的平均值
- 两轮意见不一致：置信度 = 0.5，结论 = TIE（平局）

### 生成评分标准

与开放式评分相比，生成评分标准有助于减少评估差异。除非在目标评估集上实际测量过，否则应将具体的差异缩减幅度视为依工作负载而定。

**评分标准应包含以下组成部分**：
1. **等级描述**：清楚说明各分值等级的界限
2. **特征**：定义各等级的可观察特征
3. **示例**：各等级的代表性文本（可选，但很有帮助）
4. **边缘情况**：说明如何处理模糊情况
5. **评分指南**：帮助一致应用评分标准的一般原则

**根据使用场景校准严格程度**：
- **宽松**：通过门槛较低，适合鼓励迭代
- **平衡**：符合一般生产要求
- **严格**：适用于安全关键或高风险评估

评分标准要适配领域，并使用领域特定的术语。代码可读性评分标准会提及变量、函数和注释；医疗准确性评分标准则会引用临床术语和证据标准。

## 实践指南

### 评估流水线设计

生产级评估系统应包含以下层次：标准加载器（评分标准 + 权重）→ 主评分器（直接评分或成对比较）→ 偏差缓解（交换位置等）→ 置信度评分（校准）→ 输出（分数 + 理由 + 置信度）。完整结构见[评估流水线图](./references/evaluation-pipeline.md)。

### 决策框架：直接评分还是成对比较

按以下决策树选择：

```
Is there an objective ground truth?
+-- Yes -> Direct Scoring
|   Examples: factual accuracy, instruction following, format compliance
|
+-- No -> Is it a preference or quality judgment?
    +-- Yes -> Pairwise Comparison
    |   Examples: tone, style, persuasiveness, creativity
    |
    +-- No -> Consider reference-based evaluation
        Examples: summarization (compare to source), translation (compare to reference)
```

### 扩展评估规模

对于大量评估，可采用以下策略之一：

1. **LLM 判官小组（PoLL）**：使用多个模型作为判官并汇总投票，以减少单个模型的偏差。成本更高，但对高风险决策更可靠。

2. **分层评估**：先用快速、低成本的模型筛查，再用昂贵模型处理边缘情况。需要校准筛查阈值。

3. **人工介入**：自动处理明确案例，并将低置信度判断交给人工审核。设计反馈循环，逐步改进自动评估。

## 示例

### 示例 1：准确性直接评分

**输入**：
```
Prompt: "What causes seasons on Earth?"
Response: "Seasons are caused by Earth's tilted axis. As Earth orbits the Sun,
different hemispheres receive more direct sunlight at different times of year."
Criterion: Factual Accuracy (weight: 1.0)
Scale: 1-5
```

**输出**：
```json
{
  "criterion": "Factual Accuracy",
  "score": 5,
  "evidence": [
    "Correctly identifies axial tilt as primary cause",
    "Correctly explains differential sunlight by hemisphere",
    "No factual errors present"
  ],
  "justification": "Response accurately explains the cause of seasons with correct
scientific reasoning. Both the axial tilt and its effect on sunlight distribution
are correctly described.",
  "improvement": "Could add the specific tilt angle (23.5 degrees) for completeness."
}
```

### 示例 2：交换位置的成对比较

**输入**：
```
Prompt: "Explain machine learning to a beginner"
Response A: [Technical explanation with jargon]
Response B: [Simple analogy-based explanation]
Criteria: ["clarity", "accessibility"]
```

**第一轮（A 在前）**：
```json
{ "winner": "B", "confidence": 0.8 }
```

**第二轮（B 在前）**：
```json
{ "winner": "A", "confidence": 0.6 }
```
（注意：由于 B 排在第一位，这里的胜者 A 对应原始响应 B。）

**将第二轮结果映射回原始响应**：
```json
{ "winner": "B", "confidence": 0.6 }
```

**最终结果**：
```json
{
  "winner": "B",
  "confidence": 0.7,
  "positionConsistency": {
    "consistent": true,
    "firstPassWinner": "B",
    "secondPassWinner": "B"
  }
}
```

### 示例 3：生成评分标准

**输入**：
```
criterionName: "Code Readability"
criterionDescription: "How easy the code is to understand and maintain"
domain: "software engineering"
scale: "1-5"
strictness: "balanced"
```

**输出**（节选）：
```json
{
  "levels": [
    {
      "score": 1,
      "label": "Poor",
      "description": "Code is difficult to understand without significant effort",
      "characteristics": [
        "No meaningful variable or function names",
        "No comments or documentation",
        "Deeply nested or convoluted logic"
      ]
    },
    {
      "score": 3,
      "label": "Adequate",
      "description": "Code is understandable with some effort",
      "characteristics": [
        "Most variables have meaningful names",
        "Basic comments present for complex sections",
        "Logic is followable but could be cleaner"
      ]
    },
    {
      "score": 5,
      "label": "Excellent",
      "description": "Code is immediately clear and maintainable",
      "characteristics": [
        "All names are descriptive and consistent",
        "Comprehensive documentation",
        "Clean, modular structure"
      ]
    }
  ],
  "edgeCases": [
    {
      "situation": "Code is well-structured but uses domain-specific abbreviations",
      "guidance": "Score based on readability for domain experts, not general audience"
    }
  ]
}
```

## 指南

1. **打分前必须先要求证据** —— 先列证据的提示词更容易审核，也能减少缺少依据的数字评分。

2. **成对比较时必须交换位置** —— 单轮比较会受到位置偏差影响。

3. **量表粒度应与评分标准的细致程度匹配** —— 没有详细等级说明时，不要使用 1–10 量表。

4. **分开处理客观标准和主观标准** —— 客观标准使用直接评分，主观标准使用成对比较。

5. **提供置信度分数** —— 根据位置一致性和证据强度进行校准。

6. **明确界定边缘情况** —— 模糊情形最容易造成评估差异。

7. **使用领域特定的评分标准** —— 通用标准会产生通用、较不实用的评估。

8. **与人工判断进行验证** —— 只有自动评估与人工评估相关时，它才有价值。

9. **监控系统性偏差** —— 按评估标准、响应类型和模型追踪分歧模式。

10. **按迭代改进来设计** —— 反馈循环可以逐步改善评估系统。

## 注意事项

1. **评分却不给理由**：评分缺少依据，难以调试。必须先要求给出基于证据的理由，再给分。

2. **只做一轮成对比较**：不交换位置就会受到位置偏差影响。必须交换位置评估两次并检查一致性。

3. **标准涵盖过多内容**：一个标准同时衡量多件事，会导致评分不可靠。确保一个标准只对应一个可测量方面。

4. **缺少边缘情况说明**：没有明确指导时，评估者会以不一致的方式处理模糊案例。应在评分标准中加入边缘案例及其明确处理规则。

5. **忽略置信度校准**：高置信度的错误判断比低置信度判断更糟。应根据位置一致性和证据强度校准置信度。

6. **评分标准漂移**：质量标准演变或模型能力提升后，评分标准会逐渐失准。应定期审查评分标准，并用新的人工作标注示例重新锚定分值等级。

7. **评估提示词敏感性**：提示词中细微的措辞变化也可能导致分数明显波动。对评估提示词进行版本控制，并在部署提示词改动前运行回归测试。

8. **长度偏差不受控制**：即使更简洁更可取，较长响应也会系统性地得到更高评分。在评估提示词中明确要求对长度保持中立，并使用控制长度的测试对进行验证。

## 集成

本技能负责判官设计和偏差缓解。相邻技能负责更广泛的质量门禁和基础设施：

- `evaluation`：通用确定性检查、回归套件、质量门禁和生产监控。
- `context-fundamentals`：判官提示词的上下文结构。
- `tool-design`：评估工具的模式和错误处理。
- `context-optimization`：大规模评估中的 Token 与延迟效率。
- `harness-engineering`：自主循环中锁定的评估器界面和治理。

## 参考资料

内部参考：
- [LLM 判官实现模式](./references/implementation-patterns.md) - 在以下情况下阅读：从头构建评估流水线，或将 LLM 判官集成到 CI/CD。
- [偏差缓解技术](./references/bias-mitigation.md) - 在以下情况下阅读：评估结果显示评分不一致或可疑模式。
- [指标选择指南](./references/metrics-guide.md) - 在以下情况下阅读：选择用于验证评估可靠性的统计指标。
- [评估流水线图](./references/evaluation-pipeline.md) - 在以下情况下阅读：设计多阶段评估系统的架构。

外部研究：
- [Eugene Yan：评估 LLM 评估器的有效性](https://eugeneyan.com/writing/llm-evaluators/) - 在以下情况下阅读：了解 LLM 评估领域的最新进展。
- [Judging LLM-as-a-Judge（Zheng 等，2023）](https://arxiv.org/abs/2306.05685) - 在以下情况下阅读：了解位置偏差和 MT-Bench 方法。
- [G-Eval：使用 GPT-4 评估 NLG（Liu 等，2023）](https://arxiv.org/abs/2303.16634) - 在以下情况下阅读：实现链式思考评估评分。
- [大型语言模型并非公平的评估者（Wang 等，2023）](https://arxiv.org/abs/2305.17926) - 在以下情况下阅读：诊断评估输出中的系统性偏差。

本合集中的相关技能：
- evaluation - 评估基础概念
- context-fundamentals - 评估提示词的上下文结构
- tool-design - 构建评估工具

---

## 技能元数据

**创建时间**：2025-12-24  
**最后更新**：2026-05-15  
**作者**：Agent Skills for Context Engineering Contributors  
**版本**：2.1.0
