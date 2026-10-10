# 工具索引

工具为智能体提供完成任务所需的具体能力。

## 工具类别

### 评估工具

路径：`tools/evaluation/`，用于评估大语言模型输出质量。

| 工具 | 用途 | 是否需要审批 |
| --- | --- | --- |
| `directScore` | 根据标准为回复评分 | 否 |
| `pairwiseCompare` | 比较两份回复 | 否 |
| `generateRubric` | 生成评分规则 | 否 |
| `extractCriteria` | 从任务中提取评价标准 | 否 |

### 研究工具

路径：`tools/research/`，用于收集和处理信息。

| 工具 | 用途 | 是否需要审批 |
| --- | --- | --- |
| `webSearch` | 搜索网页 | 否 |
| `readUrl` | 提取网页内容 | 否 |
| `extractClaims` | 识别文本中的主张 | 否 |
| `verifyClaim` | 交叉核验主张 | 否 |
| `synthesize` | 综合研究发现 | 否 |

### 编排工具

路径：`tools/orchestration/`，用于管理多智能体工作流。

| 工具 | 用途 | 是否需要审批 |
| --- | --- | --- |
| `delegateToAgent` | 将任务分配给智能体 | 否 |
| `parallelExecution` | 并行运行任务 | 否 |
| `waitForCompletion` | 等待异步任务 | 否 |
| `synthesizeResults` | 汇总智能体结果 | 否 |
| `handleError` | 处理失败 | 否 |

## 工具设计模式

标准工具应包含：清楚的用途说明、Zod 输入参数、危险操作审批选项、严格模式和统一错误响应。错误需包含机器可读代码、人类可读信息、是否可重试及可选上下文；结果需包含成功状态、数据或错误，以及执行时间元数据。

新增工具时，选择或创建类别目录，编写工具说明，列出用途、输入输出、错误代码和示例，随后更新本索引并分配给相关智能体。

## 工具选择

| 需要执行的操作 | 工具类别 | 建议工具 |
| --- | --- | --- |
| 评估质量 | 评估 | `directScore`、`pairwiseCompare` |
| 查找信息 | 研究 | `webSearch`、`readUrl` |
| 核验事实 | 研究 | `verifyClaim`、`extractClaims` |
| 协调工作 | 编排 | `delegateToAgent` |
| 等待结果 | 编排 | `waitForCompletion` |
