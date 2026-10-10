# 主张来源记录

此处记录正式发布技能中易变、数值、基准或外部来源主张的依据。目标不是给每句话都添加引用，而是让可能过时的主张容易审计和复核。

`index.jsonl` 每行记录一条主张：

- `claim_id`：稳定标识。
- `claim_text`：简明主张。
- `owning_skill`：使用该主张的技能。
- `section`：技能中出现主张的章节。
- `source_url`：上游来源。
- `retrieved_at`：检索日期或保存来源的运行编号。
- `evidence_strength`：证据强度，可为 `primary`、`secondary`、`anecdotal` 或 `derived`。
- `volatility`：易变程度，可为 `low`、`medium` 或 `high`。
- `last_reviewed`：最近一次审查日期或运行编号。

高易变主张应在发布相关更新前，以及主要模型或服务商发生变化后重新审查。
