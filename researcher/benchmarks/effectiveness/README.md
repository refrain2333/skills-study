# 有效性基准（第三阶段）

使用 Cursor SDK 执行真实智能体任务。每项任务会在多种技能加载条件下运行；结果质量、令牌成本和运行时间的差异用于估算技能的实际效果。

方法说明见 `researcher/benchmarks/PLAN.md`；标准任务模板见 `researcher/benchmarks/effectiveness/tasks/001-filesystem-context-offload/`。

## 任务目录结构

```
researcher/benchmarks/effectiveness/tasks/<编号>-<名称>/
  README.md         # 任务说明和评分标准
  task.md           # 提供给智能体的精确任务提示
  metadata.json     # 机器可读元数据（目标技能、难度、类别）
  starting/         # 每次运行前复制到临时目录的工作区种子
  verify.sh         # 成功时返回退出码 0 的确定性检查
```

`metadata.json` 格式：

```json
{
  "id": "001",
  "slug": "filesystem-context-offload",
  "target_skill": "filesystem-context",
  "irrelevant_skill": "bdi-mental-states",
  "category": "context-management",
  "difficulty": "easy",
  "notes": "选择此任务的可选理由"
}
```

## 评估条件

每项任务在每个模型上评估以下六种条件：

| 条件 | `settingSources` | `.cursor/skills/` 中的技能 |
| --- | --- | --- |
| `control` | `[]` | 不加载技能 |
| `target` | `["project"]` | 只加载 `target_skill` |
| `negative` | `["project"]` | 只加载 `irrelevant_skill`，作为负向对照 |
| `full` | `["project"]` | 加载所有当前发布的技能 |
| `target_plus_one` | `["project"]` | 目标技能加一项相关技能 |
| `target_plus_unrelated` | `["project"]` | 目标技能加一项无关技能，用于交互对照 |

运行器会为每组（任务、条件、模型、重复次数）新建工作区：将 `starting/` 复制到临时目录，再只把本条件允许的技能放入 `.cursor/skills/`。

## 结果记录

每次运行后，运行器执行 `verify.sh`。退出码 0 表示任务成功。令牌数从 `run.conversation()` 读取，运行时长从 SDK 结果的 `durationMs` 读取。运行器保存：

- 每个条件的原始结果 JSON。
- 运行前后工作区差异。
- `verify.sh` 的标准输出和标准错误。
- `summary.json`，含每项任务与条件的汇总。

汇总结果以每轮基准一行的形式追加到 `researcher/reports/effectiveness-history.jsonl`。

## 新增任务

1. 在 `tasks/` 下创建带三位编号和名称的目录。
2. 复制 `001-filesystem-context-offload/` 的结构。
3. 编写 `task.md`，让智能体能够在工作区中独立理解任务。
4. 编写 `verify.sh`，确保它能在任意临时目录中运行，成功时返回 0。
5. 如实填写 `metadata.json`，选择真正不应对任务有帮助的 `irrelevant_skill`。
6. 按当前用户允许的范围进行验证；如需运行完整基准，先获得明确指示。

负向对照任务（没有技能应当带来帮助）与正向任务放在一起。将 `target_skill` 和 `irrelevant_skill` 设为 `none`；运行器会跳过 `target` 及 `target_plus_*`，只执行 `control`、`full` 和合理性检查。
