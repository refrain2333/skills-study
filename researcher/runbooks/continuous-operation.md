# 持续运行操作手册

本文说明如何在 macOS 上将研究运行框架作为守护进程运行，使研究转技能循环在无人手动操作时也能持续数日。

## 定时任务

| 任务 | 频率 | 作用 |
| --- | --- | --- |
| `loop_step.py` | 每 10 分钟 | 从收件箱取任务，将一个活跃运行推进一个状态；需要人工或评审模型审查时暂停 |
| `loop_discover.py` | 每日两次（本地时间 05:00、17:00） | 从已配置的信息源发现候选并追加到收件箱 |
| `loop_daily.py` | 每日一次（本地时间 06:30） | 执行仓库检查、启用案例和基准测试，写入带日期快照，并标记需要复核的易变主张 |
| `loop_status.py` | 随每次 `loop_step` 和 `loop_daily` 执行 | 更新仪表板和待审查视图 |

所有计划和预算都在 `researcher/orchestration/config.json` 中。默认预算如下：

- 活跃运行最多 3 个。
- 每日运行最多 6 个。
- 暂停待审查运行最多 12 个。
- 每日失败最多 5 次。
- 收件箱最多 200 项。

超过任一预算后，循环会停止可能造成副作用的操作，只继续记录状态，直到人工审查。

## 安装

```bash
researcher/orchestration/launchd/install.sh
```

该脚本会：

1. 把仓库路径写入 launchd 配置文件。
2. 将配置写入 `~/Library/LaunchAgents/`。
3. 在当前用户的 launchd 域中启动配置。
4. 启用对应任务标签，使任务在用户注销和重新登录后仍保留。

日志位于 `researcher/reports/logs/`：

- `loop_step.log`、`loop_discover.log`、`loop_daily.log`、`loop_status.log`。
- `launchd-loop-step.out` 和 `.err`：原始 launchd 输出。

## 卸载

```bash
researcher/orchestration/launchd/uninstall.sh
```

## 手动运行

无需 launchd，也可以直接运行循环脚本：

```bash
python3 researcher/scripts/loop_discover.py            # 将新来源加入收件箱
python3 researcher/scripts/loop_step.py --allow-fetch  # 推进一步
python3 researcher/scripts/loop_daily.py               # 运行基准并生成快照
python3 researcher/scripts/loop_status.py              # 更新仪表板
```

`--allow-fetch` 会通过 Python 标准库 `urllib` 执行 HTTP GET。未启用时，需要获取来源的运行会暂停等待人工处理。

## 人工审查入口

检查循环状态时阅读以下文件：

- `researcher/reports/status.md`：总体仪表板。
- `researcher/reports/parked-review.md`：等待审查的运行。
- `researcher/reports/snapshots/<日期>.md`：每日快照。
- `researcher/reports/benchmark-history.jsonl`：只追加的基准趋势记录。
- `researcher/queue/inbox.jsonl`：等待初始化的候选来源。
- `researcher/queue/quarantine.jsonl`：已移出轮换的来源。

暂停运行需要按原因采取下列操作：

| 原因 | 操作 |
| --- | --- |
| `needs source retrieval` | 手动获取来源，再运行 `research_loop.py retrieve --run-dir <运行目录> --file <证据文件>` |
| `needs evaluation` | 完成来源评估 JSON，再运行 `research_loop.py evaluate --run-dir <运行目录>` |
| `needs human or model action from state proposed` | 完成提案，再运行 `research_loop.py novelty --run-dir <运行目录>` |
| `needs merge approval` | 审查拉取请求说明；只有收到明确批准后才合并 |

## 安全边界

- 循环不会调用大语言模型或付费 API。
- 来源获取使用 Python 标准库 `urllib`，超时为 30 秒，响应大小上限为 1.5 MB。
- 同一来源连续获取失败两次后会进入隔离区。
- 机制注册表只能通过 `research_loop.py promote-mechanisms` 更新，并且必须记录审查者；循环本身不会修改注册表。
- 推送和合并始终由人控制。

## 每日人工检查节奏

1. 上午阅读最新快照和待审查列表。
2. 最多挑选三个暂停运行，选择继续、拒绝或放弃。
3. 批准通过发布准备检查的机制晋级。
4. 让循环继续运行，等待次日审查。
