# 数据结构注册表与规范产物

本目录是组织持久记录的跨运行环境交换边界，不取代可阅读的技能、研究账本或 Git 历史。

## 目录结构

- `registry.json`：带精确数据结构文件摘要的当前注册表。
- `registry.schema.json`：注册表元数据结构。
- `v1/`：SPEC-003 管理的 Draft 2020-12 数据结构。
- `fixtures/`：Python 和 TypeScript 共用的一致性记录。
- `generated/`：受检查的兼容性、当前语料、迁移和一致性证据。
- `public-legacy-sources.json`：允许进入生成迁移证据的精确公开样例集合。
- `typescript/`：独立的 Ajv 和规范化消费者，包含可复用的已编译运行时注册表。

SPEC-002 导出数据结构保留在 `researcher/exports/schemas/`，通过精确摘要导入。数据结构所有者保留自己的文件；注册表提供统一查询入口。

## 规范字节

`jcs-rfc8785-integer-v1` 是与 RFC 8785 兼容的子集：

- 字符串使用 UTF-8，不做 Unicode 规范化，并拒绝孤立代理项。
- 对象属性按 UTF-16 码元排序。
- 数组保留原顺序。
- 数字必须是 `-9007199254740991` 到 `9007199254740991` 之间的整数。
- 浮点数、负零、NaN、Infinity、重复键和隐藏解析强制转换均会失败。

JSON 记录摘要针对规范字节计算；数据块摘要针对精确字节计算。因此 LF 与 CRLF 会产生不同摘要。`ArtifactEnvelope.integrity.digest` 不参与自身摘要计算；除此以外，不排除任何字段。

## 身份与兼容性

原生标识为 `<registered-prefix>_<UUIDv7>`。旧格式导入使用固定迁移命名空间生成 UUIDv5，并声明 `id_origin: legacy_import`。现有语义 ID 保留为别名。

消费者要求精确匹配已登记类型和受支持版本。显式传给验证器的路由参数必须与记录内嵌的区分字段一致，不能选择一个恰巧共享 JSON Schema 资源的兄弟数据结构。`resolve_for_read` / `resolveForRead` 接受 active 和 deprecated 契约；`resolve_for_write` / `resolveForWrite` 只接受唯一 active 写入版本。初始注册表不支持宽松的小版本解析：新版本必须明确声明并测试增量兼容后才能接受。retired 版本不可解析。

Python 的 `SchemaRegistry` 和 TypeScript 的 `LoadedRuntimeRegistry` 会先规范化进程内值再验证数据结构。两者保留已编译验证器，检查分类和带类型标识，并执行相同的结构后语义检查。共享黄金样例包括一个补充平面字符与 BMP 字符对比的冻结清单，确保两个运行环境都验证 UTF-16 排序。

封装和引用的目标必须能在注册表中解析。本地 `ArtifactEnvelope.payload` 是已登记的完整目标记录；`legacy_import` 封装则携带精确适配器类型、语义键、规范来源摘要和来源记录，两个运行环境都会用指定适配器重新验证来源记录。`ArtifactRef` 解析目标并检查标识前缀及原生/旧格式来源。

## 命令

```bash
python researcher/scripts/validate_schemas.py --check
python researcher/scripts/validate_schemas.py --write
python researcher/scripts/migrate_legacy.py --dry-run
cd researcher/schemas/typescript && npm ci && npm test
```

`--write` 只更新确定性的公开证据，不会迁移规范输入。运行时 CAS、绑定、隔离详情和私有回执保存在被忽略的私有根路径中。

生成的迁移证据不会扫描 `researcher/runs/*`；它只读取 `public-legacy-sources.json` 明确列出的 Git 跟踪文件。因此，被忽略的私有运行不会影响公开差异，也不会泄露私有信息。操作人员可以传入 `private_operational` 来源清单，并将输出保存在 `researcher/schemas/reports/runtime/` 下。
