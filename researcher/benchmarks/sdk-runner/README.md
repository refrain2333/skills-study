# 研究 SDK 运行器

使用 TypeScript 编写的路由（第二阶段）和有效性（第三阶段）基准运行器，通过 [Cursor SDK](https://cursor.com/docs/sdk/typescript) 使用真实智能体评估技能语料。

研究方法、假设、统计设计和可复现规则见 `researcher/benchmarks/PLAN.md`。

## 设置

```bash
cd researcher/benchmarks/sdk-runner
npm install
export CURSOR_API_KEY="cursor_..."
```

API 密钥可从 [Cursor 控制台 > 集成](https://cursor.com/dashboard/integrations) 获取。运行器只从显式环境变量读取 `CURSOR_API_KEY`，并将它传给每次 SDK 调用，避免跨账户误用。

执行基准前，应在账户中启用 [隐私模式](https://cursor.com/help/security-and-privacy/privacy)，确保评估流量不用于训练。

## 命令

```bash
npm run typecheck

npm run router:dry-run       # 打印计划和成本预测，不调用智能体
npm run router:run           # 执行第二阶段路由基准

npm run effectiveness:dry-run
npm run effectiveness:run    # 执行第三阶段有效性基准
```

两个运行器共用以下参数：

- `--models <编号,编号,...>`：指定模型子集，默认 `composer-2`。
- `--reps <次数>`：每种条件的重复次数，默认 3。
- `--max-runs <次数>`：智能体调用次数硬上限。
- `--max-budget-usd <金额>`：估算费用上限；预测超过时拒绝启动。
- `--seed <数字>`：确定性打乱技能顺序和打破平局。
- `--fixture <路径>`：替代 JSONL 样例文件。
- `--dry-run`：只打印计划，不调用 SDK。
- `--concurrency <次数>`：限制并行 SDK 调用数量，默认 1。通常可用 4—8，但要遵守 Cursor 速率限制。
- `--no-resume`：忽略目标目录中的已有结果并重新执行。默认会跳过已有结果文件的计划项，从断点继续。

## 输出

每次运行会向以下文件追加一行摘要：

- `researcher/reports/router-history.jsonl`：第二阶段。
- `researcher/reports/effectiveness-history.jsonl`：第三阶段。

每次运行的原始输出位于：

- `researcher/benchmarks/router/results/<时间戳>-<种子>/`
- `researcher/benchmarks/effectiveness/results/<时间戳>-<种子>/`

两个 `results/` 目录均已加入 Git 忽略规则。经过整理发布的结果放在发布说明或已发布结果文件中。

## 成本门槛

除非显式设置 `--max-runs` 或 `--max-budget-usd`，或明确传入 `--unsafe-no-cost-cap`，运行器不会调用 SDK。默认预算刻意设置得较保守。

## 可复现性

每次运行都会记录：

- 运行器包版本。
- `CURSOR_API_KEY` 指纹（只保留末四位）。
- 运行时仓库提交 SHA。
- 启动时解析出的模型编号。
- 样例版本摘要。
- 随机种子。
- 完整配置快照。

第三方可以使用 `node src/runRouter.ts --config <捕获的配置文件.json>` 重现运行。
