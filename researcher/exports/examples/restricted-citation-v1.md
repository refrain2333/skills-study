# 受限引用投影示例

旁边的生成暂存目录证明：合成的 `restricted_source` 记录可以导出白名单内的引用元数据，同时排除原始 `body`。`export-manifest.json` 包含输出和转换摘要，不包含来源路径或私有输入摘要。

验证命令：

```bash
python researcher/scripts/validate_export.py check \
  --staging-dir researcher/exports/examples/restricted-citation-v1
```

示例来源是合成数据，已提交在 `researcher/fixtures/export/` 下；真实受限正文不得进入本仓库。
