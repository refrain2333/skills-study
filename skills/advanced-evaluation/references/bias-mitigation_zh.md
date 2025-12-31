# LLM评估中的偏差缓解技术

本参考详细说明了在LLM作为判官系统中缓解已知偏差的具体技术。

## 位置偏差

### 问题

在成对比较中，LLM系统性地偏好某些位置的响应。研究显示：
- GPT有轻微的首位偏差（在平局中对首位的偏好约55%）
- Claude显示类似的模式
- 较小的模型通常显示更强的偏差

### 缓解：位置交换协议

```python
async def position_swap_comparison(response_a, response_b, prompt, criteria):
    # 第一次：原始顺序
    result_ab = await compare(response_a, response_b, prompt, criteria)
    
    # 第二次：交换顺序
    result_ba = await compare(response_b, response_a, prompt, criteria)
    
    # 映射第二个结果（A在第二位 → B在首位）
    result_ba_mapped = {
        'winner': {'A': 'B', 'B': 'A', 'TIE': 'TIE'}[result_ba['winner']],
        'confidence': result_ba['confidence']
    }
    
    # 一致性检查
    if result_ab['winner'] == result_ba_mapped['winner']:
        return {
            'winner': result_ab['winner'],
            'confidence': (result_ab['confidence'] + result_ba_mapped['confidence']) / 2,
            'position_consistent': True
        }
    else:
        # 分歧表明位置偏差是一个因素
        return {
            'winner': 'TIE',
            'confidence': 0.5,
            'position_consistent': False,
            'bias_detected': True
        }
```

### 替代方案：多次随机排列

为获得更高的可靠性，使用多个位置顺序：

```python
async def multi_shuffle_comparison(response_a, response_b, prompt, criteria, n_shuffles=3):
    results = []
    for i in range(n_shuffles):
        if i % 2 == 0:
            r = await compare(response_a, response_b, prompt, criteria)
        else:
            r = await compare(response_b, response_a, prompt, criteria)
            r['winner'] = {'A': 'B', 'B': 'A', 'TIE': 'TIE'}[r['winner']]
        results.append(r)
    
    # 多数投票
    winners = [r['winner'] for r in results]
    final_winner = max(set(winners), key=winners.count)
    agreement = winners.count(final_winner) / len(winners)
    
    return {
        'winner': final_winner,
        'confidence': agreement,
        'n_shuffles': n_shuffles
    }
```

## 长度偏差

### 问题

LLM倾向于对更长的响应评分更高，无论质量如何。这表现为：
- 冗长的响应获得膨胀的评分
- 简洁但完整的响应被惩罚
- 填充和重复被奖励

### 缓解：明确提示

在提示中包含反长度偏差的说明：

```
关键评估指南：
- 不要因为响应更长就偏好它
- 简洁、完整的答案与详细的答案一样有价值
- 惩罚不必要的冗长或重复
- 关注信息密度，而不是字数
```

### 缓解：长度归一化评分

```python
def length_normalized_score(score, response_length, target_length=500):
    """根据响应长度调整评分。"""
    length_ratio = response_length / target_length
    
    if length_ratio > 2.0:
        # 惩罚过长的响应
        penalty = (length_ratio - 2.0) * 0.1
        return max(score - penalty, 1)
    elif length_ratio < 0.3:
        # 惩罚过短的响应
        penalty = (0.3 - length_ratio) * 0.5
        return max(score - penalty, 1)
    else:
        return score
```

### 缓解：单独的长度标准

将长度作为一个单独的、明确的标准，这样它就不会被隐含地奖励：

```python
criteria = [
    {"name": "准确性", "description": "事实正确性", "weight": 0.4},
    {"name": "完整性", "description": "涵盖关键点", "weight": 0.3},
    {"name": "简洁性", "description": "没有不必要的内容", "weight": 0.3}  # 明确
]
```

## 自我提升偏差

### 问题

模型对自己生成的输出（或相似模型生成的输出）的评分高于不同模型生成的输出。

### 缓解：跨模型评估

使用不同的模型族进行评估而不是生成：

```python
def get_evaluator_model(generator_model):
    """选择评估器以避免自我提升偏差。"""
    if 'gpt' in generator_model.lower():
        return 'claude-4-5-sonnet'
    elif 'claude' in generator_model.lower():
        return 'gpt-5.2'
    else:
        return 'gpt-5.2'  # 默认
```

### 缓解：盲评估

在评估前删除模型归属：

```python
def anonymize_response(response, model_name):
    """删除模型识别模式。"""
    patterns = [
        f"作为{model_name}",
        "我是一个AI",
        "我没有个人观点",
        # 模型特定的模式
    ]
    anonymized = response
    for pattern in patterns:
        anonymized = anonymized.replace(pattern, "[已删除]")
    return anonymized
```

## 冗长偏差

### 问题

详细的解释获得更高的评分，即使额外的细节无关或不正确。

### 缓解：相关性加权评分

```python
async def relevance_weighted_evaluation(response, prompt, criteria):
    # 首先，评估每个段落的相关性
    relevance_scores = await assess_relevance(response, prompt)
    
    # 按相关性加权评估
    segments = split_into_segments(response)
    weighted_scores = []
    for segment, relevance in zip(segments, relevance_scores):
        if relevance > 0.5:  # 仅计算相关段落
            score = await evaluate_segment(segment, prompt, criteria)
            weighted_scores.append(score * relevance)
    
    return sum(weighted_scores) / len(weighted_scores)
```

### 缓解：带冗长惩罚的评分标准

在评分标准中包含明确的冗长惩罚：

```python
rubric_levels = [
    {
        "score": 5,
        "description": "完整且简洁。所有必要信息，没有无关内容。",
        "characteristics": ["每句话都增加价值", "没有重复", "范围恰当"]
    },
    {
        "score": 3,
        "description": "完整但冗长。包含不必要的细节或重复。",
        "characteristics": ["要点已涵盖", "一些题外话", "可以更简洁"]
    },
    # ... 等等
]
```

## 权威偏差

### 问题

自信、权威的语气被评分更高，无论准确性如何。

### 缓解：证据要求

要求对声明的明确证据：

```
对于响应中的每个声明：
1. 识别它是否是事实性声明
2. 注意是否提供了证据或来源
3. 根据可验证性评分，而不是置信度

重要：没有证据的自信声明不应获得比有证据的审慎声明更高的评分。
```

### 缓解：事实检查层

在评分前添加事实检查步骤：

```python
async def fact_checked_evaluation(response, prompt, criteria):
    # 提取声明
    claims = await extract_claims(response)
    
    # 事实检查每个声明
    fact_check_results = await asyncio.gather(*[
        verify_claim(claim) for claim in claims
    ])
    
    # 根据事实检查结果调整评分
    accuracy_factor = sum(r['verified'] for r in fact_check_results) / len(fact_check_results)
    
    base_score = await evaluate(response, prompt, criteria)
    return base_score * (0.7 + 0.3 * accuracy_factor)  # 至少70%的评分
```

## 汇总偏差检测

在生产环境中监控系统性偏差：

```python
class BiasMonitor:
    def __init__(self):
        self.evaluations = []
    
    def record(self, evaluation):
        self.evaluations.append(evaluation)
    
    def detect_position_bias(self):
        """检测首位是否比预期赢得更多。"""
        first_wins = sum(1 for e in self.evaluations if e['first_position_winner'])
        expected = len(self.evaluations) * 0.5
        z_score = (first_wins - expected) / (expected * 0.5) ** 0.5
        return {'bias_detected': abs(z_score) > 2, 'z_score': z_score}
    
    def detect_length_bias(self):
        """检测较长响应是否评分更高。"""
        from scipy.stats import spearmanr
        lengths = [e['response_length'] for e in self.evaluations]
        scores = [e['score'] for e in self.evaluations]
        corr, p_value = spearmanr(lengths, scores)
        return {'bias_detected': corr > 0.3 and p_value < 0.05, 'correlation': corr}
```

## 总结表

| 偏差 | 主要缓解 | 次要缓解 | 检测方法 |
|------|---------|---------|--------|
| 位置 | 位置交换 | 多次随机排列 | 一致性检查 |
| 长度 | 明确提示 | 长度归一化 | 长度-评分相关性 |
| 自我提升 | 跨模型评估 | 匿名化 | 模型比较研究 |
| 冗长 | 相关性加权 | 评分标准惩罚 | 相关性评分 |
| 权威 | 证据要求 | 事实检查层 | 置信度-准确性相关性 |

