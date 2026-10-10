# 生成的数据结构兼容矩阵

> 由 `validate_schemas.py --write` 生成，请勿手动编辑。

| 类型 | 版本 | 负责规范 | 状态 | 兼容规则 | 标识前缀 | 分类 |
|---|---:|---|---|---|---|---|
| `ArtifactEnvelope` | 1.0.0 | SPEC-003 | active | exact | `rec` | `public`, `public_derived`, `private_operational`, `private_human`, `restricted_source`, `secret_reference` |
| `ArtifactRef` | 1.0.0 | SPEC-003 | active | exact | `aref` | `public`, `public_derived`, `private_operational`, `private_human`, `restricted_source`, `secret_reference` |
| `CandidateArtifact` | 1.0.0 | SPEC-003 | active | exact | `cand` | `public`, `public_derived`, `private_operational` |
| `CapabilityGrantSpec` | 1.0.0 | SPEC-003 | active | exact | `grant` | `private_operational` |
| `CredentialRef` | 1.0.0 | SPEC-003 | active | exact | `credref` | `secret_reference` |
| `ExportApproval` | 1.0.0 | SPEC-002 | active | exact | n/a | `private_human` |
| `ExportCorrection` | 1.0.0 | SPEC-002 | active | exact | n/a | `public_derived` |
| `ExportManifest` | 1.0.0 | SPEC-002 | active | exact | n/a | `public_derived` |
| `ExportPlan` | 1.0.0 | SPEC-002 | active | exact | n/a | `private_operational` |
| `ExportReceipt` | 1.0.0 | SPEC-002 | active | exact | n/a | `public_derived` |
| `ExportRenderReceipt` | 1.0.0 | SPEC-002 | active | exact | n/a | `private_operational` |
| `ExportRequest` | 1.0.0 | SPEC-002 | active | exact | n/a | `private_operational`, `private_human` |
| `ExportValidation` | 1.0.0 | SPEC-002 | active | exact | n/a | `public_derived` |
| `FreezeReceipt` | 1.0.0 | SPEC-003 | active | exact | `freeze` | `private_operational` |
| `LegacyClaim` | 1.0.0 | SPEC-003 | active | legacy-adapter | n/a | n/a |
| `LegacyMechanism` | 1.0.0 | SPEC-003 | active | legacy-adapter | n/a | n/a |
| `LegacyQueueRecord` | 1.0.0 | SPEC-003 | active | legacy-adapter | n/a | n/a |
| `LegacyRunState` | 1.0.0 | SPEC-003 | active | legacy-adapter | n/a | n/a |
| `SchemaRegistry` | 1.0.0 | SPEC-003 | active | exact | n/a | n/a |
| `StorageBinding` | 1.0.0 | SPEC-003 | active | exact | `bind` | `private_operational`, `restricted_source` |

未知类型会被隔离；未登记的大版本在执行前拒绝。
已弃用的数据结构仍可读取，但新写入者不得选择。
