# Tinker 格式规范

本参考文档记录了 Tinker 有监督微调所需的确切数据结构。

## 核心数据类型

### Datum

Tinker 中的基本训练单元：

```python
from tinker import types

datum = types.Datum(
    model_input=types.ModelInput.from_ints(tokens=input_tokens),
    loss_fn_inputs={
        "target_tokens": target_tokens,  # List[int] - 为下一个令牌预测移位 1
        "weights": weights               # List[float] - 提示为 0.0，完成为 1.0
    }
)
```

### ModelInput

令牌化输入的容器：

```python
# 仅文本输入
model_input = types.ModelInput.from_ints(tokens=[...])

# 多模态（用于 VLM）
model_input = types.ModelInput(chunks=[
    types.EncodedTextChunk(tokens=[...]),
    types.ImageChunk(data=image_bytes, format="png"),
    types.EncodedTextChunk(tokens=[...])
])
```

### 令牌权重分配

权重数组确定哪些令牌有助于损失：

| 令牌类型 | 权重 | 描述 |
|------------|--------|-------------|
| 系统提示 | 0.0 | 上下文，不学习 |
| 用户消息 | 0.0 | 输入提示 |
| 助手消息 | 1.0 | 目标完成 |
| 特殊令牌 | 0.0 | EOS、BOS、分隔符 |

## 渲染系统

Tinker 使用渲染器将消息列表转换为带有适当权重的令牌。

### 使用内置渲染器

```python
from tinker_cookbook import renderers, tokenizer_utils

# 获取模型的令牌化器
tokenizer = tokenizer_utils.get_tokenizer("meta-llama/Llama-3.1-8B-Instruct")

# 获取适当的渲染器
renderer = renderers.get_renderer("llama3", tokenizer)

# 将消息转换为训练格式
messages = [
    {"role": "system", "content": "你是一位创意作家..."},
    {"role": "user", "content": "写一个 500 字摘录..."},
    {"role": "assistant", "content": "实际的书籍文本..."}
]

model_input, weights = renderer.build_supervised_example(messages)
```

### 渲染器输出可视化

渲染器按令牌分配权重：

```
令牌          权重
<|im_start|>   0.0
system         0.0
\n             0.0
你是...         0.0
<|im_end|>     0.0
...            ...
<|im_start|>   0.0
assistant      0.0
\n             0.0
实际的          1.0    <- 完成开始
书籍文本       1.0
...            1.0
<|im_end|>     1.0    <- 最后令牌加权
```

## JSONL 格式

对于批处理，使用标准对话 JSONL：

```json
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

### 将 JSONL 转换为 Datum

```python
import json
from tinker import types
from tinker_cookbook import renderers, tokenizer_utils

def load_dataset(jsonl_path: str, model_name: str) -> list[types.Datum]:
    """加载 JSONL 并转换为 Tinker Datum 对象。"""
    
    tokenizer = tokenizer_utils.get_tokenizer(model_name)
    renderer = renderers.get_renderer("llama3", tokenizer)
    
    data = []
    with open(jsonl_path) as f:
        for line in f:
            example = json.loads(line)
            messages = example["messages"]
            
            model_input, weights = renderer.build_supervised_example(messages)
            
            # 获取令牌序列
            input_tokens = model_input.to_ints()
            target_tokens = input_tokens[1:]  # 为下一个令牌预测移位
            input_tokens = input_tokens[:-1]
            weights = weights[1:]  # 与目标对齐权重
            
            datum = types.Datum(
                model_input=types.ModelInput.from_ints(tokens=input_tokens),
                loss_fn_inputs={
                    "target_tokens": target_tokens,
                    "weights": weights
                }
            )
            data.append(datum)
    
    return data
```

## 训练循环集成

```python
import tinker
from tinker import types

async def train_on_book_dataset(
    dataset: list[types.Datum],
    model_name: str,
    learning_rate: float = 1e-4,
    epochs: int = 1
):
    """在书籍 SFT 数据集上训练。"""
    
    service_client = tinker.ServiceClient()
    training_client = await service_client.create_lora_training_client_async(
        base_model=model_name,
        rank=32
    )
    
    for epoch in range(epochs):
        for batch_start in range(0, len(dataset), 1):  # 批大小 1
            batch = dataset[batch_start:batch_start + 1]
            
            # 使用交叉熵损失的前向-后向
            fwd_bwd_future = await training_client.forward_backward_async(
                batch, 
                loss_fn="cross_entropy"
            )
            
            # 使用激进学习率的优化器步骤
            optim_future = await training_client.optim_step_async(
                types.AdamParams(learning_rate=learning_rate * 2.0)
            )
            
            # 等待完成
            fwd_bwd_result = await fwd_bwd_future
            optim_result = await optim_future
```

## 关键约束

1. **批大小**：对于风格迁移使用 1。更大的批次会平均化风格梯度。

2. **序列长度**：保持块少于 1000 令牌。更长的序列稀释本地风格模式。

3. **学习率**：使用 2 倍乘数（例如，2e-4 而不是 1e-4）以加快风格收敛。

4. **令牌对齐**：目标令牌必须从输入令牌移位 1 个位置。

5. **权重精度**：权重应为 float32，通常为 0.0 或 1.0。

## 模型选择

对于书籍 SFT，考虑：

| 模型 | 用例 |
|-------|----------|
| meta-llama/Llama-3.1-8B-Instruct | 通用风格迁移 |
| Qwen/Qwen3-30B-A3B | 更高质量，MoE 效率 |
| GPT-4o（通过 OpenAI） | 数据生成，不是 Tinker |

## 参考资源

- Tinker Cookbook：`tinker_cookbook/supervised/train.py`
- 渲染器实现：`tinker_cookbook/renderers.py`
- 类型定义：`tinker/types.py`

