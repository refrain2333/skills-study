# 机制注册表

机制注册表是已接受模式的持久索引；它使新颖性检查比较行为变化，而不是比较宽泛的关键词重合。

`registry.jsonl` 每行记录一项已接受机制：

- `mechanism_id`：稳定的短横线式标识。
- `owning_skill`：负责该模式的正式技能。
- `activation_scenario`：该机制适用的场景。
- `behavior_change`：未来的智能体应采取什么不同做法。
- `evidence`：支持该机制的来源网址或仓库产物。
- `failure_modes`：该机制用于防止的失败模式。
- `status`：可为 `accepted`、`candidate`、`deprecated` 或 `rejected`。

只有 `accepted` 和 `candidate` 机制参与新颖性检查。被拒绝的机制应保留在运行日志或拒绝提案中；如果这些记录可以防止重复探索，就不要删除。

## 晋级流程

运行会在 `proposals/mechanism-proposal.jsonl` 中提出机制。晋级必须满足以下条件：

1. 运行通过发布准备检查，才能接受 `accepted` 或 `candidate` 机制。
2. 记录一位人工审查者。
3. 已接受和候选机制追加到 `registry.jsonl`。
4. 每次晋级都追加一条事件到 `ledgers/accepted.jsonl`。
5. 被拒绝的机制追加到 `ledgers/rejected.jsonl`，避免后续智能体重复发现。
