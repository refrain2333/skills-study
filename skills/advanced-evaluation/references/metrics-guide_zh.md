# LLM评估的指标选择指南

本参考为不同的评估场景提供指标选择的指导。

## 指标类别

### 分类指标

用于二元或多类别评估任务（通过/失败，正确/不正确）。

#### 精确度

```
精确度 = 真正例 / (真正例 + 假正例)
```

**解释**：在所有判官说的好响应中，实际有好的占多少？

**何时使用**：假正例成本高（例如，批准不安全内容）

```python
def precision(predictions, ground_truth):
    true_positives = sum(1 for p, g in zip(predictions, ground_truth) if p == 1 and g == 1)
    predicted_positives = sum(predictions)
    return true_positives / predicted_positives if predicted_positives > 0 else 0
```

#### 召回率

```
召回率 = 真正例 / (真正例 + 假负例)
```

**解释**：在所有实际好的响应中，判官识别出多少？

**何时使用**：假负例成本高（例如，在过滤中遗漏好的内容）

```python
def recall(predictions, ground_truth):
    true_positives = sum(1 for p, g in zip(predictions, ground_truth) if p == 1 and g == 1)
    actual_positives = sum(ground_truth)
    return true_positives / actual_positives if actual_positives > 0 else 0
```

#### F1评分

```
F1 = 2 * (精确度 * 召回率) / (精确度 + 召回率)
```

**解释**：精确度和召回率的调和平均值

**何时使用**：你需要一个平衡两个关注的单一数字

```python
def f1_score(predictions, ground_truth):
    p = precision(predictions, ground_truth)
    r = recall(predictions, ground_truth)
    return 2 * p * r / (p + r) if (p + r) > 0 else 0
```

### 一致性指标

用于比较自动化评估与人工判断。

#### Cohen的Kappa（κ）

```
κ = (观察一致性 - 期望一致性) / (1 - 期望一致性)
```

**解释**：考虑了概率的一致性
- κ > 0.8：几乎完美的一致性
- κ 0.6-0.8：实质性一致性
- κ 0.4-0.6：中等一致性
- κ < 0.4：公平到差的一致性

**用于**：二元或分类判断

```python
def cohens_kappa(judge1, judge2):
    from sklearn.metrics import cohen_kappa_score
    return cohen_kappa_score(judge1, judge2)
```

#### 加权Kappa

对于序数量表，分歧严重程度很重要：

```python
def weighted_kappa(judge1, judge2):
    from sklearn.metrics import cohen_kappa_score
    return cohen_kappa_score(judge1, judge2, weights='quadratic')
```

**解释**：对大分歧惩罚比小分歧更多

### 相关性指标

用于序数/连续评分。

#### Spearman秩相关（ρ）

**解释**：排名之间的相关性，而不是绝对值
- ρ > 0.9：非常强的相关性
- ρ 0.7-0.9：强相关性
- ρ 0.5-0.7：中等相关性
- ρ < 0.5：弱相关性

**何时使用**：顺序比确切值更重要

```python
def spearmans_rho(scores1, scores2):
    from scipy.stats import spearmanr
    rho, p_value = spearmanr(scores1, scores2)
    return {'rho': rho, 'p_value': p_value}
```

#### Kendall的Tau（τ）

**解释**：类似于Spearman但基于成对一致性

**何时使用**：你有许多的并列值

```python
def kendalls_tau(scores1, scores2):
    from scipy.stats import kendalltau
    tau, p_value = kendalltau(scores1, scores2)
    return {'tau': tau, 'p_value': p_value}
```

#### Pearson相关（r）

**解释**：评分之间的线性相关性

**何时使用**：确切的评分值很重要，而不仅仅是顺序

```python
def pearsons_r(scores1, scores2):
    from scipy.stats import pearsonr
    r, p_value = pearsonr(scores1, scores2)
    return {'r': r, 'p_value': p_value}
```

### 成对比较指标

#### 一致性率

```
一致性 = (匹配决定) / (总比较)
```

**解释**：一致性的简单百分比

```python
def pairwise_agreement(decisions1, decisions2):
    matches = sum(1 for d1, d2 in zip(decisions1, decisions2) if d1 == d2)
    return matches / len(decisions1)
```

#### 位置一致性

```
一致性 = (位置交换中保持一致) / (总比较)
```

**解释**：交换位置改变决定的频率有多高？

```python
def position_consistency(results):
    consistent = sum(1 for r in results if r['position_consistent'])
    return consistent / len(results)
```

## 选择决策树

```
什么类型的评估任务？
│
├── 二元分类（通过/失败）
│   └── 使用：精确度、召回率、F1、Cohen's κ
│
├── 序数量表（1-5评分）
│   ├── 与人工判断比较？
│   │   └── 使用：Spearman's ρ、加权κ
│   └── 比较两个自动化判官？
│       └── 使用：Kendall's τ、Spearman's ρ
│
├── 成对偏好
│   └── 使用：一致性率、位置一致性
│
└── 多标签分类
    └── 使用：宏观F1、微观F1、每个标签的指标
```

## 按用例选择指标

### 用例1：验证自动化评估

**目标**：确保自动化评估与人工判断相关联

**推荐指标**：
1. 主要：Spearman's ρ（对于序数量表）或Cohen's κ（对于分类）
2. 次要：每个标准的一致性
3. 诊断：混淆矩阵以查找系统性错误

```python
def validate_automated_eval(automated_scores, human_scores, criteria):
    results = {}
    
    # 总体相关性
    results['overall_spearman'] = spearmans_rho(automated_scores, human_scores)
    
    # 每个标准的一致性
    for criterion in criteria:
        auto_crit = [s[criterion] for s in automated_scores]
        human_crit = [s[criterion] for s in human_scores]
        results[f'{criterion}_spearman'] = spearmans_rho(auto_crit, human_crit)
    
    return results
```

### 用例2：比较两个模型

**目标**：确定哪个模型产生更好的输出

**推荐指标**：
1. 主要：获胜率（来自成对比较）
2. 次要：位置一致性（偏差检查）
3. 诊断：每个标准的细分

```python
def compare_models(model_a_outputs, model_b_outputs, prompts):
    results = []
    for a, b, p in zip(model_a_outputs, model_b_outputs, prompts):
        comparison = await compare_with_position_swap(a, b, p)
        results.append(comparison)
    
    return {
        'a_wins': sum(1 for r in results if r['winner'] == 'A'),
        'b_wins': sum(1 for r in results if r['winner'] == 'B'),
        'ties': sum(1 for r in results if r['winner'] == 'TIE'),
        'position_consistency': position_consistency(results)
    }
```

### 用例3：质量监控

**目标**：随时间追踪评估质量

**推荐指标**：
1. 主要：与人工抽查的滚动一致性
2. 次要：评分分布稳定性
3. 诊断：偏差指标（位置、长度）

```python
class QualityMonitor:
    def __init__(self, window_size=100):
        self.window = deque(maxlen=window_size)
    
    def add_evaluation(self, automated, human_spot_check=None):
        self.window.append({
            'automated': automated,
            'human': human_spot_check,
            'length': len(automated['response'])
        })
    
    def get_metrics(self):
        # 筛选有人工抽查的评估
        with_human = [e for e in self.window if e['human'] is not None]
        
        if len(with_human) < 10:
            return {'insufficient_data': True}
        
        auto_scores = [e['automated']['score'] for e in with_human]
        human_scores = [e['human']['score'] for e in with_human]
        
        return {
            'correlation': spearmans_rho(auto_scores, human_scores),
            'mean_difference': np.mean([a - h for a, h in zip(auto_scores, human_scores)]),
            'length_correlation': spearmans_rho(
                [e['length'] for e in self.window],
                [e['automated']['score'] for e in self.window]
            )
        }
```

## 解释指标结果

### 好的评估系统指标

| 指标 | 好 | 可接受 | 令人担忧 |
|------|------|--------|--------|
| Spearman's ρ | > 0.8 | 0.6-0.8 | < 0.6 |
| Cohen's κ | > 0.7 | 0.5-0.7 | < 0.5 |
| 位置一致性 | > 0.9 | 0.8-0.9 | < 0.8 |
| 长度相关性 | < 0.2 | 0.2-0.4 | > 0.4 |

### 警告信号

1. **高一致性但低相关性**：可能表示校准问题
2. **低位置一致性**：位置偏差影响结果
3. **高长度相关性**：长度偏差膨胀评分
4. **每个标准方差**：一些标准可能定义不良

## 报告模板

```markdown
## 评估系统指标报告

### 人工一致性
- Spearman's ρ：0.82（p < 0.001）
- Cohen's κ：0.74
- 样本大小：500个评估

### 偏差指标
- 位置一致性：91%
- 长度-评分相关性：0.12

### 每个标准的性能
| 标准 | Spearman's ρ | κ |
|------|--------------|---|
| 准确性 | 0.88 | 0.79 |
| 清晰度 | 0.76 | 0.68 |
| 完整性 | 0.81 | 0.72 |

### 建议
- 所有指标在可接受范围内
- 监控"清晰度"标准 - 较低的一致性可能表示需要改进评分标准
```

