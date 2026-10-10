# 技能提案：来自 autoresearch 的运行框架工程经验

## 来源

- 网址：https://github.com/karpathy/autoresearch/blob/master/program.md
- 标题：Karpathy 的 autoresearch 计划
- 作者/组织：Andrej Karpathy
- 来源类别：code
- 检索状态：retrieved
- 评估文件：`researcher/fixtures/source-evaluations/approved-harness-source.json`
- 决策：HUMAN_REVIEW

## 机制

该来源展示了一种受约束的自主实验运行框架：智能体只能编辑一个区域；评估器保持锁定；每次运行获得固定反馈；结果被持久记录；Git 回滚会丢弃未改进的尝试。可迁移机制不是 nanoGPT 任务本身，而是可编辑区域与锁定区域之间的边界。

## 技能目标

- 目标类型：现有技能。
- 目标路径：`skills/harness-engineering/SKILL.md`
- 启用场景：设计自主循环，以锁定的评估区域为可编辑产物评分。
- 相关技能：evaluation、filesystem-context、project-development。
- 建议位置：`SKILL.md`

## 新颖性检查

- 命令：`python researcher/scripts/novelty_check.py --file researcher/fixtures/skill-proposals/harness-engineering-proposal.md --json`
- 结论：pass
- 最大机制重叠：0.0866
- 主要重叠机制：`locked-editable-surfaces`、`structured-novelty-gate`
- 人工审查理由：由于该样例用于种子化运行框架模式，出现预期重叠；此提案早于正式机制注册表，仍可作为有效示例。

## 证据

| 主张 | 证据 | 来源 |
| --- | --- | --- |
| 自主循环需要锁定评估指标 | `prepare.py` 负责评估，而 `train.py` 可以编辑 | Karpathy autoresearch |
| 持久结果日志可避免重复失败 | `results.tsv` 记录提交、指标、内存、状态和说明 | Karpathy autoresearch |
| 回滚使失败尝试不污染最佳结果集合 | 未改进的提交会被重置 | Karpathy autoresearch |

## 拟议变更

```yaml
changes:
  - path: "skills/harness-engineering/SKILL.md"
    section: "Core Concepts"
    change_type: "add"
    summary: "说明锁定区域与可编辑区域，以及固定反馈循环。"
```

## 质量检查

- [x] 符合现有启用场景，或说明新增场景理由。
- [x] 增加操作规则、工作流、产物、易错点或参考资料。
- [x] 记录新颖性检查结论和主要机制重叠。
- [x] 避免重复现有技能指导或已接受机制。
- [x] `SKILL.md` 少于 500 行。
- [x] 易变证据使用渐进披露。
- [x] 用语不绑定特定平台。
- [x] 若发布新技能，更新 README、根目录 `SKILL.md` 和插件清单。

## 风险与缺口

- 证据限制：只覆盖一个基准环境；不能暗示所有研究任务都能用单一指标衡量。
- 可能重复：与评估技能有交集，但本提案聚焦评估周边的控制循环。
- 易变主张：不要嵌入星标数量或随时间变化的受欢迎程度指标。
- 需要人工审查：适用 O3；证据有用但范围较窄。

## 建议

`update-existing-skill`

将来源作为 `harness-engineering` 的核心示例，使用适用于 nanoGPT 之外场景的通用表述。
