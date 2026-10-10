# 研究运行

每次运行都会完整经过一次研究转技能状态机。运行目录属于运行时产物；仓库只提交种子运行作为完整示例。

## 目录结构

```
researcher/runs/<时间戳>-<名称>/
  run-state.json              # 状态机、锁定区域和状态转换历史
  THREAD.md                   # 供人阅读的讨论记录
  sources/
    queue.jsonl               # 本次运行的来源记录
    evaluations/              # 来源评估 JSON（草稿可存在，发布前必须完成）
    evidence/
      retrieval.md            # 已检索证据的指针记录
      raw/                    # 获取的原始 HTML/JSON
  proposals/
    skill-proposal.md         # 针对特定技能变更的提案
    mechanism-proposal.jsonl  # 待加入注册表的候选机制
  reports/
    validation-report.json    # 初始化时的仓库验证快照
    validation-report.md      # 人类可读摘要
    novelty-result.json       # 最新新颖性检查（由 research_loop.py novelty 创建）
    pr-readiness.md           # 拉取请求摘要、检查计划和风险（由 pr-ready 创建）
    closure.json              # 由 close 写入
    run-readiness.{json,md}   # 由 validate-run 写入
  logs/
```

## 状态机

```text
initialized -> retrieved -> evaluated -> proposed -> novelty_checked -> validated -> pr_ready -> closed
```

请使用 `researcher/scripts/research_loop.py` 子命令推进状态，不要直接编辑 `run-state.json`：

```bash
python3 researcher/scripts/research_loop.py init --title "..." --url "..."
python3 researcher/scripts/research_loop.py retrieve --run-dir <运行目录> --file <证据文件>
python3 researcher/scripts/research_loop.py evaluate --run-dir <运行目录>
python3 researcher/scripts/research_loop.py propose --run-dir <运行目录>
python3 researcher/scripts/research_loop.py novelty --run-dir <运行目录>
python3 researcher/scripts/research_loop.py validate-run --run-dir <运行目录>
python3 researcher/scripts/research_loop.py pr-ready --run-dir <运行目录> --summary <摘要> --test-plan <检查计划> --risks <风险>
python3 researcher/scripts/research_loop.py close --run-dir <运行目录> --status reference-only --reason <原因> --reviewed-by <审查者>
```

## 哪些运行会提交到仓库

目前只有 `researcher/runs/20260515-035228-executable-autonomous-research-frameworks/` 会提交。它是用于建立 harness-engineering 技能和机制注册表的完整示例，当前 `current_state` 为 `closed`，`close_status` 为 `reference-only`。

其他运行目录都是本地运行时状态，由 `.gitignore` 排除。拉取请求不要增加新的已提交运行；需要回归样例时，应放在 `researcher/fixtures/` 下。
