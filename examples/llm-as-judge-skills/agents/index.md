# 智能体索引

智能体是具有明确能力、工具和指令的可复用 AI 组件。

## 可用智能体

### 评估智能体

**路径**：`agents/evaluator-agent/evaluator-agent.md`
**用途**：评估大语言模型生成回复的质量。

能力包括按评分规则直接评分、成对比较、从任务描述提取标准和生成评分规则。使用 `directScore`、`pairwiseCompare`、`extractCriteria` 和 `generateRubric`。适合内容质量门槛、模型比较、偏好数据生成和交付前验证。

### 研究智能体

**路径**：`agents/research-agent/research-agent.md`
**用途**：从多个来源收集、核验和综合信息。

能力包括网页搜索、URL 内容提取、主张提取与核验、研究综合。使用 `webSearch`、`readUrl`、`extractClaims`、`verifyClaim` 和 `synthesize`。适合构建知识库、事实核验、市场研究和技术文档整理。

### 协调者智能体

**路径**：`agents/orchestrator-agent/orchestrator-agent.md`
**用途**：协调复杂任务中的多智能体工作流。

能力包括任务拆解和分配、并行执行、结果综合、错误处理和恢复。使用 `delegateToAgent`、`parallelExecution`、`waitForCompletion`、`synthesizeResults` 和 `handleError`。适合复杂多步骤任务、跨能力工作流、质量保障流程和长时间运行操作。

## 智能体协作模式

### 顺序流水线

```text
输入 → 智能体 A → 智能体 B → 智能体 C → 输出
```

前一步结果是后一步前提时使用。

### 并行分发与汇总

```text
        ┌→ 智能体 A ─┐
输入 ───┼→ 智能体 B ──┼→ 综合 → 输出
        └→ 智能体 C ─┘
```

子任务相互独立、可并发时使用。

### 迭代优化

```text
输入 → 智能体 → 评估器 ─┬→ 通过后输出
                         └→ 失败后反馈给智能体
```

适用于质量要求较高的结果。

## 新增智能体

1. 创建 `agents/<智能体名>/` 目录。
2. 创建主说明文件 `agents/<智能体名>/<智能体名>.md`。
3. 写清用途、角色、系统指令、工具分配、配置选项和使用示例。
4. 更新本索引。
5. 适用时在协调者中登记。
