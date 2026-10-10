# 数字大脑项目中的 Claude 指引

这是一个个人数字大脑工作系统。在此项目中工作时遵循以下规则。

## 核心规则

1. **写内容前先读 `identity/voice.md`**，保持用户真实的表达风格。
2. **JSONL 文件只追加，不覆盖**，以保留历史。
3. 修改跟踪数据时更新时间戳。
4. 交叉引用模块：知识支持内容，人际网络支持日常运营。

## 快速参考

- **撰写内容**：先读 `identity/voice.md`，再使用 `content/templates/` 中的模板。
- **查询联系人**：搜索 `network/contacts.jsonl`，并从 `interactions.jsonl` 查看历史。
- **内容创意**：检查 `content/ideas.jsonl`，运行 `agents/scripts/content_ideas.py`。
- **任务管理**：使用 `operations/todos.md`，并与 `operations/goals.yaml` 对齐。
- **周度回顾**：运行 `agents/scripts/weekly_review.py`。

## 文件约定

- `.jsonl`：每行一个 JSON 对象，只追加。
- `.md`：供人阅读，可自由编辑。
- `.yaml`：配置和结构化数据。
- `_template.md` 或 `_schema` 文件：参考格式，不要修改。

## 用户提出以下请求时

| 请求 | 操作 |
| --- | --- |
| “写一篇关于 X 的帖子” | 读取 voice.md → 起草 → 对齐表达风格 |
| “帮我准备和 Y 的会议” | 查联系人 → 读取互动 → 汇总 |
| “我该创作什么？” | 运行 content_ideas.py → 检查日历 |
| “添加联系人 Z” | 按完整结构追加到 contacts.jsonl |
| “进行周度回顾” | 运行 weekly_review.py → 展示洞见 |
