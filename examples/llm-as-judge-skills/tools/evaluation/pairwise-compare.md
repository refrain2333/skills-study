# 成对比较工具

## 用途

比较两份大语言模型回复，判断哪份更符合标准。对于语气、说服力和文风等主观偏好，它通常比直接评分更可靠。

## 工具定义

```typescript
export const pairwiseCompare = tool({
  description: "比较两份回复并选出更好的一份；适用于语气、说服力和写作风格等主观评价。",
  parameters: z.object({
    responseA: z.string(),
    responseB: z.string(),
    prompt: z.string(),
    context: z.string().optional(),
    criteria: z.array(z.string()),
    allowTie: z.boolean().default(true),
    swapPositions: z.boolean().default(true)
  }),
  execute: async (input) => input.swapPositions
    ? evaluateWithPositionSwap(input)
    : evaluatePairwise(input)
});
```

## 输入字段

| 字段 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| `responseA`、`responseB` | string | 是 | 两份待比较回复 |
| `prompt` | string | 是 | 两份回复共同回答的原始提示 |
| `context` | string | 否 | 补充上下文 |
| `criteria` | string[] | 是 | 比较维度 |
| `allowTie` | boolean | 否 | 是否允许平局，默认是 |
| `swapPositions` | boolean | 否 | 是否交换位置缓解偏差，默认是 |

## 输出字段

结果包括胜者（`A`、`B` 或 `TIE`）、置信度、逐标准比较、总体理由、双方优势，以及启用换位时的位置一致性和元数据。

## 换位算法

先按 A、B 顺序评估，再交换位置重新评估，并把第二次胜者映射回原顺序。若一致，则合并置信度；若不一致，则返回平局或降低置信度。

生产环境建议始终设置 `swapPositions: true`。标准应按重要性排序；差异接近时降低置信度，并记录回复长度差异。
