# 基准测试架构计划

当前基准运行框架检查研究系统本身是否容易被投机：它执行确定性结构检查和七项对抗情景。但它尚未衡量用户真正关心的事情：**这些技能是否能让智能体更好地完成其声称支持的任务？**

本计划分四个阶段回答这个问题，采用研究论文级方法，并使用 Cursor SDK 执行真实智能体。

## 当前状态

| 阶段 | 版本 | 衡量内容 | 费用 | 状态 |
| --- | --- | --- | --- | --- |
| 0 | v2.2.0（已发布） | 运行框架抗投机能力、结构有效性 | 0 美元 | 完成 |
| 1 | v2.3.0（已发布） | 单项技能健康度，确定性检查 | 0 美元 | 完成；当时语料汇总分 0.814，15 项中 2 项被标记 |
| 2 | v2.3.0（已发布） | 技能路由准确率，由大语言模型选择技能 | Cursor 额度（完整扫描约 7 美元） | 完成；已发布基线和修复后差异 |
| 3 | v2.4.0 | 真实智能体任务中的技能有效性 | Cursor 额度，较高 | 已搭脚手架，完成一项任务 |
| 4 | v2.5.0 | 技能组合效果 | Cursor 额度 | 后续阶段 |

### 第二阶段已发布结果（v2.3.0）

对 `composer-2`、`claude-opus-4-7`、`gpt-5.5` 和 `gemini-3.1-pro` 进行两轮完整扫描；随机种子为 1，每个（提示、模型）组合重复三次：

- 基线：`researcher/benchmarks/router/results-published/2026-05-15.md`（600 次中完成 566 次，第一版运行器在中途退出）。
- 修复后：`researcher/benchmarks/router/results-published/2026-05-15-v2.md`（600 次全部完成，并包含相对基线的差异）。

主要发现：定向改写描述后，`context-fundamentals` 的 top-1 从 0.255 提高到 0.489（增加 23.4 个百分点）；`project-development` 从 0.750 提高到 1.000（增加 25 个百分点，达到满分）。四个模型中有三个 top-1 提高，四个模型的 top-3 都提高。

## 目标与非目标

### 目标

- 产生可复现、尽量不依赖特定模型的证据，衡量加载技能是否改善智能体行为；若没有改善，也如实报告。
- 每次测量都能通过一次命令和固定配置复现。
- 纵向记录结果，以便发现退化。
- 完整公开方法：提示词、任务、标准答案、评分和原始输出。
- 按顺序使用确定性检查、模型评审和真实任务执行。

### 非目标

- 不构建通用智能体基准框架，只在有代表性的任务上评估本技能集合。
- 不替代 SWE-bench、BrowseComp 等公开基准；可选取子集或用作比较，不重做这些基准。
- 不训练模型；本项目只做评估。
- 不运行除 Cursor 以外需要付费 API 的基准。第二、三阶段通过 SDK 消耗 Cursor 额度。

## 方法原则

所有阶段都遵循以下原则。

### 可复现

- 每次运行都由冻结配置描述，包括模型编号、随机种子、样例版本和仓库提交 SHA。
- 原始输出（对话记录、评审 JSON、任务工作区差异）随运行记录持久保存。
- 每次运行向历史 JSONL 追加一行，记录配置摘要和原始产物位置。
- 提供 `--seed`、`--config` 等参数，使第三方能够精确复现。

### 统计纪律

- 每种条件（模型 × 技能状态 × 任务）至少重复三次，以估算方差。
- 报告效应量和自助法 95% 置信区间，不只报单点估计。
- 尽量使用配对比较：同一任务在不同条件下运行，并对逐任务差值使用 Wilcoxon 符号秩检验。
- 各阶段注明目标样本量；样本不足的运行应在仪表板上明确标为“初步”。

### 缓解偏差

- **路由位置偏差**：每次重复都打乱技能顺序，并报告结果一致性。
- **评审模型自偏好**：评审模型不能与候选模型相同；例如用 Composer 评估 Claude 输出，用 GPT 评估 Composer 输出。
- **成对比较的长度偏差**：加入长度归一化评分，并规定平局时较短者胜出。
- **任务选择偏差**：纳入相关技能不应有帮助的负向对照，测量误报率。

### 消融

- 单项技能：保持其他条件不变，比较加载与不加载该技能。
- 逐项移除：每次从完整语料移除一项技能，找出真正发挥作用的技能。
- 顺序影响：按不同顺序加载技能子集，发现顺序依赖效应。

### 公开

- 所有提示词放在 `researcher/benchmarks/<阶段>/`。
- 所有标准答案以样例文件公开。
- 所有评分代码放在 `researcher/scripts/`。
- 经脱敏的原始运行结果放在对应基准 `results/` 目录或发布说明中。

## 第一阶段：确定性技能健康度（v2.2.1，0 美元）

低成本、争议较少的基础门槛。对每项技能进行确定性结构评分，在用户发现问题前找出结构漂移、缺少章节、过期主张和含糊易错点。

### 指标

对每个 `skills/<名称>/SKILL.md` 检查：

- `line_count`：最多 500 行，超出即失败。
- `frontmatter_valid`：名称与目录一致；描述存在、采用第三人称且不超过 1,024 字符。
- `required_sections`：何时启用、核心概念、实践指南、易错点、集成、参考资料。
- `gotcha_count`：易错点中的编号条目数，目标至少 3 条。
- `code_example_count`：围栏代码块数量。
- `internal_links_resolved`：每个指向 `skills/<其他技能>/SKILL.md` 的链接都能解析到实际文件。
- `external_link_count`：只记录链接数量；可选 `--check-urls` 才检查可达性，因为需要网络。
- `claim_coverage`：数值主张（百分比、倍数和基准名称）中，具备 `claim_id` 并指向 `researcher/claims/index.jsonl` 的比例。
- `mechanism_coverage`：`researcher/mechanisms/registry.jsonl` 中归属于该技能的机制数。
- `activation_case_coverage`：`researcher/fixtures/activation-cases.jsonl` 中以该技能为 `expected_primary_skill` 的案例数。

### 输出与评分

`researcher/scripts/skill_health.py` 生成 `researcher/reports/skill-health.json`，其中包含单项技能分数、加权分数及全语料汇总。`loop_daily.py` 可将每日结果追加到 `researcher/reports/skill-health-history.jsonl`。

```text
0.20 * normalize(required_sections)
0.15 * normalize(gotcha_count, target=3)
0.10 * normalize(code_example_count, target=2)
0.15 * normalize(internal_links_resolved)
0.10 * normalize(activation_case_coverage)
0.15 * normalize(claim_coverage)
0.10 * normalize(mechanism_coverage)
0.05 * binary(frontmatter_valid)
```

低于 0.75 的项目会在每日快照中标记。

### 价值

没有指标就很难发现技能退化。缺少易错点章节、积累失效内部链接或超过 500 行都会让技能变弱；在持续集成中发现这些问题成本很低。

## 第二阶段：技能路由基准（v2.3.0，使用 Cursor SDK 每轮约 5 美元）

第一个使用真实模型的基准，用于检验技能描述能否把任务路由到正确技能。

### 假设

v2.2.0 元数据中的启用场景描述（取代 v2.1.x 的关键词触发词）应能让前沿模型以较高 top-1 和很高 top-3 准确率，把提示路由到正确技能。

### 流程

1. **样例**：`researcher/benchmarks/router/prompts.jsonl` 最终有 100 条提示，每行包含 `{prompt_id, prompt, expected_primary_skill, acceptable_secondary_skills, rejected_skills, reason}`。初始发布 50 条，随后逐步扩展。
2. **路由提示**：使用 `researcher/benchmarks/router/routing-prompt.md` 模板，展示 15 项技能描述（每次重复时打乱顺序）和任务，并要求模型返回严格 JSON 排名及置信度。
3. **运行器**：`researcher/benchmarks/sdk-runner/src/runRouter.ts` 对每个提示、模型和重复项执行：生成打乱顺序的路由提示；调用 `Agent.prompt(...)`；设置 `settingSources: []`，确保没有预加载技能，提示中的描述是唯一信号；解析 JSON，失败时记为 `format_failure`，不奖励格式错误输出；与标准答案比较并记录 top-1 和 top-3。
4. **模型**：`composer-2`、`claude-opus-4-7`、`gpt-5.5`、`gemini-3.1-pro`。运行时通过 `Cursor.models.list()` 获取列表；模型不可用时记录 `model_unavailable` 并继续。
5. **重复次数**：每个（提示、模型）组合三次。100 条提示 × 4 个模型 × 3 次 = 每轮 1,200 次调用。

### 成本估算

- 路由提示较小：约 3K—5K 输入令牌和 500 输出令牌。
- 按 Cursor 的额度价格，完整运行远低于 5 美元。
- 即使按较高零售价估算，每轮约为 5—15 美元。

### 报告

- 每模型排行榜：top-1 准确率及 95% 置信区间、top-3 准确率、格式失败率。
- 单技能混淆矩阵：记录技能之间的误路由。
- 失败提示逐项分析：列出失败模型及其替代技能。
- 将模型、样例版本、仓库 SHA 和准确率追加到 `researcher/reports/router-history.jsonl`。

### 价值

已部署智能体只根据技能描述决定是否加载技能。如果描述无法正确路由，其他运行框架改进就缺少实际意义。该基准直接验证 v2.2.0 的启用场景重构。

## 第三阶段：技能有效性基准（v2.4.0，每轮约 50—200 美元）

用于证明技能在真实任务中确实有帮助。

### 假设

在相关任务中加载技能可以改善结果质量、令牌效率或两者兼有；加载无关技能不应产生效果，或只产生轻微噪声。

### 流程

1. **任务样例**：`researcher/benchmarks/effectiveness/tasks/<编号>-<名称>/`。每项任务包含 `task.md`（提示）、`starting/`（起始工作区）、`verify.sh`（成功时退出码为 0 的确定性标准答案检查）和 `metadata.json`（相关技能、负向对照技能、类别、预期难度）。
2. **条件**：每项任务运行六种设置：
   - `control`：`settingSources: []`，不加载技能。
   - `target`：只加载目标技能。
   - `negative`：只加载已知无关技能，作为负向对照。
   - `full`：加载所有当前发布技能。
   - `target_plus_one`：目标技能加一项相关技能。
   - `target_plus_unrelated`：目标技能加一项无关技能，检查交互影响。
3. **运行器**：`researcher/benchmarks/sdk-runner/src/runEffectiveness.ts` 为每个任务、条件、模型和重复项新建工作区；从 `starting/` 复制文件，只把条件允许的技能放入 `.cursor/skills/`；调用智能体；结束后运行 `verify.sh`，记录退出码、运行时间和对话令牌数；保存对话 JSON、工作区差异和验证输出。
4. **初始任务集**：20 项任务，覆盖：
   - `filesystem-context`：卸载 5,000 行工具输出后再检索特定信息。
   - `context-compression`：把 100K 令牌对话压缩为保留指定实体的 2K 令牌交接摘要。
   - `multi-agent-patterns`：判断可并行任务是否该使用子智能体并说明理由。
   - `memory-systems`：跨两次模拟会话持久保存用户偏好。
   - `tool-design`：把三个重叠工具调用合并为一个。
   - `evaluation`：根据任务描述编写评分规则。
   - `advanced-evaluation`：执行已缓解位置偏差的成对比较。
   - `harness-engineering`：从四种配置中识别缺少锁定评估器的配置。
   - `context-degradation`：在长上下文两端放置关键信息。
   - `context-optimization`：屏蔽超过 2K 令牌的工具输出。
   - `latent-briefing`：判断 KV 缓存压缩是否适用，含正向和负向案例。
   - `bdi-mental-states`：将小型 RDF 图转换为结构化信念状态。
   - `hosted-agents`：为多人协作场景设计预热池配置。
   - `project-development`：判断任务与模型的匹配度并提出处理流程。
   - `context-fundamentals`：解释一种上下文退化模式。
   - 另加 5 项不应受任何技能帮助的负向对照，如基本算术和纯代码格式化。
5. **模型**：与第二阶段相同。
6. **重复次数**：每项任务、条件和模型重复三次。20 项任务 × 6 种条件 × 4 个模型 × 3 次 = 每轮 1,440 次智能体运行。

### 成本估算

- 每项有效性任务大于路由提示，约需 10K—50K 输入令牌、1K—5K 输出令牌和多次工具调用。
- 使用 Cursor 额度时，完整运行应可纳入每月额度。
- 按零售价估算，每轮约 50—200 美元，取决于启用模型。

### 报告

- 单技能效应量：对照与目标条件之间的成功率、令牌成本和运行时长差异。
- 单技能效应图：附 95% 置信区间的柱状图。
- 负向对照检查：无关技能的效应应接近零；否则说明测试存在偏差。
- 按模型排行：显示哪些模型从技能中受益最多。
- 结果追加到 `researcher/reports/effectiveness-history.jsonl`。

### 价值

这是关键结果。比如“在适用任务中，加载 filesystem-context 能减少 N% 令牌且不损害质量”，才能为技能集合的价值提供支持。

## 第四阶段：跨技能组合（v2.5.0）

与单项技能相比，经过筛选的技能集合可能增加或破坏价值。需要检查：

- 两项技能一起加载时，指导是相加、互补还是冲突？
- 集成章节是否准确？章节提到的技能一起加载后，能否真正协同？
- 技能在上下文中的排列顺序是否影响效果？

该阶段推迟到 v2.5.0，因为它需要第三阶段基础设施，以及专门评估交互的任务。此处只列方向，尚未详细设计。

## SDK 集成细节

### 选择 Cursor SDK 的原因

- 可使用现有 Cursor 团队额度。
- 与 IDE 和命令行工具使用相同智能体循环，结果更接近实际使用。
- 一个接口支持 Composer、Claude Opus、GPT 和 Gemini 模型。
- `settingSources` 能精确控制加载哪些技能，是执行消融的关键能力。
- 本地资源不足时可使用云运行环境并行执行。

### 技能加载方式

- `settingSources: []`（默认）：不加载磁盘设置和技能，作为对照条件；路由基准也用它，保证描述是唯一信号。
- `settingSources: ["project"]`：从当前工作目录加载 `.cursor/`；通过复制技能到受控工作区来只加载指定项。
- `settingSources: ["project", "plugins"]`：同时加载插件技能。基准较少使用，因为难以精确控制。
- `settingSources: "all"`：加载用户和团队设置等全部配置。基准应避免它，以免泄露调用者环境。

第三阶段按条件新建任务工作区：先复制 `starting/` 到临时目录，再按条件放入 `.cursor/skills/`。

### 依赖的 SDK 结果格式

```typescript
interface RunResult {
  id: string;
  status: "finished" | "error" | "cancelled";
  result?: string;          // 最终助手文本
  model?: ModelSelection;   // 解析后的模型
  durationMs?: number;
  git?: RunGitInfo;
}
```

此外还使用 `run.conversation(): Promise<ConversationTurn[]>` 获取逐轮对话。令牌数来自对话事件；具体格式随 SDK 版本变化，由运行器封装处理。

### 各阶段的运行环境

- 第二阶段（路由）：本地运行；除临时目录外不依赖工作目录，速度快。
- 第三阶段（有效性）：多数任务在本地运行；需要文件隔离或并行的任务使用云环境。
- 第四阶段：默认使用云环境以实现充分并行。

### 安全

- 运行基准的 Cursor 账户需启用隐私模式，使评估数据不进入训练。
- 每次调用都显式传入 `apiKey`，不依赖环境中不明来源的密钥，防止跨租户错误。
- 每个智能体都使用 `await using` 自动释放资源。
- 按 Cursor 文档处理速率限制；遇到 429 时使用 1 秒、2 秒、4 秒、8 秒、16 秒的指数退避。

### 成本门槛

运行器提供每轮成本上限：

- `--max-runs N`：限制智能体调用总数。
- `--max-budget-usd N`：估算成本上限，超限时快速失败。
- `--dry-run`：打印计划，不执行调用。
- `--models <列表>`：开发时只选择部分模型。

每个运行器在首次调用智能体之前都会打印成本预测。

## 实施顺序

1. 第一阶段：实现 `researcher/scripts/skill_health.py`、结果文件并接入 `loop_daily.py`；不产生 API 费用。
2. SDK 运行器脚手架：建立 `researcher/benchmarks/sdk-runner/`、依赖配置、通用工具和预演模式；没有 API 密钥也能编译并正常退出。
3. 路由样例：在 `researcher/benchmarks/router/prompts.jsonl` 建立 50 条提示，涵盖 v2.2.0 边界混淆配对和单技能正向对照。
4. 第一项有效性任务：完成 `researcher/benchmarks/effectiveness/tasks/001-filesystem-context-offload/`，作为其他 19 项模板。
5. 验证：编译并运行预演，在用户允许时运行技能健康度检查，确认其他门禁状态。
6. 下一次合并后将第一阶段接入 `loop_daily.py`，每日更新技能健康度。
7. 环境密钥准备好后执行第二阶段，发布结果，并根据混淆改进描述。
8. 持续构建其余 19 项有效性任务，优先覆盖对用户主张最多的技能。
9. 准备就绪后执行第三阶段完整扫描，发布单项技能效应量。
10. 在 v2.5.0 设计并执行第四阶段。

## 尚待决定的问题

这些问题需在第二阶段执行前由用户决定，但不阻塞脚手架准备：

1. 是否确认运行基准的 Cursor 账户已启用隐私模式？
2. 是否按 Cursor 文档向 `leerob@cursor.com` 申请更高速率限制，还是先用默认限制进行较小规模扫描？
3. v2.3.0 首次运行使用 Composer 单模型，还是第一天就加入 Claude、GPT 和 Gemini？
4. 发布政策：将全部原始对话提交到仓库，还是单独托管后链接？完整扫描的原始对话可能达到数 MB。
5. 是否纳入 BrowseComp、SWE-bench 等公开基准子集作为参照，还是 v2.4.0 先使用自建任务集、v2.5.0 再交叉对照？

## 本计划尚未解决的问题

- 每任务令牌核算取决于 SDK 提供的逐轮信息。如果 `conversation()` 不包含令牌数，则在完成埋点前只能暂时用运行时长和请求数作为成本代理。
- Cursor 模型目录会随时间变化。每次记录解析后的模型编号有助于复现，但跨版本比较仍需谨慎。
- 初始人工挑选的任务集较小。要提高公开可信度，需要扩展到 100 项以上任务，或与现有公开基准对齐。
- 真实部署与基准条件不同。此处测得的效应量是上限，不是效果保证。

## 如何阅读结果

未来版本发布基准数值时，仪表板依次回答四个问题：

1. 运行框架是否通过确定性门槛？（第一阶段 0 和 1，必须通过）
2. 技能描述能否路由到正确技能？（第二阶段，逐模型检查）
3. 技能是否真正有帮助？（第三阶段，逐技能、模型和任务检查）
4. 多项技能能否协同？（未来第四阶段）

前一阶段失败的技能，不必等到后续阶段才能决定移除或返工。
