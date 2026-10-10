# 研究运行体系

当前语料数量、来源摘要、兼容状态和未解决引用由[实时语料清单](generated/corpus-summary.md)生成。历史报告保留各自记录时的数值。

公开与私有边界由 `governance/export-policy.yaml` 和 `scripts/validate_export.py` 定义。真实私有计划与回执保存在被忽略的本地路径中；只有通过验证的投影目录才会提交公开审查。

跨运行环境记录、带类型标识、私有产物引用和候选冻结回执遵循 SPEC-003 契约，见 [`schemas/README.md`](schemas/README.md)。现有主张、机制、运行状态和队列通过已验证的旧格式适配器保留在原位。

本目录定义了把外部研究转化为技能变更的仓库内工作流。整个流程以文件为基础，便于智能体检查、恢复和审计，不需要托管式调度器。

## 使命

通过持续执行以下工作，让本仓库成为上下文工程与智能体运行框架的可信来源：

1. 发现可信论文、工程文章、基准报告和实验室记录。
2. 使用明确的评分规则评估来源。
3. 提取可实施的机制，而非泛泛的经验总结。
4. 将机制映射到新技能、现有技能修改或仅供参考的说明。
5. 通过门槛检查后准备可审查的拉取请求。

智能体通过门槛后可以准备分支和拉取请求内容，但是否合并由人决定。本目录没有任何工作流获准自动合并。

## 生命周期

```text
发现 -> 初筛 -> 评估 -> 提取 -> 映射 -> 起草 -> 验证 -> 准备拉取请求 -> 人工合并
```

| 阶段 | 产物 |
| --- | --- |
| 发现 | 候选来源，记录网址、作者、日期和相关原因 |
| 初筛 | 根据 `source-registry.md` 标记来源类别并检查是否应排除 |
| 评估 | 符合 `templates/source-evaluation.json` 的 JSON |
| 提取 | 机制、产物、证据和失败模式 |
| 映射 | 使用 `templates/skill-proposal.md` 编写技能提案 |
| 起草 | 按仓库常规结构修改技能或参考资料 |
| 验证 | 评分规则结果与确定性结构检查 |
| 准备拉取请求 | 可提交的变更摘要、检查计划和待审事项 |

## 目录索引

- `source-registry.md`：来源类别、优先级和拒绝规则。
- `mechanisms/registry.jsonl`：用于新颖性和技能差异检查的已接受机制。
- `mechanisms/ledgers/`：只追加的机制接受与拒绝晋级记录。
- `claims/index.jsonl`：易变、数值或基准主张的来源记录。
- `corpus/index.json`：技能、机制、主张和启用场景的机器可读映射。
- `benchmarks/`：研究运行框架的对抗情景和黄金样例。
- `schemas/`：摘要固定的持久记录格式和跨语言一致性证据。
- `artifacts/`：私有 CAS 契约和被忽略的运行时根目录。
- `rubrics/content-curation.md`：接收外部内容的门槛。
- `rubrics/skill-change.md`：修改技能的门槛。
- `rubrics/harness-change.md`：修改研究或评估运行框架的门槛。
- `rubrics/pairwise-skill-revision.md`：比较多个技能草案的评分规则。
- `templates/source-evaluation.json`：机器可读的来源评估格式。
- `templates/skill-proposal.md`：从来源到技能变更的提案格式。
- `templates/mechanism-proposal.jsonl`：单次运行内的机制晋级提案格式。
- `templates/research-thread.md`：长期运行智能体使用的持久讨论记录。
- `runbooks/autonomous-research-loop.md`：自主研究流程操作手册。
- `runbooks/pr-readiness.md`：拉取请求准备检查清单。
- `scripts/validate_repo.py`：仓库和运行框架的确定性检查。
- `scripts/validate_run.py`：单次研究运行的发布准备检查。
- `scripts/research_loop.py`：创建持久运行目录和验证报告。
- `scripts/novelty_check.py`：检查提案与现有技能和以往运行的重叠。
- `scripts/compare_skill_revisions.py`：成对比较技能修订的确定性预检查。
- `scripts/check_activation_cases.py`：技能启用边界回归检查。
- `scripts/run_benchmarks.py`：确定性基准运行框架，可选记录历史。

## 治理规则

1. 修改输出应比修改评分规则容易。来源本身不能放宽接收它所用的评分规则。
2. 只引用实际检索到的来源。如果来源加载失败，应记录失败，不得把它当作证据引用。
3. 区分来源质量与技能质量。优秀论文也可能无法产生可执行的技能改进。
4. 除非启用场景、机制和操作流程确实不同，否则优先更新现有技能，而不是增加新技能。
5. 若证据只是轶闻、来源主张易变，或技能变更会影响全仓指南，必须进行人工审查。
6. 生成的技能变更应符合 `template/SKILL.md`、500 行限制和插件清单同步规则。

## 本地命令

```bash
python researcher/scripts/validate_repo.py
python researcher/scripts/validate_run.py --run-dir researcher/runs/<运行编号>
python researcher/scripts/research_loop.py init --title "来源标题" --url "https://example.com/source"
python researcher/scripts/novelty_check.py --file researcher/fixtures/skill-proposals/harness-engineering-proposal.md
python researcher/scripts/compare_skill_revisions.py skills/evaluation/SKILL.md skills/advanced-evaluation/SKILL.md
python researcher/scripts/check_activation_cases.py
python researcher/scripts/run_benchmarks.py
```

## 当前已发布的研究型技能

本研究体系产出的第一项正式技能是 `harness-engineering`。在积累足够案例和验证数据、证明适合独立发布之前，技能演进工作仍保留在本目录中。
