# PRD：X-to-Book 多代理系统

## 概述

一个多代理系统，每天监控目标 X（Twitter）账户，综合其内容，并从累积的见解生成结构化的书籍。该系统使用上下文工程原则来处理高数据量的社交数据，同时保持连贯的长篇幅输出。

## 问题陈述

手动从 X 账户整理见解很耗时且不一致。现有工具只是转储原始数据而不进行综合。我们需要一个系统，该系统：
- 持续监控指定的 X 账户
- 跨时间提取有意义的模式和见解
- 生成结构化、连贯的每日书籍输出
- 保持对叙述如何演变的时间意识

## 架构

### 多代理模式选择：监督者/协调器

基于上下文工程模式，我们使用**监督者架构**，因为：
1. 书籍生产有明确的顺序阶段（爬虫、分析、合成、写作、编辑）
2. 质量门控需要中央协调
3. 人工监督点定义明确
4. 按阶段的上下文隔离防止注意力饱和

```
用户配置 -> 协调器 -> [爬虫、分析器、合成器、写手、编辑] -> 每日书籍
```

### 代理定义

#### 1. 协调器代理
**目的**：中央协调器，管理工作流、维护状态、路由到专家。

**上下文预算**：为任务分解、质量门控和综合协调保留。不携带原始推文数据。

**职责**：
- 将每日书籍任务分解为子任务
- 路由到适当的专家代理
- 为长时间运行的操作实现检查点/恢复
- 聚合结果而不进行改述（避免电话游戏问题）

```python
class OrchestratorState(TypedDict):
    target_accounts: List[str]
    current_phase: str
    phase_outputs: Dict[str, Any]
    quality_scores: Dict[str, float]
    book_outline: str
    checkpoints: List[Dict]
```

#### 2. 爬虫代理
**目的**：从目标 X 账户获取和规范化内容。

**上下文预算**：最小。一次操作一个账户，输出到文件系统。

**工具**：
- `fetch_timeline(account_id, since_date, until_date)` - 检索日期范围内的推文
- `fetch_thread(tweet_id)` - 扩展完整的线程上下文
- `fetch_engagement_metrics(tweet_ids)` - 获取点赞/转推/回复
- `write_to_store(account_id, data)` - 持久化到文件系统

**输出**：每个账户的结构化 JSON，写入文件系统（不通过上下文传递）。

#### 3. 分析器代理
**目的**：从原始内容中提取模式、主题和见解。

**上下文预算**：中等。通过文件系统读取一次处理一个账户的数据。

**职责**：
- 主题提取和聚类
- 随时间的情感分析
- 关键见解识别
- 线程叙述提取
- 争议/辩论识别

**输出**：每个账户的结构化分析，包含：
- 顶级主题（按频率和参与度排名）
- 显著引用（带上下文）
- 叙述弧（多推文线程）
- 时间模式（一天中的时间、响应模式）

#### 4. 合成器代理
**目的**：跨账户模式识别和主题合并。

**上下文预算**：高。从所有分析的账户接收摘要。

**职责**：
- 识别跨账户主题
- 检测同意/不同意模式
- 构建叙述连接
- 生成带有章节结构的书籍大纲

**输出**：带有以下内容的书籍大纲：
- 章节结构
- 每章主题分配
- 源属性映射
- 建议的叙述流

#### 5. 写手代理
**目的**：从大纲和源材料生成书籍内容。

**上下文预算**：按章节分配。一次处理一章。

**职责**：
- 遵循大纲起草章节内容
- 集成带有适当属性的引用
- 保持一致的声音和风格
- 处理主题之间的过渡

**输出**：markdown 格式的草稿章节。

#### 6. 编辑代理
**目的**：质量保证和细化。

**上下文预算**：按章节。一次审查一章。

**职责**：
- 针对源材料进行事实检查
- 验证引用准确性
- 检查叙述连贯性
- 为人工审查标记潜在问题

**输出**：带有修订备注的编辑章节。

---

## 记忆系统设计

### 架构：时间知识图谱

基于记忆系统技能，我们需要**时间知识图谱**，因为：
- 关于账户的事实随时间变化（意见转变、主题演变）
- 我们需要时间旅行查询（"@账户在一月份对 X 的立场是什么？"）
- 跨账户关系需要图遍历
- 简单的向量存储会丢失关系结构

### 实体类型

```python
entities = {
    "Account": {
        "properties": ["handle", "display_name", "bio", "follower_count", "following_count"]
    },
    "Tweet": {
        "properties": ["content", "timestamp", "engagement_score", "thread_id"]
    },
    "Theme": {
        "properties": ["name", "description", "first_seen", "last_seen"]
    },
    "Book": {
        "properties": ["date", "title", "chapter_count", "word_count"]
    },
    "Chapter": {
        "properties": ["title", "theme", "word_count", "source_accounts"]
    }
}
```

### 关系类型

```python
relationships = {
    "POSTED": {
        "from": "Account",
        "to": "Tweet",
        "temporal": True
    },
    "DISCUSSES": {
        "from": "Tweet",
        "to": "Theme",
        "temporal": True,
        "properties": ["sentiment", "stance"]
    },
    "RESPONDS_TO": {
        "from": "Tweet",
        "to": "Tweet"
    },
    "AGREES_WITH": {
        "from": "Account",
        "to": "Account",
        "temporal": True,
        "properties": ["on_theme"]
    },
    "DISAGREES_WITH": {
        "from": "Account",
        "to": "Account",
        "temporal": True,
        "properties": ["on_theme"]
    },
    "CONTAINS": {
        "from": "Book",
        "to": "Chapter"
    },
    "SOURCES": {
        "from": "Chapter",
        "to": "Tweet"
    }
}
```

### 记忆检索模式

```python
# @账户在过去 30 天说了关于 AI 的什么？
query_account_theme_temporal(account_id, theme="AI", days=30)

# 哪些账户在加密货币上不一致？
query_disagreement_network(theme="crypto")

# 今天的书中关于监管的哪些引用应该被包含？
query_quotable_content(theme="regulation", min_engagement=100)
```

---

## 上下文优化策略

### 挑战

X 数据数据量大。一个目标账户每天 20 条推文，跨 10 个账户 = 每天 200 条推文。每条带线程上下文的推文平均 500 tokens。日常原始上下文 = 分析前 100k tokens。

### 优化技术

#### 1. 观察掩蔽
原始推文数据由爬虫处理，写入文件系统，永远不通过协调器上下文传递。

```python
# 而不是通过上下文传递原始推文
# 爬虫写入文件系统
scraper.write_to_store(account_id, raw_tweets)

# 分析器从文件系统读取
raw_data = analyzer.read_from_store(account_id)
```

#### 2. 压缩触发器

```python
COMPACTION_THRESHOLD = 0.7  # 70% 上下文使用率

if context_utilization > COMPACTION_THRESHOLD:
    # 汇总较早的阶段输出
    phase_outputs = compact_phase_outputs(phase_outputs)
```

#### 3. 渐进式信息披露

书籍大纲首先加载（轻量级）。完整的章节内容仅在写手处理该章节时加载。

```python
# 第 1 级：仅大纲
book_outline = {
    "chapters": [
        {"title": "第 1 章", "themes": ["AI", "监管"], "word_count_target": 2000}
    ]
}

# 第 2 级：完整章节上下文（仅在写作时）
chapter_context = load_chapter_context(chapter_id)
```

#### 4. KV 缓存优化

系统提示和工具定义在运行中是稳定的。构造上下文以获得缓存命中：

```python
context_order = [
    system_prompt,       # 稳定、可缓存
    tool_definitions,    # 稳定、可缓存
    account_config,      # 半稳定
    daily_outline,       # 每天变化
    current_task         # 每次调用变化
]
```

---

## 工具设计

### 应用的整合原则

我们实现每个域的综合工具，而不是多个狭窄的工具：

#### X 数据工具（整合）

```python
def x_data_tool(
    action: Literal["fetch_timeline", "fetch_thread", "fetch_engagement", "search"],
    account_id: Optional[str] = None,
    tweet_id: Optional[str] = None,
    query: Optional[str] = None,
    since_date: Optional[str] = None,
    until_date: Optional[str] = None,
    format: Literal["concise", "detailed"] = "concise"
) -> Dict:
    """
    统一的 X 数据检索工具。
    
    何时使用：
    - 为目标账户监控获取时间线
    - 为完整对话扩展线程上下文
    - 为内容优先化获取参与度指标
    - 跨账户搜索特定主题
    
    操作：
    - fetch_timeline：获取日期范围内的账户推文
    - fetch_thread：从单个推文扩展完整线程
    - fetch_engagement：获取点赞/转推/回复
    - search：跨账户搜索查询
    
    返回：
    - concise: tweet_id、content_preview、timestamp、engagement_score
    - detailed: 完整内容、线程上下文、所有参与度指标、回复预览
    
    错误：
    - RATE_LIMITED：等待 {retry_after} 秒
    - ACCOUNT_PRIVATE：无法访问私人账户
    - NOT_FOUND：推文/账户不存在
    """
```

#### 记忆工具（整合）

```python
def memory_tool(
    action: Literal["store", "query", "update_validity", "consolidate"],
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    relationship_type: Optional[str] = None,
    query_params: Optional[Dict] = None,
    as_of_date: Optional[str] = None
) -> Dict:
    """
    统一的记忆系统工具。
    
    何时使用：
    - 存储从 X 数据发现的新事实
    - 查询关于账户/主题的历史信息
    - 在事实变化时更新有效期
    - 运行整合以合并重复的事实
    
    操作：
    - store：添加新实体或关系
    - query：检索与参数匹配的实体/关系
    - update_validity：用 valid_until 标记事实为已过期
    - consolidate：合并重复项和清理
    
    返回实体/关系数据或查询结果。
    """
```

#### 写作工具（整合）

```python
def writing_tool(
    action: Literal["draft", "edit", "format", "export"],
    content: Optional[str] = None,
    chapter_id: Optional[str] = None,
    style_guide: Optional[str] = None,
    output_format: Literal["markdown", "html", "pdf"] = "markdown"
) -> Dict:
    """
    统一的书籍写作工具。
    
    何时使用：
    - 起草新的章节内容
    - 编辑现有内容以提高质量
    - 格式化输出内容
    - 导出最终书籍
    
    操作：
    - draft：创建初始章节草稿
    - edit：对现有内容应用修订
    - format：应用样式和格式
    - export：生成最终输出文件
    """
```

---

## 评估框架

### 多维度评分标准

基于评估技能，我们定义质量维度：

| 维度 | 权重 | 优秀 | 可接受 | 失败 |
|------|------|------|--------|------|
| 源准确性 | 30% | 所有引用已验证，适当的属性 | 小的属性错误 | 虚构引用 |
| 主题连贯性 | 25% | 清晰的叙述线程、逻辑流 | 一些断开的部分 | 无连贯的叙述 |
| 完整性 | 20% | 涵盖源中的所有主要主题 | 遗漏一些主题 | 重大空缺 |
| 见解质量 | 15% | 跨源的新颖综合 | 重述明显的观点 | 无综合 |
| 可读性 | 10% | 引人入胜的、结构良好的散文 | 充分但单调 | 无法阅读 |

### 自动化评估流程

```python
def evaluate_daily_book(book: Book, source_data: Dict) -> EvaluationResult:
    scores = {}
    
    # 源准确性：验证引用与原始推文
    scores["source_accuracy"] = verify_quotes(book.chapters, source_data)
    
    # 主题连贯性：LLM 评判叙述流
    scores["thematic_coherence"] = judge_coherence(book)
    
    # 完整性：检查主题覆盖
    scores["completeness"] = calculate_theme_coverage(book, source_data)
    
    # 见解质量：LLM 评判综合
    scores["insight_quality"] = judge_insights(book, source_data)
    
    # 可读性：自动化指标 + LLM 评判
    scores["readability"] = assess_readability(book)
    
    overall = weighted_average(scores, DIMENSION_WEIGHTS)
    
    return EvaluationResult(
        passed=overall >= 0.7,
        scores=scores,
        overall=overall,
        flagged_issues=identify_issues(scores)
    )
```

### 人工审查触发器

- 总体评分 < 0.7
- 源准确性 < 0.8
- 检测到任何虚构引用
- 添加新账户（第一本书需要审查）
- 检测到有争议的话题

---

## 数据流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              每日流程                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. 爬虫阶段                                                                   │
│    爬虫代理 → X API → 文件系统 (raw_data/{account}/{date}.json)             │
│    上下文：最小（仅工具调用）                                                │
│    输出：原始推文数据持久化到文件系统                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. 分析阶段                                                                   │
│    分析器代理 → 文件系统 → 记忆存储                                          │
│    上下文：一次一个账户                                                      │
│    输出：每个账户的结构化分析 + 知识图谱更新                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. 合成阶段                                                                   │
│    合成器代理 → 分析摘要 → 书籍大纲                                          │
│    上下文：所有账户的摘要（压缩）                                            │
│    输出：带有章节结构的书籍大纲                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. 写作阶段                                                                   │
│    写手代理 → 大纲 + 相关源 → 草稿章节                                       │
│    上下文：一次一章（渐进式披露）                                            │
│    输出：草稿 markdown 章节                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. 编辑阶段                                                                   │
│    编辑代理 → 草稿 + 源 → 最终章节                                           │
│    上下文：一次一章                                                          │
│    输出：带有修订备注的编辑章节                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. 评估阶段                                                                   │
│    评估流程 → 最终书籍 → 质量报告                                            │
│    输出：通过/失败，有评分、标记问题                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. 发布（如果通过）或人工审查（如果标记）                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 失败模式和缓解

### 失败：协调器上下文饱和
**症状**：协调器累积阶段输出，路由决策降解。
**缓解**：阶段输出存储在文件系统中，协调器仅接收摘要。实现检查点以持久化状态。

### 失败：X API 速率限制
**症状**：爬虫达到速率限制，数据不完整。
**缓解**：
- 使用指数退避实现断路器
- 为恢复的部分爬虫进行检查点
- 跨时间窗口安排爬虫

### 失败：引用幻觉
**症状**：写手生成源材料中不存在的引用。
**缓解**：
- 写作提示中严格的源属性
- 编辑代理验证所有引用与源
- 评估中的自动化引用验证

### 失败：主题漂移
**症状**：书籍主题与实际源内容分歧。
**缓解**：
- 合成器仅接收基础摘要
- 写手工具包含源验证步骤
- 评估检查主题-源对齐

### 失败：协调开销
**症状**：代理通信延迟超过内容价值。
**缓解**：
- 批量阶段输出
- 将文件系统用于代理间数据（大有效负载无上下文传递）
- 尽可能平行化（爬虫可以按账户平行运行）

---

## 配置

```yaml
# config.yaml
target_accounts:
  - handle: "@account1"
    priority: high
    themes_of_interest: ["AI", "startups"]
  - handle: "@account2"
    priority: medium
    themes_of_interest: ["regulation", "policy"]

schedule:
  scrape_time: "06:00"  # UTC
  publish_time: "08:00"
  timezone: "UTC"

book_settings:
  target_word_count: 5000
  min_chapters: 3
  max_chapters: 7
  style: "analytical"  # analytical | narrative | summary

quality_thresholds:
  min_overall_score: 0.7
  min_source_accuracy: 0.8
  require_human_review_below: 0.75

memory:
  retention_days: 90
  consolidation_frequency: "weekly"
  
context_limits:
  orchestrator: 50000
  scraper: 20000
  analyzer: 80000
  synthesizer: 100000
  writer: 80000
  editor: 60000
```

---

## 实现阶段

### 第 1 阶段：核心流程（第 1-2 周）
- 具有基本路由的协调器
- 具有 X API 集成的爬虫
- 文件系统存储
- 生成 markdown 输出的基本写手

### 第 2 阶段：分析层（第 3-4 周）
- 具有主题提取的分析器代理
- 具有跨账户模式的合成器
- 书籍大纲生成

### 第 3 阶段：记忆系统（第 5-6 周）
- 时间知识图谱实现
- 实体和关系存储
- 历史上下文的时间查询

### 第 4 阶段：质量层（第 7-8 周）
- 编辑代理
- 评估流程
- 人工审查界面

### 第 5 阶段：生产硬化（第 9-10 周）
- 检查点/恢复
- 断路器
- 监控和警报
- 整合作业

---

## 技术栈（推荐）

| 组件 | 技术 | 理由 |
|------|------|------|
| 代理框架 | LangGraph | 具有明确节点/边的基于图的状态机 |
| 知识图谱 | Neo4j 或 Memgraph | 原生时间查询、关系遍历 |
| 向量存储 | Weaviate 或 Pinecone | 混合搜索（语义 + 元数据过滤） |
| X API | 官方 API 或爬虫备用 | 官方 API 速率限制很严格 |
| 存储 | PostgreSQL + S3 | 结构化数据 + 内容的 blob 存储 |
| 编排 | Temporal.io | 具有检查点/恢复的持久工作流 |

---

## 开放问题

1. **X API 访问**：官方 API 还是爬虫？官方 API 的速率限制很严格。爬虫有法律/ToS 考虑。

2. **书籍格式**：纯散文还是混合媒体（包括原始推文嵌入）？

3. **属性模型**：账户属性应该有多突出？完整引用和句柄 vs 改述的见解？

4. **货币化**：如果出售书籍，综合公开推文的知识产权意义是什么？

5. **人在循环中**：多少编辑控制？每本书的完整审查 vs 基于异常的审查？

---

## 参考资源

- [代理上下文工程技能](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) - 上下文工程模式
- 多代理模式技能 - 监督者架构选择
- 记忆系统技能 - 时间知识图谱设计
- 上下文优化技能 - 观察掩蔽和压缩策略
- 工具设计技能 - 工具的整合原则
- 评估技能 - 多维度评分标准

