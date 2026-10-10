# 拉取请求准备操作手册

自主研究者准备拉取请求前，按此清单检查。

## 必需产物

- [ ] 来源评估 JSON 已存在，且符合 `../templates/source-evaluation.json`。
- [ ] 技能提案已存在，并注明目标路径。
- [ ] 技能提案记录新颖性检查命令、结论、最大机制重叠度和主要重叠机制。
- [ ] `validate_run.py --run-dir <运行目录>` 通过；`run-state.json` 处于 `pr_ready` 或 `closed`。
- [ ] 机制提案已晋级、拒绝，或明确说明暂缓及理由。
- [ ] 研究讨论记录了来源发现、评估和草案决策。
- [ ] 所有引用来源均已成功获取。
- [ ] 被拒绝或不完整的来源应记作证据缺口，不得当作支持证据引用。
- [ ] 若任何评分规则要求 `HUMAN_REVIEW`，应附上人工审查备注。

## 技能结构检查

- [ ] 新增或修改的 `SKILL.md` 带有 `name` 和 `description` YAML 元数据。
- [ ] 技能目录名与 `name` 字段一致。
- [ ] `SKILL.md` 少于 500 行。
- [ ] 描述采用第三人称，并说明任务边界，而不是堆砌关键词触发条件。
- [ ] 技能包含实践指导和易错点。
- [ ] 易变证据放在 `references/`，不挤占主技能正文。
- [ ] 集成章节使用纯文本引用相关技能名。

## 同步检查

发布新技能时同步更新：

- [ ] `README.md`
- [ ] 根目录 `SKILL.md`
- [ ] `.claude-plugin/marketplace.json`
- [ ] 若描述或版本范围发生变化，更新 `.plugin/plugin.json`
- [ ] 若编写或打包规则变化，更新 `CLAUDE.md` 和 `CONTRIBUTING.md`

## 审查检查

- [ ] 提案解释了为什么这不是重复内容。
- [ ] 提案列出重叠的已接受机制，并解释仍需要此次改动的原因。
- [ ] 拉取请求正文列出风险和缺口。
- [ ] 检查计划包含确定性结构检查，并遵循当前用户规定的测试范围。
- [ ] 如当前用户明确要求运行相关测试，再执行 `python3 -m unittest researcher.scripts.tests.test_skill_frontmatter`。
- [ ] `python3 researcher/scripts/validate_platform_compat.py --require-reference-validator` 仅在用户允许时运行。
- [ ] `python3 researcher/scripts/validate_repo.py --strict` 仅在用户允许时运行。
- [ ] `python3 researcher/scripts/skill_health.py --strict --no-history` 仅在用户允许时运行。
- [ ] 启用回归案例或研究基准的失败应列为风险；未经用户要求不得运行全量测试或模型基准。
- [ ] 拉取请求正文说明合并需要人工批准。
- [ ] 不含秘密、凭据或私有来源材料。

## 停止条件

出现以下任一情况时，不要创建拉取请求：

1. 某项主张依赖的来源尚未获取。
2. 同一次运行中修改了评分规则，却没有独立审查。
3. 插件清单是否同步不明确。
4. 新技能的启用场景或机制与现有技能高度重叠。
5. 用户尚未批准向 GitHub 推送。
