# 本仓库的智能体协作说明

本文说明在本仓库中维护内容时应遵循的结构、检查方式和设计原则。

## 项目概况

本项目是一组关于上下文工程与智能体运行框架的开放技能文档，面向生产级智能体系统。技能与平台无关，可用于 Claude Code、Cursor、Codex、GitHub Copilot 及符合开放插件规范的工具。当前版本为 2.6.0，包含 18 项技能；其中新增的“自主管理上下文”说明模型如何把当前上下文当作可编辑文件管理。技能集合还包括研究转技能的文件化流程、确定性检查、跨平台格式验证和持续改进流程。当前技能数量以 `researcher/generated/corpus-summary.md` 中的生成清单为准。

上下文工程是整理进入模型上下文窗口的全部信息，包括系统提示、工具定义、检索资料、消息历史和工具输出，以便在有限注意力预算内保留最有用的信号。

## 仓库结构

- `skills/`：正式发布的技能目录。每个目录包含带 YAML 元数据（`name`、`description`）的 `SKILL.md`，并可包含 `references/` 和 `scripts/`。
- `examples/`：完整示例项目。数量以生成清单为准。
- `docs/`：研究材料和参考文档。
- `researcher/`：文件化的研究转技能流程，包括评分标准、机制注册、主张来源记录、语料索引、运行状态、对抗性基准和持续循环。
- `template/SKILL.md`：新增技能时使用的规范模板。
- 根目录 `SKILL.md`：技能集合的元数据和技能地图。
- `.claude-plugin/marketplace.json`：Claude Code 插件清单，包含一个完整插件。
- `.plugin/plugin.json`：开放插件格式清单。

## 构建与检查命令

仓库根目录没有统一的构建系统。完整的确定性检查门禁如下；只有当前任务明确要求或项目发布流程要求时才运行，日常改动只运行必要的最小检查。

### 仓库级检查

```bash
python3 -m unittest researcher.scripts.tests.test_skill_frontmatter
python3 researcher/scripts/validate_governance.py --check
python3 researcher/scripts/build_inventory.py --check
python3 researcher/scripts/validate_platform_compat.py --require-reference-validator
python3 researcher/scripts/validate_repo.py --strict
python3 researcher/scripts/skill_health.py --strict --no-history
python3 researcher/scripts/run_benchmarks.py
python3 researcher/scripts/check_activation_cases.py
```

### 检查正在进行的研究运行

```bash
python3 researcher/scripts/validate_run.py --run-dir researcher/runs/<运行编号>
```

### 手动或定时运行的持续循环

```bash
python3 researcher/scripts/loop_discover.py
python3 researcher/scripts/loop_step.py --allow-fetch
python3 researcher/scripts/loop_daily.py
python3 researcher/scripts/loop_status.py
researcher/orchestration/launchd/install.sh
researcher/orchestration/launchd/uninstall.sh
```

### 示例项目

`examples/llm-as-judge-skills` 使用 TypeScript 和 Node.js 18 及以上版本：

```bash
cd examples/llm-as-judge-skills
npm install
npm run build
npm test
npm run lint
npm run format
npm run typecheck
```

`examples/interleaved-thinking` 使用 Python 3.10 及以上版本：

```bash
cd examples/interleaved-thinking
pip install -e ".[dev]"
pytest
ruff check .
```

`examples/digital-brain-skill` 使用 Node.js：

```bash
cd examples/digital-brain-skill
npm run setup
npm run weekly-review
npm run content-ideas
npm run stale-contacts
```

## 技能编写规则

创建或修改技能时：

1. `SKILL.md` 正文少于 500 行；详细内容移到 `references/`。
2. YAML 元数据至少包括 `name` 和 `description`。
3. 技能目录名使用小写字母和连字符，例如 `context-fundamentals`。
4. 描述采用第三人称；描述会进入系统提示，视角不一致会影响技能发现。
5. 保持平台无关；除非明确说明抽象边界，不要只提供绑定某个厂商的示例或工具名。
6. 控制篇幅，逐段删去对有经验读者没有帮助的内容。
7. 正文应包含“何时启用”“核心概念”“实践指南”“示例”“指南”“易错点”“集成”和“参考资料”等部分。
8. “何时启用”必须同时说明适用条件和不适用边界，并将相邻任务引导到正确技能。
9. 保留“易错点”部分；经验总结出的失效模式是技能中最有价值的信息之一。
10. 新增技能时更新根目录 `README.md`。
11. 新增技能时更新 `.claude-plugin/marketplace.json` 与 `.plugin/plugin.json`。
12. 更新 `researcher/corpus/index.json`，为技能登记启用场景、机制编号和主张编号。
13. 为可复用的行为变化登记机制；为数值、基准或易变主张记录 `claim-*` 来源。
14. 修改技能后，只运行当前任务允许且直接相关的检查；不得因仓库说明而越过用户设定的测试范围。

## 研究流程规则

1. 使用 `research_loop.py init` 初始化研究运行；该命令会创建运行状态、队列条目、讨论记录、来源评估框架和机制提案模板。
2. 通过 `retrieve`、`evaluate`、`propose`、`novelty`、`validate-run`、`pr-ready`、`close` 等子命令推进状态；不要手动编辑 `run-state.json`。
3. 运行通过发布准备检查后，才能提升机制；`research_loop.py promote-mechanisms` 需要 `--reviewed-by` 和通过检查的运行。
4. 向技能加入数值、基准或易变主张时，在 `researcher/claims/index.jsonl` 中记录来源。
5. 持续循环不得调用付费大语言模型；网络检索仅使用标准库，评审器适配器不在当前范围内。
6. 不要提交运行时队列和报告文件。`.gitignore` 已覆盖相应目录，并保留种子运行。

## 插件架构

所有已发布技能通过清单中的单个 `context-engineering` 插件分发。这样可避免 Claude Code 为多个指向同一目录的插件重复缓存整份仓库。采用渐进披露：启动时只读取技能名称和描述，匹配任务后再加载完整技能内容。

## 设计原则

- **重视上下文质量**：注意力有限，信息过多时，位于中间的内容可能被忽略；上下文越多并不总是越好。
- **用子智能体隔离上下文**：派生子智能体的主要目的在于分配注意力预算，而不是模拟组织架构。
- **让技能互相衔接**：在“集成”部分用纯文本技能名说明职责关系，避免跨目录链接失效。
- **示例代码采用 Python 伪代码**：用于解释概念，力求跨环境适用，不承诺可直接用于生产。
- **先确定性检查，再进行模型评审**：结构、数据格式、评分计算、清单同步、检索状态和注册表格式通过检查后，才考虑调用大语言模型评审。
- **合并由人控制**：智能体可以准备变更并通过检查；推送和合并需要用户明确授权。
