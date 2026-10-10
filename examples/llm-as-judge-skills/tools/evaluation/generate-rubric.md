# 生成评分规则工具

## 用途

为指定评价标准自动生成详细评分规则，使不同评估保持一致。

## 工具定义

```typescript
export const generateRubric = tool({
  description: "为评价标准生成各分值的详细说明，帮助建立一致的评估标准。",
  parameters: z.object({
    criterionName: z.string(),
    criterionDescription: z.string(),
    scale: z.enum(["1-3", "1-5", "1-10"]).default("1-5"),
    domain: z.string().optional(),
    includeExamples: z.boolean().default(true),
    strictness: z.enum(["lenient", "balanced", "strict"]).default("balanced")
  }),
  execute: async (input) => generateRubricWithLLM(input)
});
```

## 输入字段

| 字段 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| `criterionName` | string | 是 | 标准名称 |
| `criterionDescription` | string | 是 | 标准衡量内容 |
| `scale` | enum | 否 | 分值范围，默认 1—5 |
| `domain` | string | 否 | 领域背景 |
| `includeExamples` | boolean | 否 | 是否提供示例，默认是 |
| `strictness` | enum | 否 | 边界严格程度 |

## 输出字段

返回标准名称和描述、评分范围、每级分值/标签/说明/特征/可选示例、总体评分指导、边界情况及生成元数据。

## 实现建议

1. 评分规则应适应领域要求。
2. 相邻分数之间的边界应清楚。
3. 示例应真实，不要设置容易击败的稻草人。
4. 预想常见歧义情形并给出指导。
5. 使用已知样例测试规则，再投入实际评估。
