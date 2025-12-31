# LLM作为判官的实现模式

本参考提供了构建生产级LLM评估系统的详细实现模式。

## 模式1：结构化评估流程

最可靠的评估系统遵循分离关注点的结构化流程：

```
输入验证 → 标准加载 → 评分 → 偏差缓解 → 输出格式化
```

### 输入验证层

在评估开始前，验证：

1. **响应存在**：要评估的非空响应
2. **提示存在**：用于上下文的原始提示
3. **标准有效性**：至少一个具有名称和描述的标准
4. **权重归一化**：权重总和为1.0（或归一化它们）

```python
def validate_input(response, prompt, criteria):
    if not response or not response.strip():
        raise ValueError("响应不能为空")
    if not prompt or not prompt.strip():
        raise ValueError("提示不能为空")
    if not criteria or len(criteria) == 0:
        raise ValueError("至少需要一个标准")
    
    # 归一化权重
    total_weight = sum(c.get('weight', 1) for c in criteria)
    for c in criteria:
        c['weight'] = c.get('weight', 1) / total_weight
```

### 标准加载层

标准应该从配置加载，而不是硬编码：

```python
class CriteriaLoader:
    def __init__(self, rubric_path=None):
        self.rubrics = self._load_rubrics(rubric_path)
    
    def get_criteria(self, task_type):
        return self.rubrics.get(task_type, self.default_criteria)
    
    def get_rubric(self, criterion_name):
        return self.rubrics.get(criterion_name, {}).get('levels', [])
```

### 评分层

评分层处理实际的LLM调用：

```python
async def score_response(response, prompt, criteria, rubric, model):
    system_prompt = build_system_prompt(criteria, rubric)
    user_prompt = build_user_prompt(response, prompt, criteria)
    
    result = await generate_text(
        model=model,
        system=system_prompt,
        prompt=user_prompt,
        temperature=0.3  # 降低温度以提高一致性
    )
    
    return parse_scores(result.text)
```

### 偏差缓解层

对于成对比较，始终包含位置交换：

```python
async def compare_with_bias_mitigation(response_a, response_b, prompt, criteria, model):
    # 第一次：A优先
    pass1 = await compare_pair(response_a, response_b, prompt, criteria, model)
    
    # 第二次：B优先
    pass2 = await compare_pair(response_b, response_a, prompt, criteria, model)
    
    # 将pass2赢家映射回来
    pass2_mapped = map_winner(pass2.winner)  # A→B, B→A, TIE→TIE
    
    # 检查一致性
    if pass1.winner == pass2_mapped:
        return {
            'winner': pass1.winner,
            'confidence': (pass1.confidence + pass2.confidence) / 2,
            'consistent': True
        }
    else:
        return {
            'winner': 'TIE',
            'confidence': 0.5,
            'consistent': False
        }
```

## 模式2：分层评估

对于复杂的评估，使用分层方法：

```
快速筛选（便宜模型） → 详细评估（昂贵模型） → 人工审查（边界情况）
```

### 快速筛选实现

```python
async def quick_screen(response, prompt, threshold=0.7):
    """快速、便宜的明显通过/失败筛选。"""
    result = await generate_text(
        model='gpt-5.2',  # 较便宜的模型
        prompt=f"对0-1评分如果此响应充分解决了提示：\n\n提示：{prompt}\n\n响应：{response}",
        temperature=0
    )
    score = float(result.text.strip())
    return score, score > threshold
```

### 详细评估

```python
async def detailed_evaluation(response, prompt, criteria):
    """对边界或重要情况进行完整评估。"""
    result = await generate_text(
        model='gpt-5.2',  # 更强大的模型
        system=DETAILED_EVALUATION_PROMPT,
        prompt=build_detailed_prompt(response, prompt, criteria),
        temperature=0.3
    )
    return parse_detailed_scores(result.text)
```

## 模式3：LLM判官小组（PoLL）

对于高风险评估，使用多个模型：

```python
async def poll_evaluation(response, prompt, criteria, models):
    """聚合多个LLM判官的判断。"""
    results = await asyncio.gather(*[
        score_with_model(response, prompt, criteria, model)
        for model in models
    ])
    
    # 聚合评分
    aggregated = aggregate_scores(results)
    
    # 计算一致性
    agreement = calculate_agreement(results)
    
    return {
        'scores': aggregated,
        'agreement': agreement,
        'individual_results': results
    }

def aggregate_scores(results):
    """使用中位数聚合评分（对离群值稳健）。"""
    scores = {}
    for criterion in results[0]['scores'].keys():
        criterion_scores = [r['scores'][criterion] for r in results]
        scores[criterion] = {
            'score': statistics.median(criterion_scores),
            'std': statistics.stdev(criterion_scores) if len(criterion_scores) > 1 else 0
        }
    return scores
```

## 模式4：置信度校准

置信度评分应该校准到实际可靠性：

```python
def calibrate_confidence(raw_confidence, position_consistent, evidence_count):
    """基于多个信号校准置信度。"""
    
    # 来自模型输出的基础置信度
    calibrated = raw_confidence
    
    # 位置一致性是强信号
    if not position_consistent:
        calibrated *= 0.6  # 显著降低
    
    # 更多证据 = 更高置信度
    evidence_factor = min(evidence_count / 3, 1.0)  # 限制在3件
    calibrated *= (0.7 + 0.3 * evidence_factor)
    
    return min(calibrated, 0.99)  # 永不100%确定
```

## 模式5：输出格式化

始终返回具有一致模式的结构化输出：

```python
@dataclass
class ScoreResult:
    criterion: str
    score: float
    max_score: float
    justification: str
    evidence: List[str]
    improvement: str

@dataclass
class EvaluationResult:
    success: bool
    scores: List[ScoreResult]
    overall_score: float
    weighted_score: float
    summary: Dict[str, Any]
    metadata: Dict[str, Any]

def format_output(scores, metadata) -> EvaluationResult:
    """一致地格式化评估结果。"""
    return EvaluationResult(
        success=True,
        scores=scores,
        overall_score=sum(s.score for s in scores) / len(scores),
        weighted_score=calculate_weighted_score(scores),
        summary=generate_summary(scores),
        metadata=metadata
    )
```

## 错误处理模式

### 优雅降级

```python
async def evaluate_with_fallback(response, prompt, criteria):
    try:
        return await full_evaluation(response, prompt, criteria)
    except RateLimitError:
        # 降级到更简单的评估
        return await simple_evaluation(response, prompt, criteria)
    except ParseError as e:
        # 返回部分结果加错误标志
        return {
            'success': False,
            'partial_results': e.partial_data,
            'error': str(e)
        }
```

### 重试逻辑

```python
async def evaluate_with_retry(response, prompt, criteria, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = await evaluate(response, prompt, criteria)
            if is_valid_result(result):
                return result
        except TransientError:
            await asyncio.sleep(2 ** attempt)  # 指数退避
    
    raise EvaluationError("最大重试次数超出")
```

## 测试模式

### 单元测试解析

```python
def test_score_parsing():
    raw_output = '{"scores": [{"criterion": "准确性", "score": 4}]}'
    result = parse_scores(raw_output)
    assert result.scores[0].criterion == "准确性"
    assert result.scores[0].score == 4

def test_malformed_output():
    raw_output = '无效的JSON'
    with pytest.raises(ParseError):
        parse_scores(raw_output)
```

### 与真实API的集成测试

```python
@pytest.mark.integration
async def test_full_evaluation_pipeline():
    result = await evaluate(
        response="在海平面，水在100°C沸腾。",
        prompt="水在什么温度下沸腾？",
        criteria=[{"name": "准确性", "description": "事实正确性", "weight": 1}]
    )
    
    assert result.success
    assert len(result.scores) == 1
    assert result.scores[0].score >= 4  # 应该对准确响应评分很高
```

### 偏差检测测试

```python
async def test_position_bias_mitigation():
    # 相同的响应在两个位置都应该平局
    result = await compare(
        response_a="相同的响应",
        response_b="相同的响应",
        prompt="测试提示",
        criteria=["质量"],
        swap_positions=True
    )
    
    assert result.winner == "TIE"
    assert result.consistent == True
```

