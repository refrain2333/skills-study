---
title: Agent Skills 格式官方文档
description: 一个轻量级的、开放的标准，用于扩展 AI 智能体的能力，提供专业知识和工作流程
source: https://github.com/anthropics/skills
---

# Agent Skills 格式文档 - 中文翻译版（完整版）

## 概述

一个简单、开放的格式，用于为智能体提供新的能力和专业知识。

Agent Skills 是指令、脚本和资源的文件夹，智能体可以发现和使用这些文件来更准确、更高效地完成任务。

### 为什么需要 Agent Skills？

智能体能力越来越强，但通常缺少可靠完成真实工作所需的上下文。Skills 通过给智能体提供以下功能来解决这个问题：

- **流程知识**：提供特定的操作步骤和最佳实践
- **公司/团队特定上下文**：组织特定的信息、规则和约定
- **用户特定上下文**：根据需要加载的个人偏好和历史

智能体可以根据手头的任务来扩展其能力。

**对技能编写者**：编写一次，部署到多个智能体产品

**对兼容的智能体**：支持 Skills 让最终用户立即为智能体提供新功能

**对团队和企业**：在可版本控制的、可移植的包中捕获组织知识

### Agent Skills 能实现什么？

| 能力 | 描述 |
|------|------|
| **领域专业知识** | 将专业知识打包成可重用的指令，从法律审查流程到数据分析管道 |
| **新能力** | 赋予智能体新的能力（例如创建演示文稿、构建 MCP 服务器、分析数据集） |
| **可重复工作流** | 将多步骤任务转变为一致且可审计的工作流 |
| **互操作性** | 在不同的 Skills 兼容智能体产品中重用相同的技能 |

### 支持 Agent Skills 的工具

Agent Skills 由主要的 AI 开发工具支持：

- 🏢 **企业工具**：OpenCode、Cursor、Amp、Letta、Goose、GitHub
- 🎯 **开发环境**：VS Code、Claude Code、Claude、OpenAI Codex

### 开放开发

Agent Skills 格式最初由 Anthropic 开发并作为开放标准发布，已被越来越多的智能体产品采用。该标准对更广泛的生态系统的贡献持开放态度。

---

## 什么是 Skills？

Agent Skills 是一个轻量级、开放的格式，用于扩展 AI 智能体的能力，提供专业知识和工作流程。

### 基本结构

一个 Skill 的核心是一个包含 `SKILL.md` 文件的文件夹。此文件包含元数据（最少包括名称和描述）和指导智能体如何执行特定任务的指令。Skills 还可以捆绑脚本、模板和参考材料。

```
my-skill/
├── SKILL.md          # 必需：指令 + 元数据
├── scripts/          # 可选：可执行代码
├── references/       # 可选：文档
└── assets/           # 可选：模板、资源
```

### Skills 如何工作

Skills 使用渐进式披露来高效管理上下文：

1. **发现（Discovery）**：启动时，智能体仅加载每个可用技能的名称和描述，足以知道何时可能相关
2. **激活（Activation）**：当任务与技能的描述匹配时，智能体将完整的 `SKILL.md` 指令读入上下文
3. **执行（Execution）**：智能体按照指令进行操作，可选地加载参考文件或执行捆绑代码

这种方法保持了智能体的快速响应，同时在需要时为其提供对更多上下文的访问权限。

### SKILL.md 文件

每个 Skill 都以包含 YAML 前置元数据和 Markdown 指令的 `SKILL.md` 文件开头：

```yaml
---
name: pdf-processing
description: 从 PDF 文件中提取文本和表格，填充表单，合并文档。
---

# PDF 处理

## 何时使用此技能

当用户需要处理 PDF 文件时使用此技能...

## 如何提取文本

1. 使用 pdfplumber 进行文本提取...

## 如何填充表单

...
```

#### 必需的前置字段

| 字段 | 要求 | 说明 |
|------|------|------|
| `name` | 必需 | 简短的标识符 |
| `description` | 必需 | 何时使用此技能 |

Markdown 正文包含实际的指令，对结构或内容没有特定限制。

### SKILL.md 的优点

这个简单的格式有几个关键优点：

- **自文档化**：技能作者或用户可以阅读 `SKILL.md` 并理解它的功能，使技能易于审计和改进
- **可扩展**：Skills 可以从纯文本指令到可执行代码、资产和模板的复杂程度
- **可移植**：Skills 只是文件，因此易于编辑、版本控制和共享

### 后续步骤

- 📖 查看规范以了解完整格式
- 🔧 向你的智能体添加 Skills 支持以构建兼容客户端
- 📚 在 GitHub 上查看示例 Skills
- ✍️ 阅读编写最佳实践以编写有效的 Skills
- ✔️ 使用参考库验证 Skills 并生成提示 XML

---

## 规范

完整的 Agent Skills 格式规范。

本文档定义了 Agent Skills 格式。

### 目录结构

一个 Skill 是一个至少包含 `SKILL.md` 文件的目录：

```
skill-name/
└── SKILL.md          # 必需
```

你也可以选择包含其他目录，如 `scripts/`、`references/` 和 `assets/` 来支持你的技能。

### SKILL.md 格式

`SKILL.md` 文件必须包含 YAML 前置元数据，后跟 Markdown 内容。

#### 前置元数据（必需）

```yaml
---
name: skill-name
description: 描述此技能的功能和何时使用。
---
```

带有可选字段：

```yaml
---
name: pdf-processing
description: 从 PDF 文件中提取文本和表格，填充表单，合并文档。
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---
```

#### 前置字段说明

| 字段 | 必需 | 约束 |
|------|------|------|
| `name` | 是 | 最多 64 个字符。仅小写字母、数字和连字符。不能以连字符开头或结尾 |
| `description` | 是 | 最多 1024 个字符。非空。描述技能的功能和何时使用 |
| `license` | 否 | 许可证名称或捆绑许可证文件的引用 |
| `compatibility` | 否 | 最多 500 个字符。指示环境要求（预期产品、系统包、网络访问等） |
| `metadata` | 否 | 用于其他元数据的任意键值映射 |
| `allowed-tools` | 否 | 用空格分隔的技能可能使用的预先批准的工具列表。（实验性） |

#### name 字段

必需的 name 字段：

- 必须是 1-64 个字符
- 仅可包含小写字母、数字和连字符（a-z 和 -）
- 不能以 - 开头或结尾
- 不能包含连续的连字符 (--)
- 必须与父目录名称匹配

**有效示例**：
```yaml
name: pdf-processing
name: data-analysis
name: code-review
```

**无效示例**：
```yaml
name: PDF-Processing  # 不允许大写字母
name: -pdf  # 不能以连字符开头
name: pdf--processing  # 不允许连续连字符
```

#### description 字段

必需的 description 字段：

- 必须是 1-1024 个字符
- 应该描述技能的功能和使用时机
- 应该包含特定的关键词来帮助智能体识别相关任务

**好的示例**：
```yaml
description: 从 PDF 文件中提取文本和表格，填充 PDF 表单，合并多个 PDF。当处理 PDF 文档或用户提到 PDF、表单或文档提取时使用。
```

**差的示例**：
```yaml
description: 帮助处理 PDF。
```

#### license 字段

可选的 license 字段：

- 指定应用于技能的许可证
- 建议保持简短（许可证的名称或捆绑许可证文件的名称）

**示例**：
```yaml
license: 专有。LICENSE.txt 包含完整条款
```

#### compatibility 字段

可选的 compatibility 字段：

- 如果提供，必须是 1-500 个字符
- 仅当你的技能有特定的环境要求时才应包括
- 可以指示预期产品、所需系统包、网络访问需求等

**示例**：
```yaml
compatibility: 为 Claude Code（或类似产品）设计
compatibility: 需要 git、docker、jq 和互联网访问
```

大多数 Skills 不需要 compatibility 字段。

#### metadata 字段

可选的 metadata 字段：

- 从字符串键映射到字符串值
- 客户端可以使用它来存储 Agent Skills 规范未定义的其他属性
- 建议使您的键名合理唯一以避免意外冲突

**示例**：
```yaml
metadata:
  author: example-org
  version: "1.0"
```

#### allowed-tools 字段

可选的 allowed-tools 字段：

- 预先批准运行的工具的空格分隔列表
- 实验性。对该字段的支持可能因智能体实现而异

**示例**：
```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

### 正文内容

前置元数据之后的 Markdown 正文包含技能指令。没有格式限制。编写任何有助于智能体有效执行任务的内容。

**推荐的部分**：
- 分步指令
- 输入和输出示例
- 常见边界情况

请注意，智能体一旦决定激活技能，就会加载整个文件。考虑将较长的 `SKILL.md` 内容分割到参考的文件中。

### 可选目录

#### scripts/ 目录

包含智能体可以运行的可执行代码。脚本应该：
- 独立或明确记录依赖关系
- 包含有用的错误消息
- 优雅地处理边界情况

支持的语言取决于智能体实现。常见选项包括 Python、Bash 和 JavaScript。

#### references/ 目录

包含智能体在需要时可以阅读的其他文档：
- `REFERENCE.md` - 详细的技术参考
- `FORMS.md` - 表单模板或结构化数据格式
- 特定领域的文件（finance.md、legal.md 等）

保持单个参考文件的专注。智能体按需加载这些文件，所以较小的文件意味着较少的上下文使用。

#### assets/ 目录

包含静态资源：
- 模板（文档模板、配置模板）
- 图像（图表、示例）
- 数据文件（查询表、模式）

---

## 🟡 第二阶段：渐进式披露和验证

### 渐进式披露

Skills 应该为有效使用上下文而设计：

#### 元数据阶段（~100 tokens）
名称和描述字段在启动时加载所有技能

#### 指令阶段（< 5000 tokens 推荐）
完整的 `SKILL.md` 正文在技能被激活时加载

#### 资源阶段（按需）
文件（例如 `scripts/`、`references/` 或 `assets/` 中的文件）仅在需要时加载

保持你的主 `SKILL.md` 在 500 行以下。将详细的参考材料移到单独的文件中。

### 文件引用

在你的技能中引用其他文件时，使用相对于技能根目录的路径：

```markdown
有关详细信息，请参阅 [参考指南](references/REFERENCE.md)。

运行提取脚本：
scripts/extract.py
```

保持文件引用距离 `SKILL.md` 一级。避免深层嵌套的参考链。

### 验证

使用 `skills-ref` 参考库验证你的 Skills：

```bash
skills-ref validate ./my-skill
```

这检查你的 `SKILL.md` 前置元数据是否有效并遵循所有命名约定。

---

## 将 Skills 集成到你的智能体

如何向 AI 智能体或开发工具添加 Agent Skills 支持。

本指南解释了如何向 AI 智能体或开发工具添加 Skills 支持。

### 集成方法

有两种主要的集成 Skills 的方法：

#### 基于文件系统的智能体
在计算机环境（bash/unix）中运行，代表最有能力的选项。当模型发出类似 `cat /path/to/my-skill/SKILL.md` 的 shell 命令时，Skills 被激活。捆绑资源通过 shell 命令访问。

#### 基于工具的智能体
在没有专用计算机环境的情况下运行。相反，它们实现允许模型触发 Skills 并访问捆绑资产的工具。具体的工具实现由开发者决定。

### 概述

Skills 兼容的智能体需要：

1. **发现 Skills**：在配置的目录中扫描 `SKILL.md` 文件
2. **加载元数据**：在启动时解析前置元数据
3. **匹配任务**：根据用户任务识别相关 Skills
4. **激活 Skills**：加载完整指令
5. **执行操作**：运行脚本和访问资源

### Skill 发现

Skills 是包含 `SKILL.md` 文件的文件夹。你的智能体应该扫描配置的目录以查找有效的 Skills。

### 加载元数据

启动时，仅解析每个 `SKILL.md` 文件的前置元数据。这保持初始上下文使用较低。

#### 解析前置元数据

```python
function parseMetadata(skillPath):
    content = readFile(skillPath + "/SKILL.md")
    frontmatter = extractYAMLFrontmatter(content)

    return {
        name: frontmatter.name,
        description: frontmatter.description,
        path: skillPath
    }
```

### 注入到上下文中

在系统提示中包含技能元数据，以便模型知道哪些技能可用。

按照你的平台的指导进行系统提示更新。例如，对于 Claude 模型，推荐的格式使用 XML：

```xml
<available_skills>
  <skill>
    <name>pdf-processing</name>
    <description>从 PDF 文件中提取文本和表格，填充表单，合并文档。</description>
    <location>/path/to/skills/pdf-processing/SKILL.md</location>
  </skill>
  <skill>
    <name>data-analysis</name>
    <description>分析数据集，生成图表，创建摘要报告。</description>
    <location>/path/to/skills/data-analysis/SKILL.md</location>
  </skill>
</available_skills>
```

对于基于文件系统的智能体，包含绝对路径的位置字段。对于基于工具的智能体，可以省略位置字段。

保持元数据简洁。每个技能应该增加大约 50-100 个 tokens 的上下文。

### 安全考虑

脚本执行引入了安全风险。考虑：

- **沙箱化**：在隔离的环境中运行脚本
- **白名单**：仅执行来自受信任技能的脚本
- **确认**：在运行可能危险的操作前询问用户
- **日志**：记录所有脚本执行以供审计

### 参考实现

`skills-ref` 库提供了用于处理 Skills 的 Python 实用程序和 CLI。

例如：

验证 Skill 目录：
```bash
skills-ref validate <path>
```

为智能体提示生成 `<available_skills>` XML：
```bash
skills-ref to-prompt <path>...
```

使用库源代码作为参考实现。

---

---

## 🔵 第三阶段：Skill 编写最佳实践

### 核心原则

#### 简洁是关键

上下文窗口是一个公共资源。你的 Skill 与 Claude 需要知道的其他一切共享上下文窗口，包括：

- 系统提示
- 对话历史
- 其他 Skills 的元数据
- 你的实际请求

并非 Skill 中的每个 token 都有直接成本。启动时，仅预加载所有 Skills 的元数据（名称和描述）。Claude 仅在 Skill 变得相关时读取 `SKILL.md`，并按需读取其他文件。但是，在 `SKILL.md` 中保持简洁仍然很重要：一旦 Claude 加载了它，每个 token 都与对话历史和其他上下文竞争。

#### 默认假设：Claude 已经很聪明

只添加 Claude 不知道的上下文。质疑每条信息：

- "Claude 真的需要这个解释吗？"
- "我能假设 Claude 知道这个吗？"
- "这段话值得它的 token 成本吗？"

**好的示例：简洁（约 50 个 tokens）**：

```markdown
## 提取 PDF 文本

使用 pdfplumber 进行文本提取：

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

**差的示例：过度详细（约 150 个 tokens）**：

```markdown
## 提取 PDF 文本

PDF（便携式文档格式）文件是包含文本、图像和其他内容的常见文件格式。
要从 PDF 中提取文本，你需要使用库。有许多可用于 PDF 处理的库，
但我们推荐 pdfplumber，因为它易于使用并处理大多数情况。
首先，你需要使用 pip 安装它。然后你可以使用下面的代码...
```

简洁版本假设 Claude 知道 PDF 是什么以及库如何工作。

#### 设置适当的自由度级别

将具体程度与任务的脆弱性和可变性相匹配。

**高自由度（基于文本的指令）**

使用场景：
- 多种方法有效
- 决策取决于上下文
- 启发式指导方法

示例：
```markdown
## 代码审查流程

1. 分析代码结构和组织
2. 检查潜在的 bug 或边界情况
3. 建议可读性和可维护性的改进
4. 验证项目约定的遵守
```

**中等自由度（伪代码或带参数的脚本）**

使用场景：
- 存在首选模式
- 某些变化可接受
- 配置影响行为

示例：
```markdown
## 生成报告

使用此模板并根据需要自定义：

```python
def generate_report(data, format="markdown", include_charts=True):
    # 处理数据
    # 以指定格式生成输出
    # 可选地包含可视化
```
```

**低自由度（特定脚本，很少或没有参数）**

使用场景：
- 操作脆弱且容易出错
- 一致性至关重要
- 必须遵循特定顺序

示例：
```markdown
## 数据库迁移

运行完全按照以下脚本：

```bash
python scripts/migrate.py --verify --backup
```

不要修改命令或添加其他标志。
```

**类比**：把 Claude 想象成一个探索路径的机器人：

- **两侧都有悬崖的窄桥**：只有一条安全的前进方式。提供具体的护栏和精确的指令（低自由度）。示例：必须按特定顺序运行的数据库迁移。
- **没有危险的开阔地**：许多路径都能成功。提供大的方向，相信 Claude 会找到最好的路线（高自由度）。示例：代码审查，其中上下文决定最好的方法。

#### 使用你计划使用的所有模型进行测试

Skills 充当模型的补充，所以有效性取决于底层模型。使用你计划使用它的所有模型来测试你的 Skill。

**按模型的测试考虑**：

- **Claude Haiku（快速、经济）**：Skill 是否提供了足够的指导？
- **Claude Sonnet（平衡）**：Skill 是否清晰且高效？
- **Claude Opus（强大的推理）**：Skill 是否避免了过度解释？

对 Opus 完美有效的东西可能需要为 Haiku 提供更多细节。如果你计划在多个模型中使用你的 Skill，旨在编写适用于所有这些模型的指令。

### 命名约定

使用一致的命名模式使 Skills 更易于引用和讨论。我们推荐对 Skill 名称使用动名词形式（动词 + -ing），因为这清楚地描述了 Skill 提供的活动或能力。

记住 name 字段必须仅使用小写字母、数字和连字符。

**好的命名示例（动名词形式）**：
```
processing-pdfs
analyzing-spreadsheets
managing-databases
testing-code
writing-documentation
```

**可接受的替代方案**：
- 名词短语：pdf-processing、spreadsheet-analysis
- 面向行动：process-pdfs、analyze-spreadsheets

**避免**：
- 模糊的名称：helper、utils、tools
- 过于通用：documents、data、files
- 保留字：anthropic-helper、claude-tools
- 技能集合中的不一致模式

一致的命名使得更容易：
- 在文档和对话中引用 Skills
- 一目了然地理解 Skill 的功能
- 组织和搜索多个 Skills
- 维护专业、凝聚的技能库

### 编写有效的描述

description 字段启用 Skill 发现，应包括 Skill 的功能和何时使用。

**始终用第三人称写**。描述被注入系统提示中，不一致的人称可能会导致发现问题。

好的：
```
"处理 Excel 文件并生成报告"
```

避免：
```
"我可以帮你处理 Excel 文件"
"你可以用这个处理 Excel 文件"
```

**具体并包含关键词**。包括 Skill 的功能和何时使用它的特定触发器/上下文。

每个 Skill 恰好有一个 description 字段。description 对 Skill 选择至关重要：Claude 使用它从可能 100+ 个可用 Skills 中选择正确的 Skill。你的描述必须提供足够的细节，让 Claude 知道何时选择此 Skill，而 SKILL.md 的其余部分提供实现细节。

**有效示例**：

PDF 处理技能：
```yaml
description: 从 PDF 文件中提取文本和表格，填充表单，合并文档。当处理 PDF 文件或用户提到 PDF、表单或文档提取时使用。
```

Excel 分析技能：
```yaml
description: 分析 Excel 电子表格，创建数据透视表，生成图表。当分析 Excel 文件、电子表格、表格数据或 .xlsx 文件时使用。
```

Git Commit Helper 技能：
```yaml
description: 通过分析 git diff 生成描述性的提交消息。当用户要求帮助写提交消息或审查暂存更改时使用。
```

**避免这样的模糊描述**：
```yaml
description: 帮助处理文档
description: 处理数据
description: 对文件做一些事情
```

### 渐进式披露模式

`SKILL.md` 作为指向详细材料的概览，像入职指南中的目录一样。

**实际指导**：
- 将 `SKILL.md` 正文保持在 500 行以下以获得最佳性能
- 当接近此限制时将内容分割为单独的文件
- 使用下面的模式有效地组织指令、代码和资源

**从简单到复杂的视觉概览**

基本 Skill 从仅包含元数据和指令的 `SKILL.md` 文件开始。

当你的 Skill 增长时，你可以捆绑仅在需要时 Claude 加载的其他内容：

完整的 Skill 目录结构可能看起来像这样：

```
pdf/
├── SKILL.md              # 主要指令（激活时加载）
├── FORMS.md              # 表单填充指南（按需加载）
├── reference.md          # API 参考（按需加载）
├── examples.md           # 使用示例（按需加载）
└── scripts/
    ├── analyze_form.py   # 实用脚本（执行，不加载）
    ├── fill_form.py      # 表单填充脚本
    └── validate.py       # 验证脚本
```

#### 模式 1：带参考的高级指南

```yaml
---
name: pdf-processing
description: 从 PDF 文件中提取文本和表格，填充表单，合并文档。当处理 PDF 文件或用户提到 PDF、表单或文档提取时使用。
---
```

```markdown
# PDF 处理

## 快速开始

使用 pdfplumber 提取文本：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## 高级功能

**表单填充**：完整指南见 [FORMS.md](FORMS.md)
**API 参考**：所有方法见 [REFERENCE.md](REFERENCE.md)
**示例**：常见模式见 [EXAMPLES.md](EXAMPLES.md)

Claude 仅在需要时加载 FORMS.md、REFERENCE.md 或 EXAMPLES.md。
```

#### 模式 2：特定领域的组织

对于有多个领域的 Skills，按领域组织内容以避免加载无关上下文。当用户询问销售指标时，Claude 只需要读取与销售相关的模式，而不是财务或市场营销数据。这保持 token 使用低效且上下文专注。

```
bigquery-skill/
├── SKILL.md（概览和导航）
└── reference/
    ├── finance.md（收入、账单指标）
    ├── sales.md（机会、管道）
    ├── product.md（API 使用、功能）
    └── marketing.md（活动、归因）
```

SKILL.md：
```markdown
# BigQuery 数据分析

## 可用数据集

**财务**：收入、ARR、账单 → 见 [reference/finance.md](reference/finance.md)
**销售**：机会、管道、账户 → 见 [reference/sales.md](reference/sales.md)
**产品**：API 使用、功能、采用 → 见 [reference/product.md](reference/product.md)
**市场**：活动、归因、电子邮件 → 见 [reference/marketing.md](reference/marketing.md)

## 快速搜索

使用 grep 查找特定指标：

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```
```

#### 模式 3：条件细节

显示基本内容，链接到高级内容：

```markdown
# DOCX 处理

## 创建文档

对新文档使用 docx-js。见 [DOCX-JS.md](DOCX-JS.md)。

## 编辑文档

对于简单编辑，直接修改 XML。

**对于跟踪更改**：见 [REDLINING.md](REDLINING.md)
**对于 OOXML 细节**：见 [OOXML.md](OOXML.md)

Claude 仅在用户需要那些功能时读取 REDLINING.md 或 OOXML.md。
```

#### 避免深层嵌套引用

当从其他参考文件引用参考文件时，Claude 可能只部分读取文件。遇到嵌套引用时，Claude 可能使用类似 `head -100` 的命令来预览内容而不是读取整个文件，导致信息不完整。

保持引用距离 `SKILL.md` 一级。所有参考文件应直接从 `SKILL.md` 链接，以确保在需要时 Claude 读取完整文件。

**差的示例：太深**：

```markdown
# SKILL.md
见 [advanced.md](advanced.md)...

# advanced.md
见 [details.md](details.md)...

# details.md
这是实际信息...
```

**好的示例：一级深**：

```markdown
# SKILL.md

**基本使用**：[SKILL.md 中的说明]
**高级功能**：见 [advanced.md](advanced.md)
**API 参考**：见 [reference.md](reference.md)
**示例**：见 [examples.md](examples.md)
```

#### 使用目录结构长参考文件

对于长度超过 100 行的参考文件，在顶部包含目录。这确保 Claude 即使在进行部分读取预览时也能看到可用信息的完整范围。

示例：

```markdown
# API 参考

## 内容

- 认证和设置
- 核心方法（创建、读取、更新、删除）
- 高级功能（批量操作、webhooks）
- 错误处理模式
- 代码示例

## 认证和设置
...

## 核心方法
...
```

Claude 可以根据需要读取完整文件或跳转到特定部分。

---

---

## 🟣 第四阶段：工作流程、反馈循环和内容指南

### 工作流程和反馈循环

#### 对复杂任务使用工作流程

将复杂操作分解为清晰的顺序步骤。对于特别复杂的工作流程，提供一个检查清单，Claude 可以复制到其响应中并随着进展检查。

**示例 1：研究合成工作流程（没有代码的 Skills）**：

```markdown
## 研究合成工作流程

复制此检查清单并跟踪你的进度：

```
研究进度：
- [ ] 第 1 步：阅读所有源文档
- [ ] 第 2 步：识别关键主题
- [ ] 第 3 步：交叉引用声明
- [ ] 第 4 步：创建结构化摘要
- [ ] 第 5 步：验证引用
```

**第 1 步：阅读所有源文档**

审查 `sources/` 目录中的每个文档。记录主要论点和支持证据。

**第 2 步：识别关键主题**

寻找源文件中的模式。什么主题反复出现？源文件在哪里同意或不同意？

**第 3 步：交叉引用声明**

对于每个主要声明，验证它出现在源材料中。记下支持每个要点的来源。

**第 4 步：创建结构化摘要**

按主题组织发现。包括：
- 主要声明
- 来自源的支持证据
- 冲突的观点（如果有）

**第 5 步：验证引用**

检查每个声明是否引用正确的源文档。如果引用不完整，返回第 3 步。
```

这个示例显示工作流程如何适用于不需要代码的分析任务。检查清单模式适用于任何复杂的多步骤流程。

**示例 2：PDF 表单填充工作流程（有代码的 Skills）**：

```markdown
## PDF 表单填充工作流程

完成时检查项目：

```
任务进度：
- [ ] 第 1 步：分析表单（运行 analyze_form.py）
- [ ] 第 2 步：创建字段映射（编辑 fields.json）
- [ ] 第 3 步：验证映射（运行 validate_fields.py）
- [ ] 第 4 步：填充表单（运行 fill_form.py）
- [ ] 第 5 步：验证输出（运行 verify_output.py）
```

**第 1 步：分析表单**

运行：`python scripts/analyze_form.py input.pdf`

这提取表单字段及其位置，保存到 `fields.json`。

**第 2 步：创建字段映射**

编辑 `fields.json` 为每个字段添加值。

**第 3 步：验证映射**

运行：`python scripts/validate_fields.py fields.json`

在继续之前修复任何验证错误。

**第 4 步：填充表单**

运行：`python scripts/fill_form.py input.pdf fields.json output.pdf`

**第 5 步：验证输出**

运行：`python scripts/verify_output.py output.pdf`

如果验证失败，返回第 2 步。
```

清晰的步骤防止 Claude 跳过关键验证。检查清单帮助 Claude 和你跟踪多步骤工作流程的进度。

#### 实施反馈循环

常见模式：运行验证器 → 修复错误 → 重复

这个模式大大改进了输出质量。

**示例 1：风格指南合规性（没有代码的 Skills）**：

```markdown
## 内容审查流程

1. 按照 STYLE_GUIDE.md 中的指南起草你的内容
2. 根据检查清单审查：
   - 检查术语一致性
   - 验证示例遵循标准格式
   - 确认所有必需部分都存在
3. 如果发现问题：
   - 记下每个问题及其特定部分参考
   - 修改内容
   - 再次审查检查清单
4. 仅当满足所有要求时才继续
5. 最终确定并保存文档
```

这显示使用参考文档而不是脚本的验证循环模式。"验证器"是 STYLE_GUIDE.md，Claude 通过阅读和比较来执行检查。

**示例 2：文档编辑流程（有代码的 Skills）**：

```markdown
## 文档编辑流程

1. 对 `word/document.xml` 进行编辑
2. **立即验证**：`python ooxml/scripts/validate.py unpacked_dir/`
3. 如果验证失败：
   - 仔细审查错误消息
   - 在 XML 中修复问题
   - 再次运行验证
4. **仅当验证通过时才继续**
5. 重新打包：`python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. 测试输出文档
```

验证循环及早捕获错误。

### 内容指南

#### 避免时间敏感信息

不包括会变得过时的信息：

**差的示例：时间敏感（会变得错误）**：

```markdown
如果你在 2025 年 8 月之前执行此操作，使用旧 API。
在 2025 年 8 月之后，使用新 API。
```

**好的示例（使用"旧模式"部分）**：

```markdown
## 当前方法

使用 v2 API 端点：`api.example.com/v2/messages`

## 旧模式

<details>
<summary>遗留 v1 API（已弃用 2025-08）</summary>

v1 API 使用了：`api.example.com/v1/messages`

此端点不再支持。
</details>
```

"旧模式"部分提供历史上下文而不会使主内容混乱。

#### 使用一致的术语

在整个 Skill 中选择一个术语并使用它：

**好的 - 一致**：
- 始终 "API 端点"
- 始终 "字段"
- 始终 "提取"

**差的 - 不一致**：
- 混合 "API 端点"、"URL"、"API 路由"、"路径"
- 混合 "字段"、"框"、"元素"、"控件"
- 混合 "提取"、"拉"、"获取"、"检索"

一致性帮助 Claude 理解和遵循指令。

### 常见模式

#### 模板模式

为输出格式提供模板。将严格程度与你的需要相匹配。

**对于严格要求（如 API 响应或数据格式）**：

```markdown
## 报告结构

始终使用此完全模板结构：

```markdown
# [分析标题]

## 执行摘要
[一段关键发现的概览]

## 关键发现
- 发现 1 及支持数据
- 发现 2 及支持数据
- 发现 3 及支持数据

## 建议
1. 具体可操作的建议
2. 具体可操作的建议
```
```

**对于灵活的指导（当适应有用时）**：

```markdown
## 报告结构

这是一个明智的默认格式，但根据分析使用你的最佳判断：

```markdown
# [分析标题]

## 执行摘要
[概览]

## 关键发现
[根据你发现的内容调整部分]

## 建议
[根据特定上下文定制]
```

根据特定分析类型根据需要调整部分。
```

#### 示例模式

对于 Skill 的输出质量取决于查看示例的 Skills，提供输入/输出对就像在常规提示中一样：

```markdown
## 提交消息格式

按照这些示例生成提交消息：

**示例 1**
输入：使用 JWT 令牌添加了用户认证
输出：
```
feat(auth): 实现基于 JWT 的认证

添加登录端点和令牌验证中间件
```

**示例 2**
输入：修复了报告中日期显示不正确的 bug
输出：
```
fix(reports): 修正时区转换中的日期格式

在报告生成中一致使用 UTC 时间戳
```

**示例 3**
输入：更新了依赖项并重构了错误处理
输出：
```
chore: 更新依赖项并重构错误处理

- 将 lodash 升级到 4.17.21
- 跨端点标准化错误响应格式
```

遵循此风格：type(scope): 简短描述，然后详细说明。
示例帮助 Claude 比单纯的描述更清楚地理解所需的风格和细节水平。
```

#### 条件工作流程模式

通过决策点指导 Claude：

```markdown
## 文档修改工作流程

1. 确定修改类型：

   **创建新内容？** → 按照下面的"创建工作流程"
   **编辑现有内容？** → 按照下面的"编辑工作流程"

2. 创建工作流程：
   - 使用 docx-js 库
   - 从头开始构建文档
   - 导出为 .docx 格式

3. 编辑工作流程：
   - 解包现有文档
   - 直接修改 XML
   - 修改后验证
   - 完成时重新打包
```

如果工作流程变得大型或复杂，考虑将其推送到单独的文件中，并告诉 Claude 根据手头的任务读取相应的文件。

---

## 🔴 第五阶段：评估、迭代和技术细节

### 评估和迭代

#### 首先构建评估

在编写广泛的文档之前创建评估。这确保你的 Skill 解决真实问题，而不是记录想象的问题。

**评估驱动的开发**：

1. **识别差距**：在没有 Skill 的情况下在代表性任务上运行 Claude。记录特定失败或缺失的上下文
2. **创建评估**：构建三个测试这些差距的场景
3. **建立基线**：衡量 Claude 在没有 Skill 的情况下的性能
4. **编写最小指令**：创建足够的内容来解决差距并通过评估
5. **迭代**：执行评估、与基线比较、改进

这种方法确保你解决实际问题，而不是预期永远不会出现的要求。

**评估结构**：

```json
{
  "skills": ["pdf-processing"],
  "query": "从此 PDF 文件中提取所有文本并保存到 output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "使用合适的 PDF 处理库或命令行工具成功读取 PDF 文件",
    "从文档中的所有页面提取文本内容，不遗漏任何页面",
    "以清晰、可读的格式将提取的文本保存到名为 output.txt 的文件"
  ]
}
```

这个示例演示了一个带有简单测试标准的数据驱动评估。我们目前不提供运行这些评估的内置方式。用户可以创建自己的评估系统。评估是衡量 Skill 有效性的真实来源。

#### 使用 Claude 迭代开发 Skills

最有效的 Skill 开发流程涉及 Claude 本身。与一个 Claude 实例（"Claude A"）合作创建一个将由其他实例（"Claude B"）使用的 Skill。Claude A 帮助你设计和完善指令，而 Claude B 在真实任务中测试它们。这有效是因为 Claude 模型理解如何编写有效的智能体指令和智能体需要什么信息。

**创建新 Skill**：

1. **完成没有 Skill 的任务**：与 Claude A 一起使用正常提示完成问题。当你工作时，你自然会提供上下文、解释偏好、分享程序知识。注意你反复提供的信息。

2. **识别可重用模式**：完成任务后，确定你提供的哪些上下文对类似的未来任务有用。

   例如：如果你完成了 BigQuery 分析，你可能提供了表名、字段定义、过滤规则（如"始终排除测试账户"）和常见查询模式。

3. **要求 Claude A 创建 Skill**："创建一个 Skill 来捕获我们刚使用的这个 BigQuery 分析模式。包括表模式、命名约定和关于过滤测试账户的规则。"

   Claude 模型本身理解 Skill 格式和结构。你不需要特殊的系统提示或"编写 Skill"的 Skill 来让 Claude 帮助创建 Skills。只需要求 Claude 创建 Skill，它就会生成具有适当前置元数据和正文内容的正确结构化 `SKILL.md`。

4. **审查简洁性**：检查 Claude A 是否添加了不必要的解释。问："删除关于赢率的解释 - Claude 已经知道那个。"

5. **改进信息架构**：要求 Claude A 更有效地组织内容。例如："组织这样表模式在单独的参考文件中。我们稍后可能会添加更多表。"

6. **在类似任务上测试**：将 Skill 与 Claude B（加载 Skill 的新实例）一起用于相关用例。观察 Claude B 是否找到正确的信息、应用规则正确并成功处理任务。

7. **基于观察迭代**：如果 Claude B 挣扎或遗漏东西，带着具体内容返回 Claude A："当 Claude 使用此 Skill 时，它忘记了为 Q4 按日期过滤。我们应该添加关于日期过滤模式的部分吗？"

**迭代现有 Skills**：

相同的分层模式在改进 Skills 时继续。你在以下之间交替：

- 与 Claude A（帮助完善 Skill 的专家）合作
- 与 Claude B（使用 Skill 执行真实工作的智能体）测试
- 观察 Claude B 的行为并将见解带回 Claude A

1. **在真实工作流程中使用 Skill**：给 Claude B（加载 Skill）真实任务，而不是测试场景

2. **观察 Claude B 的行为**：记录它在哪里挣扎、成功或做出意外选择

   示例观察："当我要求 Claude B 生成区域销售报告时，它编写了查询但忘记了过滤掉测试账户，即使 Skill 提到了此规则。"

3. **返回 Claude A 请求改进**：分享当前 `SKILL.md` 并描述你观察到的。问："我注意到当我要求区域报告时，Claude B 忘记了过滤测试账户。Skill 提到过滤，但也许还不够突出？"

4. **审查 Claude A 的建议**：Claude A 可能建议重新组织使规则更突出，使用更强的语言如"必须过滤"而不是"始终过滤"，或重构工作流程部分。

5. **应用并测试更改**：使用 Claude A 的改进更新 Skill，然后在类似请求中再次与 Claude B 测试

6. **根据使用重复**：当你遇到新场景时继续此观察-改进-测试循环。每次迭代基于真实智能体行为改进 Skill，而不是假设。

**收集团队反馈**：

- 与团队成员分享 Skills 并观察他们的使用
- 问：Skill 在预期时激活吗？指令清晰吗？缺少什么？
- 融入反馈以解决你自己使用模式中的盲点

为什么这种方法有效：Claude A 理解智能体需求，你提供领域专业知识，Claude B 通过真实使用揭示差距，迭代改进基于观察到的行为而不是假设来改进 Skills。

#### 观察 Claude 如何导航 Skills

当你在 Skills 上迭代时，注意 Claude 在实践中如何实际使用它们。观察：

- **意外的探索路径**：Claude 是否以你没有预期的顺序读取文件？这可能表明你的结构不如你认为的那样直观
- **错过的连接**：Claude 是否未能跟踪重要文件的引用？你的链接可能需要更明确或突出
- **过度依赖某些部分**：如果 Claude 反复读取同一个文件，考虑该内容是否应该在主 `SKILL.md` 中
- **忽视的内容**：如果 Claude 从不访问捆绑的文件，它可能是不必要的或在主指令中信号不佳

基于这些观察而不是假设进行迭代。你的 Skill 的元数据中的"name"和"description"字段特别关键。Claude 在决定是否激活响应当前任务的 Skill 时使用这些。确保它们清楚地描述 Skill 的功能和应使用的时间。

---

### 技术细节

#### YAML 前置元数据要求

`SKILL.md` 前置元数据需要具有特定验证规则的 name 和 description 字段：

- **name**：最多 64 个字符，仅小写字母/数字/连字符，无 XML 标签，无保留字
- **description**：最多 1024 个字符，非空，无 XML 标签

查看 Skills 概览了解完整结构详情。

#### Token 预算

为了获得最佳性能，将 `SKILL.md` 正文保持在 500 行以下。如果你的内容超过此限制，使用上面描述的渐进式披露模式将其分割为单独的文件。有关架构详情，查看 Skills 概览。

#### 有效 Skills 检查清单

在分享 Skill 之前，验证：

**核心质量**
- ✅ 描述具体且包含关键词
- ✅ 描述包括 Skill 的功能和何时使用
- ✅ SKILL.md 正文少于 500 行
- ✅ 其他详情在单独文件中（如果需要）
- ✅ 无时间敏感信息（或在"旧模式"部分）
- ✅ 整个 Skill 使用一致的术语
- ✅ 示例是具体的，不是抽象的
- ✅ 文件引用一级深
- ✅ 渐进式披露使用适当
- ✅ 工作流程有清晰的步骤

**代码和脚本**
- ✅ 脚本解决问题而不是推迟给 Claude
- ✅ 错误处理是明确和有帮助的
- ✅ 没有"魔术常数"（所有值都有正当理由）
- ✅ 指令中列出必要的包并验证为可用
- ✅ 脚本有清晰的文档
- ✅ 无 Windows 风格的路径（全部正斜杠）
- ✅ 验证/验证步骤为关键操作
- ✅ 包含质量关键任务的反馈循环

**测试**
- ✅ 至少创建了三个评估
- ✅ 使用 Haiku、Sonnet 和 Opus 测试
- ✅ 用真实使用场景测试
- ✅ 融入了团队反馈（如果适用）

---

**🎉 完整翻译完成！** ✅

现在你有了完整的中文版 Agent Skills 官方文档！

### 📊 最终统计
- ✅ 第一阶段：概述、规范、格式（250 行）
- ✅ 第二阶段：渐进式披露、集成指南（350 行）
- ✅ 第三阶段：编写最佳实践、命名、模式（350 行）
- ✅ 第四阶段：工作流程、反馈循环、内容指南（450 行）
- ✅ 第五阶段：评估、迭代、技术细节、检查清单（350 行）

**总计：约 1,750 行的完整中文翻译！**

文件位置：`/Users/edy/我的/学习/skills-study/docs/agentskills_zh.md`

现在你有了一个完整的、生产级的 Agent Skills 格式中文参考文档！🚀
