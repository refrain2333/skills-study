# 公开导出边界

导出器会将明确分类的私有或受限 JSON 记录转换为新的公开投影产物。它采用白名单投影，不声称任意文件都能通过扫描变得安全。

记录序列不可变：

1. `ExportRequest` 选择相对来源路径和已登记的转换器。
2. `ExportPlan` 在私有区域绑定精确来源字节和规则版本。
3. `ExportManifest` 在公开区域只绑定投影编号、转换摘要、输出路径和输出摘要。
4. `ExportValidation` 证明暂存目录树符合清单和受支持检测器的要求。
5. 人工批准、合并回执、更正和删除标记属于后续独立生命周期记录；不得就地修改早期记录。

私有输入摘要、存储位置、来源路径、能力凭据材料和通知目标不得出现在公开清单中。公开投影会获得新的 `proj_` 编号。拥有该编号不代表有权访问私有来源。

## 命令

```bash
python researcher/scripts/validate_export.py plan \
  --request researcher/fixtures/export/restricted-request.json \
  --private-root researcher/fixtures/export/private-root \
  --plan-out researcher/exports/private/example-plan.json

python researcher/scripts/validate_export.py render \
  --plan researcher/exports/private/example-plan.json \
  --private-root researcher/fixtures/export/private-root \
  --staging-dir researcher/exports/staging/example \
  --receipt-out researcher/exports/private/example-receipt.json

python researcher/scripts/validate_export.py check \
  --staging-dir researcher/exports/staging/example
```

`researcher/exports/examples/restricted-citation-v1/` 是已提交的确定性示例。本地 `private/` 和 `staging/` 目录均已忽略。

## 支持的保证范围

受支持的渲染路径会拒绝未知请求字段和清单字段、未知产物类型、未登记转换、秘密引用来源、路径穿越、符号链接、路径冲突、来源变更、额外暂存文件、摘要漂移、私有元数据字段、以普通文本/十六进制/Base64 提供的哨兵，以及少量高置信度秘密结构。结构化字段白名单是主要边界。辅助扫描无法证明不存在所有可能的语义泄露。
