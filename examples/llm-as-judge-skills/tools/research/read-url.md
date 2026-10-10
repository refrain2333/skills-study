# 读取网址工具

## 用途

读取给定网址并提取正文，返回结构化文本以及来源元数据。通常在 `webSearch` 找到相关结果后使用。

## 输入

| 字段 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| `url` | string | 是 | 待读取的网址 |
| `contentType` | enum | 否 | `auto`、`article`、`documentation`、`paper` 或 `code`，用于优化提取 |
| `maxLength` | number | 否 | 返回字符数上限，默认 10,000，范围 1,000—50,000 |
| `extractSections` | boolean | 否 | 是否识别并标记章节，默认是 |
| `includeMetadata` | boolean | 否 | 是否包含作者、日期等信息，默认是 |

## 输出

返回成功状态、网址和标题、正文及可选章节、作者/发布日期/描述/关键词等元数据，以及总字符数、是否截断和章节数。失败时包含错误代码和说明。

## 内容类型处理

| 类型 | 处理方式 |
| --- | --- |
| `article` | 优先提取正文，跳过侧栏 |
| `documentation` | 保留代码块和结构 |
| `paper` | 提取摘要、章节和参考文献 |
| `code` | 保留格式和语法突出显示 |
| `auto` | 根据内容自动识别 |

## 错误类型

包括 `URL_NOT_FOUND`、`ACCESS_DENIED`、`TIMEOUT`、`BLOCKED`、`INVALID_CONTENT` 和 `UNSUPPORTED_TYPE`。

## 实现建议

遵守 robots.txt；限制同域请求速率；使用合适的 User-Agent；将超时设为 10—30 秒；对依赖 JavaScript 的网页考虑使用无头浏览器；缓存重复读取的内容。
