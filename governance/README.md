# 权限治理规则

`constitution.yaml` 是研究组织可由机器读取的权限模型。规则采用保守策略：未列出的操作默认拒绝，显式拒绝优先于允许；只有经过认证的人工维护者可以合并变更或启用生产环境。

文件采用 YAML，便于人工审查，并通过 `yaml.safe_load` 解析。可执行语义由 `researcher/scripts/governance_policy.py` 定义；JSON Schema 说明公开交换格式。领域规则由可执行的权限检查器负责，以免授权行为受某个数据结构实现细节影响。

运行以下命令进行检查或输出诊断结果：

```bash
python researcher/scripts/validate_governance.py --check
python researcher/scripts/validate_governance.py --decision \
  --actor change_author \
  --action open_pull_request \
  --resource pull_request \
  --context-json '{"automated_identity_disclosed":true,"human_review_path":"pull_request"}'
```

`effective_commit: "$SELF"` 表示包含章程的提交。这样既避免自引用哈希，又能将规则固定在不可变的 Git 历史上。运行环境应固定检查器返回的 SHA-256 摘要，而不是固定一个可变路径。

权限视图由规则生成，请勿手工编辑生成文件。
