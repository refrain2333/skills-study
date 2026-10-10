# 路由基准（第二阶段）

用于检查 v2.2.0 技能元数据中的启用场景描述，能否把给定提示正确路由到对应技能。

完整方法见 `researcher/benchmarks/PLAN.md`。

## 文件

- `prompts.jsonl`：标准提示，每行含 `prompt_id`、`prompt`、`expected_primary_skill`，以及可选的 `acceptable_secondary_skills`、`rejected_skills` 和 `reason`。
- `routing-prompt.md`：提供给大语言模型的提示模板，包含 `{{SKILL_BLOCK}}`、`{{USER_PROMPT}}`、`{{SKILL_COUNT}}` 占位符。
- `results/<日期>-<种子>/`：每次运行的 JSON 输出，已加入 Git 忽略规则。

## 运行方式

通过 SDK 运行器执行：

```bash
cd researcher/benchmarks/sdk-runner
npm install
npm run router:dry-run                       # 查看计划和成本预测
npm run router:run -- --max-budget-usd 5     # 设置 CURSOR_API_KEY 后执行
```

## 标准样例

初始样例共 50 条，覆盖：

- 单技能正向对照：每项技能一条，共 15 条。
- v2.2.0 边界混淆清单中的对抗配对：5 组，每组 3 个变体，共 15 条。
- 多个技能都可接受的组合任务：10 条。
- 没有任何技能应明显匹配的负向对照：5 条。
- 细微但仍应能正确路由的启用案例：5 条。

随着实际出现新的边界混淆，应逐渐扩充到 100 条。
