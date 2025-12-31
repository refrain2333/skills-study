# 上下文优化参考

本文档为上下文优化技术和策略提供了详细的技术参考。

## 压缩策略 (Compaction Strategies)

### 基于摘要的压缩 (Summary-Based Compaction)

基于摘要的压缩用简洁的摘要替换冗长的内容，同时保留关键信息。该方法的工作原理是：识别可以压缩的部分，生成捕获要点的摘要，并用摘要替换全部内容。

压缩的有效性取决于保留了哪些信息。**关键决策、用户偏好和当前任务状态绝不应被压缩**。中间结果和支持证据可以更激进地被总结。样板内容、重复信息和探索性推理通常可以完全移除。

### 令牌预算分配 (Token Budget Allocation)

有效的上下文预算需要理解不同上下文组成部分如何消耗令牌，并进行战略性分配：

| 组成部分 | 典型范围 | 备注 |
|-----------|---------------|-------|
| 系统提示词 | 500-2000 令牌 | 整个会话保持稳定 |
| 工具定义 | 每个工具 100-500 | 随工具数量增长 |
| 检索到的文档 | 可变 | 通常是最大的消耗者 |
| 消息历史 | 可变 | 随对话进行而增长 |
| 工具输出 | 可变 | 可能主导上下文 |

### 压缩阈值 (Compaction Thresholds)

在适当的阈值处触发压缩以维持性能：

- **警告阈值**：有效上下文限制的 70%
- **压缩触发器**：有效上下文限制的 80%
- **激进压缩**：有效上下文限制的 90%

确切的阈值取决于模型行为和任务特征。某些模型表现出优雅降级，而其他模型则表现出剧烈的性能崩塌。

## 观察掩蔽模式 (Observation Masking Patterns)

### 选择性掩蔽 (Selective Masking)

并非所有观察结果都应被同等掩蔽。考虑掩蔽那些已经发挥作用且在活动推理中不再需要的观察结果。保留对于当前任务核心的观察。保留最近一个回合的观察。保留那些可能被再次引用的观察。

### 掩蔽实现

```python
def selective_mask(observations: List[Dict], current_task: Dict) -> List[Dict]:
    """
    根据相关性选择性地掩蔽观察结果。
    
    返回带有 mask 字段（指示内容是否被掩蔽）的观察结果列表。
    """
    masked = []
    
    for obs in observations:
        relevance = calculate_relevance(obs, current_task)
        
        if relevance < 0.3 and obs["age"] > 3:
            # 低相关性且较旧 - 掩蔽
            masked.append({
                **obs,
                "masked": True,
                "reference": store_for_reference(obs["content"]), # 存储引用
                "summary": summarize_content(obs["content"])       # 提供摘要
            })
        else:
            masked.append({
                **obs,
                "masked": False
            })
    
    return masked
```

## KV 缓存优化 (KV-Cache Optimization)

### 前缀稳定性 (Prefix Stability)

KV 缓存命中率取决于前缀的稳定性。稳定的前缀允许跨请求重用缓存。动态前缀会导致缓存失效并强制重新计算。

应保持稳定的元素包括：系统提示词、工具定义和频繁使用的模板。可能变化的元素包括：时间戳、会话标识符和特定于查询的内容。

### 缓存友好型设计

设计提示词以最大化缓存命中率：

1. 将稳定内容放在开头
2. 跨请求使用一致的格式
3. 尽可能避免在提示词中使用动态内容
4. 为动态内容使用占位符（或者将其作为变量在后续部分传入）

```python
# 缓存不友好：提示词中有动态时间戳
system_prompt = f"""
当前时间：{datetime.now().isoformat()}
你是一个得力的助手。
"""

# 缓存友好：稳定的提示词，动态时间在相关时单独提供
system_prompt = """
你是一个得力的助手。
当前时间在相关时会单独提供。
"""
```

## 上下文分区策略 (Context Partitioning Strategies)

### 子智能体隔离

将工作划分给多个子智能体，以防止任何单一上下文增长得过大。每个子智能体在一个专注于其子任务的干净上下文中运行。

### 分区规划

```python
def plan_partitioning(task: Dict, context_limit: int) -> Dict:
    """
    根据上下文限制规划如何划分任务。
    
    返回分区策略和子任务定义。
    """
    estimated_context = estimate_task_context(task)
    
    if estimated_context <= context_limit:
        return {
            "strategy": "single_agent", # 单智能体
            "subtasks": [task]
        }
    
    # 规划多智能体方法
    subtasks = decompose_task(task)
    
    return {
        "strategy": "multi_agent", # 多智能体
        "subtasks": subtasks,
        "coordination": "hierarchical" # 层级协调
    }
```

## 优化决策框架

### 何时优化

当上下文利用率超过 70%、随着对话延长响应质量下降、由于长上下文导致成本增加，或者延迟随对话长度增加而增加时，请考虑进行上下文优化。

### 应用何种优化

根据上下文组成选择优化策略：

- 如果 **工具输出** 主导上下文，应用 **观察掩蔽**。
- 如果 **检索到的文档** 主导上下文，应用 **摘要或分区**。
- 如果 **消息历史** 主导上下文，应用 **带摘要的压缩**。
- 如果有 **多个组成部分** 造成压力，**结合多种策略**。

### 优化评估

应用优化后，评估其有效性：

- 测量实现的令牌减少量
- 测量质量保留情况（输出质量不应下降）
- 测量延迟改善情况
- 测量成本降低量

根据评估结果对优化策略进行迭代。

## 常见陷阱

### 过度压缩 (Over-Aggressive Compaction)

压缩过于激进可能会移除关键信息。始终保留任务目标、用户偏好和最近的对话上下文。在不断增加的压缩强度下进行测试，以找到最佳平衡点。

### 掩蔽关键观察结果

掩蔽仍被需要的观察结果可能会导致错误。追踪观察结果的使用情况，仅掩蔽那些不再被引用的内容。考虑保留被掩蔽内容的引用，以便在需要时重新检索。

### 忽略注意力分布

“迷失在中间”现象意味着信息放置的位置至关重要。将关键信息放在注意力青睐的位置（上下文的开头和结尾）。使用显式标记突出重要内容。

### 过度优化 (Premature Optimization)

并非所有上下文都需要优化。添加优化机制会带来额外开销。仅当上下文限制真正约束了智能体性能时才进行优化。

## 监控与警报

### 关键指标

追踪这些指标以了解优化需求：

- 随时间变化的上下文令牌计数
- 重复模式的缓存命中率
- 按上下文大小分类的响应质量指标
- 按上下文长度分类的单次对话成本
- 随上下文大小变化的延迟

### 警报阈值

为以下情况设置警报：

- 上下文利用率高于 80%
- 缓存命中率低于 50%
- 质量得分下降超过 10%
- 成本增加超过基线

## 集成模式

### 与智能体框架集成

将优化集成到智能体工作流中：

```python
class OptimizingAgent:
    def __init__(self, context_limit: int = 80000):
        self.context_limit = context_limit
        self.optimizer = ContextOptimizer()
    
    def process(self, user_input: str, context: Dict) -> Dict:
        # 检查是否需要优化
        if self.optimizer.should_compact(context):
            context = self.optimizer.compact(context)
        
        # 使用优化后的上下文进行处理
        response = self._call_model(user_input, context)
        
        # 追踪指标
        self.optimizer.record_metrics(context, response)
        
        return response
```

### 与内存系统集成

将优化与内存系统连接起来：

```python
class MemoryAwareOptimizer:
    def __init__(self, memory_system, context_limit: int):
        self.memory = memory_system
        self.limit = context_limit
    
    def optimize_context(self, current_context: Dict, task: str) -> Dict:
        # 检查信息是否在内存中
        relevant_memories = self.memory.retrieve(task)
        
        # 如果上下文中不需要该信息，将其移动到内存
        for mem in relevant_memories:
            if mem["importance"] < threshold:
                current_context = remove_from_context(current_context, mem)
                # 保留该内容可从内存中检索的引用
        
        return current_context
```

## 性能基准

### 压缩性能

压缩应在保留质量的同时减少令牌计数。目标：

- 激进压缩时实现 50-70% 的令牌减少
- 压缩带来的质量退化小于 5%
- 压缩开销带来的延迟增加小于 10%

### 掩蔽性能

观察掩蔽应显著减少令牌计数：

- 在被掩蔽的观察中实现 60-80% 的减少
- 掩蔽带来的质量影响小于 2%
- 延迟开销几乎为零

### 缓存性能

KV 缓存优化应改善成本和延迟：

- 稳定负载下实现 70% 以上的缓存命中率
- 缓存命中带来 50% 以上的成本降低
- 缓存命中带来 40% 以上的延迟减少

