# 大语言模型评估器

## 概述

LLM-as-a-Judge 是使用大语言模型评估另一模型回复质量的方法。本技能介绍构建评估系统的基础知识。

## 关键考虑

### 基线选择

- **人工标注者**：目标是让模型评审与人工的相关性接近人工之间的一致性。模型评审速度快、成本低。
- **微调分类器**：目标是达到专用分类器相近的召回率和精确率；这类基线已针对具体任务优化，更难超越。

### 评分方式

| 方法 | 适用场景 | 可靠性特点 |
| --- | --- | --- |
| 直接评分 | 事实性、毒性、指令遵循等客观任务 | 更适合分类判断 |
| 成对比较 | 语气、说服力、连贯性等主观偏好 | 更适合偏好任务 |
| 参考答案比较 | 与黄金标准答案比较 | 需要真实参考答案 |

### 评估指标

二元任务优先考虑分类指标：召回率、精确率、F1 和 Cohen's κ。Likert 量表任务可使用 Spearman's ρ 和 Kendall's τ 等相关性指标。

## 已知偏差

1. **位置偏差**：成对比较时偏好排在某一位置的答案，通常是第一个。
2. **冗长偏差**：即使质量不高，也偏好更长的回复。
3. **自我偏好**：评审模型偏好自己生成的答案。

## 缓解方法

- 交换回复顺序并合并结果。
- 适当按长度归一化。
- 使用多个大语言模型组成评审小组（PoLL）。
- 提醒模型不要过度推理。
- 使用思维链和少样本示例提高一致性。

## 实现结构

```typescript
interface EvaluatorConfig {
  scoringApproach: 'direct' | 'pairwise' | 'reference-based';
  criteria: EvaluationCriteria[];
  metrics: MetricType[];
  useCoT: boolean;
  nShot: number;
}

interface EvaluationCriteria {
  name: string;
  description: string;
  rubric: RubricLevel[];
}

interface RubricLevel {
  score: number;
  description: string;
}
```

## 参考研究

- Constitutional AI（Anthropic）
- G-Eval：使用 GPT-4 评估自然语言生成
- SelfCheckGPT：零资源幻觉检测
- Prometheus：细粒度评估能力
- MT-Bench 与 Chatbot Arena
