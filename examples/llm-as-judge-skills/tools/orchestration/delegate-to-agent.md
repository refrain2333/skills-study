# 委派给智能体工具

## 用途

将任务分配给专用智能体，并处理上下文传递、结果收集和错误管理。

## 工具定义

```typescript
export const delegateToAgent = tool({
  description: "将子任务交给具备相应能力的智能体，并传递其所需的完整上下文。",
  parameters: z.object({
    agentName: z.enum(["evaluator", "researcher", "writer", "analyst"]),
    task: z.string(),
    context: z.object({
      previousOutputs: z.array(z.string()).optional(),
      documents: z.array(z.string()).optional(),
      constraints: z.array(z.string()).optional()
    }).optional(),
    expectedOutput: z.object({
      format: z.enum(["text", "json", "markdown", "structured"]),
      schema: z.string().optional(),
      maxLength: z.number().optional()
    }).optional(),
    timeout: z.number().default(60000)
  }),
  execute: async (input) => executeAgentDelegation(input)
});
```

## 输入字段

包含目标智能体、任务说明、可选上下文及依赖、输出格式要求和超时时间（默认 60,000 毫秒）。

## 输出字段

返回成功状态、智能体名称、任务、输出内容及格式、执行起止时间/耗时/令牌使用；失败时返回错误代码、说明和是否可重试。

## 可委派对象

- `evaluator`：按准确性和清晰度评估回复。
- `researcher`：研究主题、注明来源和范围。
- `writer`：根据研究资料写执行摘要，并遵守篇幅和受众要求。
- `analyst`：分析数据并尽可能提供定量权衡。

## 错误处理

错误代码包括 `AGENT_NOT_FOUND`、`TIMEOUT`、`CONTEXT_TOO_LARGE`、`INVALID_OUTPUT` 和 `AGENT_ERROR`。

## 实现建议

1. 委派前按需压缩上下文。
2. 根据智能体类型设置合理超时。
3. 为临时失败实现重试。
4. 记录所有委派以供追踪。
5. 统计委派过程中的令牌用量。
