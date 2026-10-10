# 技能提案：可执行的自主研究运行框架

## 来源

- 网址：https://platform.parallel.ai/play/deep-research/trun_64f5be03055a4b52adf17481e4b865bc
- 标题：可执行的自主研究运行框架
- 作者或组织：
- 来源类别：
- 检索状态：partial
- 评估文件：
- 决策：HUMAN_REVIEW

## 机制

用 3—6 句话说明可实施机制，包括智能体行为变化、受影响的上下文或运行框架区域，以及支持该机制的证据。

## 技能目标

- 目标类型：new skill / existing skill / reference only
- 目标路径：
- 启用场景：
- 相关技能：
- 建议放置位置：SKILL.md / references / scripts / 仅研究目录

## 新颖性检查

- 命令：`python researcher/scripts/novelty_check.py --file researcher/runs/20260515-035228-executable-autonomous-research-frameworks/proposals/skill-proposal.md --json`
- 结论：pending
- 最大机制重叠度：
- 主要重叠机制：
- 人工审查理由：

## 证据

| 主张 | 证据 | 来源 |
| --- | --- | --- |
|  |  |  |

只包含来自已检索来源的证据。若来源已发现但未获取，应列为证据缺口，不要引用。

## 拟议变更

```yaml
changes:
  - path: ""
    section: ""
    change_type: "add | update | remove"
    summary: ""
```

## 质量检查

- [ ] 符合现有启用场景，或说明新增场景的理由。
- [ ] 增加操作规则、工作流、产物、易错点或参考资料。
- [ ] 记录新颖性检查结论和主要机制重叠。
- [ ] 避免重复现有技能指导或已接受机制。
- [ ] `SKILL.md` 少于 500 行。
- [ ] 对详细或易变证据采用渐进披露。
- [ ] 用语不绑定特定平台。
- [ ] 发布新技能时更新 README、根目录 `SKILL.md` 和插件清单。

## 风险与缺口

- 证据限制：
- 可能重复之处：
- 易变主张：
- 需要人工审查的事项：

## 建议

选择以下一项：

- `publish-new-skill`
- `update-existing-skill`
- `add-reference-only`
- `human-review`
- `reject`

再简要说明该变更是否应进入正式语料以及理由。
