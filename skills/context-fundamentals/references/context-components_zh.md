# 上下文组成部分：技术参考

本文档为智能体系统中的每个上下文组成部分提供了详细的技术参考。

## 系统提示词工程 (System Prompt Engineering)

### 章节结构

使用具有清晰边界的独立章节来组织系统提示词。推荐结构如下：

```
<BACKGROUND_INFORMATION>
关于领域、用户偏好或项目特定细节的上下文
</BACKGROUND_INFORMATION>

<INSTRUCTIONS>
核心行为准则和任务指令
</INSTRUCTIONS>

<TOOL_GUIDANCE>
何时以及如何使用可用工具
</TOOL_GUIDANCE>

<OUTPUT_DESCRIPTION>
预期的输出格式和质量标准
</OUTPUT_DESCRIPTION>
```

这种结构允许智能体快速定位相关信息，并在高级实现中实现选择性的上下文加载。

### 高度校准 (Altitude Calibration)

指令的“高度”是指抽象程度。请考虑以下示例：

**过低（脆性）：**
```
如果用户询问价格，请查看 docs/pricing.md 中的价格表。
如果表格显示美元 (USD)，请使用 config/exchange_rates.json 中的汇率转换为欧元 (EUR)。
如果用户在欧盟境内，请按照 config/vat_rates.json 中的适用税率添加增值税 (VAT)。
格式化响应时应包含货币符号、两位小数以及关于增值税的备注。
```

**过高（模糊）：**
```
帮助用户解决价格问题。要乐于助人且准确无误。
```

**最佳（启发式驱动）：**
```
针对价格查询：
1. 从 docs/pricing.md 检索当前费率
2. 应用用户位置调整（参见 config/location_defaults.json）
3. 结合适当的货币和税务因素进行格式化

优先使用精确数字而非估算值。当费率不可用时，请明确说明而非进行预测。
```

最佳高度提供了清晰的步骤，同时在执行过程中允许一定的灵活性。

## 工具定义规范

### Schema 结构

每个工具应定义：

```python
{
    "name": "tool_function_name",
    "description": "清晰描述工具的作用以及何时使用它",
    "parameters": {
        "type": "object",
        "properties": {
            "param_name": {
                "type": "string",
                "description": "此参数控制什么",
                "default": "reasonable_default_value"
            }
        },
        "required": ["param_name"]
    },
    "returns": {
        "type": "object",
        "description": "工具返回什么及其结构"
    }
}
```

### 描述工程 (Description Engineering)

工具描述应回答：工具做什么、何时使用它以及它产生什么结果。包括使用背景、示例和边缘情况。

**弱描述：**
```
在数据库中搜索客户信息。
```

**强描述：**
```
通过 ID 或电子邮件检索客户信息。

使用场景：
- 用户询问特定客户的详细信息、历史记录或状态
- 用户提供客户标识符并需要相关信息

返回包含以下内容的客户对象：
- 基本信息（姓名、电子邮件、账户状态）
- 订单历史摘要
- 支持工单计数

如果未找到客户则返回 null。如果数据库无法访问则返回错误。
```

## 检索文档管理

### 标识符设计

设计能够传达含义并实现高效检索的标识符：

**糟糕的标识符：**
- `data/file1.json`
- `ref/ref.md`
- `2024/q3/report`

**强大的标识符：**
- `customer_pricing_rates.json`
- `engineering_onboarding_checklist.md`
- `2024_q3_revenue_report.pdf`

强大的标识符允许智能体即使在没有搜索工具的情况下也能定位相关文件。

### 文档分块策略

对于大文档，进行战略性分块以保留语义连贯性：

```python
# 语义分块伪代码
def chunk_document(content):
    """在自然语义边界处拆分文档。"""
    boundaries = find_section_headers(content) # 查找章节标题
    boundaries += find_paragraph_breaks(content) # 查找段落分隔
    boundaries += find_logical_breaks(content) # 查找逻辑中断
    
    chunks = []
    for i in range(len(boundaries) - 1):
        chunk = content[boundaries[i]:boundaries[i+1]]
        if len(chunk) > MIN_CHUNK_SIZE and len(chunk) < MAX_CHUNK_SIZE:
            chunks.append(chunk)
    
    return chunks
```

避免使用会在句子中途或概念中途拆分的任意字符限制。

## 消息历史管理

### 回合表示 (Turn Representation)

组织消息历史以保留关键信息：

```python
{
    "role": "user" | "assistant" | "tool",
    "content": "消息文本",
    "reasoning": "可选的思维链",
    "tool_calls": [如果角色是 assistant 则包含此列表],
    "tool_output": "如果角色是 tool 则包含输出",
    "summary": "如果对话很长则包含精简摘要"
}
```

### 摘要注入模式

对于长对话，每隔一段时间注入摘要：

```python
def inject_summaries(messages, summary_interval=20):
    """定期注入摘要以保留上下文。"""
    summarized = []
    for i, msg in enumerate(messages):
        summarized.append(msg)
        if i > 0 and i % summary_interval == 0:
            summary = generate_summary(summarized[-summary_interval:])
            summarized.append({
                "role": "system",
                "content": f"对话摘要：{summary}",
                "is_summary": True
            })
    return summarized
```

## 工具输出优化

### 响应格式

提供响应格式选项以控制令牌使用：

```python
def get_customer_response_format():
    return {
        "format": "concise | detailed", # 简洁 | 详细
        "fields": ["id", "name", "email", "status", "history_summary"]
    }
```

简洁格式仅返回必要字段；详细格式返回完整对象。

### 观察掩蔽 (Observation Masking)

对于冗长的工具输出，考虑使用掩蔽模式：

```python
def mask_observation(output, max_length=500):
    """用精简引用替换长观察结果。"""
    if len(output) <= max_length:
        return output
    
    reference_id = store_observation(output)
    return f"[之前的观察结果已省略。完整内容存储在引用 {reference_id} 中]"
```

这在减少令牌使用的同时保留了信息访问。

## 上下文预算估算

### 令牌计数近似值

出于规划目的，对于英文文本，估计每个令牌大约对应 4 个字符：

```
1000 个单词 ≈ 7500 个字符 ≈ 1800-2000 个令牌
```

这只是一个粗略的近似值；实际的分词结果因模型和内容类型而异。对于中文，通常一个汉字对应 1-2 个令牌（取决于具体模型）。

### 上下文预算分配

在各组成部分之间分配上下文预算：

| 组成部分 | 典型范围 | 备注 |
|-----------|---------------|-------|
| 系统提示词 | 500-2000 令牌 | 整个会话保持稳定 |
| 工具定义 | 每个工具 100-500 | 随工具数量增长 |
| 检索到的文档 | 可变 | 通常是最大的消耗者 |
| 消息历史 | 可变 | 随对话进行而增长 |
| 工具输出 | 可变 | 可能主导上下文 |

在开发期间监控实际使用情况，以建立基准分配。

## 渐进式披露实现

### 技能激活模式

```python
def activate_skill_context(skill_name, task_description):
    """当任务匹配技能描述时加载技能上下文。"""
    skill_metadata = load_all_skill_metadata() # 加载所有技能元数据
    
    relevant_skills = []
    for skill in skill_metadata:
        if skill_matches_task(skill, task_description):
            relevant_skills.append(skill)
    
    # 仅为最相关的技能加载全部内容
    for skill in relevant_skills[:MAX_CONCURRENT_SKILLS]:
        skill_context = load_skill_content(skill)
        inject_into_context(skill_context)
```

### 引用加载模式

```python
def get_reference(file_reference):
    """仅在显式需要时加载引用文件。"""
    if not file_reference.is_loaded:
        file_reference.content = read_file(file_reference.path)
        file_reference.is_loaded = True
    return file_reference.content
```

这种模式确保文件仅加载一次，并在会话期间进行缓存。

