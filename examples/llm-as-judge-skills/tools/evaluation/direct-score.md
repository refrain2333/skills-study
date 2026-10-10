# 直接评分工具

## 用途

根据评分规则和指定标准，对单份大语言模型回复进行评估。

## 工具定义

```typescript
export const directScore = tool({
  description: "根据准确性、完整性、清晰度或任务遵循等标准对回复评分，并返回结构化分数和理由。",
  parameters: z.object({
    response: z.string().describe("待评估回复"),
    prompt: z.string().describe("生成该回复的原始提示或指令"),
    context: z.string().optional().describe("补充上下文，如检索文档或对话历史"),
    criteria: z.array(z.object({
      name: z.string(),
      description: z.string(),
      weight: z.number().min(0).max(1).default(1)
    })).min(1),
    rubric: z.object({
      scale: z.enum(["1-3", "1-5", "1-10"]).default("1-5"),
      levelDescriptions: z.record(z.string(), z.string()).optional()
    }).optional()
  }),
  execute: async (input) => evaluateWithLLM(input)
});
```

## 输入字段

| 字段 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| `response` | string | 是 | 待评估回复 |
| `prompt` | string | 是 | 原始提示词 |
| `context` | string | 否 | 额外上下文，如检索资料或历史记录 |
| `criteria` | Criterion[] | 是 | 评价标准列表 |
| `rubric` | Rubric | 否 | 评分范围和等级说明 |

每项标准包括名称、衡量内容和 0—1 相对权重。

## 输出字段

结果包含 `success`、每项标准的分数/最高分/理由/具体例子、`overallScore`、`weightedScore`、优点/缺点/建议，以及评估耗时、标准数量和评分范围等元数据。

## 使用示例

```typescript
const result = await directScore.execute({
  response: "机器学习是人工智能的一个分支，使系统可以从数据中学习……",
  prompt: "向初学者解释机器学习",
  criteria: [
    { name: "准确性", description: "解释是否符合技术事实", weight: 0.4 },
    { name: "清晰度", description: "初学者是否容易理解", weight: 0.3 },
    { name: "完整性", description: "是否涵盖关键概念", weight: 0.3 }
  ],
  rubric: { scale: "1-5" }
});
```

## 实现建议

先要求模型给出理由，再给分，以减少偏差；用少样本示例校准各等级；必要时考虑回复长度。
