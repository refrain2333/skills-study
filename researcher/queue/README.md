# 研究队列

队列文件是持久账本，使自主循环可以连续运行数日而不丢失状态。每次变更要么只追加内容，要么用新的排序快照整体替换文件。

## 文件

- `inbox.jsonl`：已发现、尚未初始化为运行的候选来源。
- `parked.jsonl`：遇到人工审查门槛并等待审查者的运行编号。
- `done.jsonl`：已关闭的运行编号，结论可以是接受、拒绝、仅供参考或放弃。
- `quarantine.jsonl`：因检索失败或被来源注册表拒绝而移出轮换的来源。

## 来源记录格式

`inbox.jsonl` 和 `quarantine.jsonl` 每行都是 JSON 对象：

```json
{
  "source_id": "deterministic-hash",
  "url": "https://example.com/post",
  "title": "简短标题",
  "author_or_org": "组织名称",
  "source_type": "paper | engineering_blog | documentation | benchmark | code | talk | other",
  "candidate_reason": "该来源的相关原因",
  "feed": "manual-seed | parallel-research | rss | other",
  "discovered_at": "ISO-8601",
  "attempts": 0,
  "last_status": "queued | initialized | failed"
}
```

活跃运行存放在 `researcher/runs/<运行编号>/`，并有各自的 `run-state.json`。循环脚本直接读取这些状态文件，不在队列中重复保存活跃运行状态，因此每次运行只有一个事实来源。
