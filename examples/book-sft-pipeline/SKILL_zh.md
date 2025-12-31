---
name: book-sft-pipeline
description: 从书籍创建有监督微调数据集和训练风格迁移模型的端到端系统。涵盖文本提取、智能分段、合成指令生成、Tinker 兼容输出、LoRA 训练和验证。
version: 2.0.0
---

# 书籍 SFT 管道

一个完整的系统，用于将书籍转换为 SFT 数据集并训练风格迁移模型。本技能教导从原始 ePub 到以任何作者声音写作的模型的完整管道。

## 何时激活

激活本技能当：
- 从文学作品构建微调数据集
- 创建作者声音或风格迁移模型
- 为 Tinker 或类似 SFT 平台准备训练数据
- 为长文本内容设计文本分段管道
- 在有限数据上训练小模型（8B 或更小）

## 核心概念

### 书籍 SFT 的三大支柱

**1. 智能分段**
文本块必须在语义上连贯。在句子中间断开会教导模型产生碎片化输出。目标：每个块 150-400 字，始终在自然边界处。

**2. 多样化指令生成**
使用多个提示模板和系统提示来防止过度拟合。单一提示风格会导致记忆化。使用 15+ 个提示模板和 5+ 个系统提示。

**3. 风格优于内容**
目标是学习作者的节奏和词汇模式，而不是记忆情节。合成指令描述发生了什么，而不引用文本。

## 管道架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    协调器代理                                   │
│  协调管道阶段、管理状态、处理失败                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬───────────────┐
       ▼               ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   提取       │ │   分段       │ │   指令       │ │   数据集     │
│    代理      │ │    代理      │ │    代理      │ │    构建器     │
│ ePub → 文本  │ │ 文本 → 块    │ │ 块 →         │ │ 对 →         │
│              │ │ 150-400 字   │ │ 提示         │ │ JSONL        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐               ┌──────────────┐
│   训练       │               │   验证       │
│    代理      │               │    代理      │
│ Tinker 上    │               │ AI 检测器    │
│ 的 LoRA      │               │ 原创性       │
└──────────────┘               └──────────────┘
```

## 阶段 1：文本提取

### 关键规则
1. **始终选择 ePub 而非 PDF** - OCR 错误会成为学习的模式
2. **使用段落级提取** - 从 `<p>` 标签提取以保留换行
3. **删除前后物料** - 版权和目录会污染数据集

```python
# 从 ePub 段落提取文本
from epub2 import EPub
from bs4 import BeautifulSoup

def extract_epub(path):
    book = EPub(path)
    chapters = []
    for item in book.flow:
        html = book.get_chapter(item.id)
        soup = BeautifulSoup(html, 'html.parser')
        paragraphs = [p.get_text().strip() for p in soup.find_all('p')]
        chapters.append('\n\n'.join(p for p in paragraphs if p))
    return '\n\n'.join(chapters)
```

## 阶段 2：智能分段

### 更小的块 + 重叠

更小的块（150-400 字）比更大的块（250-650 字）产生更多训练例子和更好的风格迁移。

```python
def segment(text, min_words=150, max_words=400):
    paragraphs = text.split('\n\n')
    chunks, buffer, buffer_words = [], [], 0
    
    for para in paragraphs:
        words = len(para.split())
        if buffer_words + words > max_words and buffer_words >= min_words:
            chunks.append('\n\n'.join(buffer))
            # 保留最后一个段落以保持重叠
            buffer = [buffer[-1], para] if buffer else [para]
            buffer_words = sum(len(p.split()) for p in buffer)
        else:
            buffer.append(para)
            buffer_words += words
    
    if buffer:
        chunks.append('\n\n'.join(buffer))
    return chunks
```

### 预期结果

对于 86,000 字的书籍：
- 旧方法（250-650 字）：约 150 个块
- 新方法（150-400 + 重叠）：约 300 个块
- 每个块 2 个变体：600+ 个训练示例

## 阶段 3：多样化指令生成

### 关键见解

使用单一提示模板会导致记忆化。多样化的模板教导基础风格。

```python
SYSTEM_PROMPTS = [
    "你是一位能够模仿特定文学风格的专家创意作家。",
    "你是一位深谙经典散文风格的文学作家。",
    "你是一位善于模仿独特作者声音的创意作家。",
    "你写的散文捕捉现代主义文学的精髓。",
    "你是一位能够驾驭经典美国作家风格的才华横溢的作家。",
]

PROMPT_TEMPLATES = [
    "以{author}的风格写一段：{desc}",
    "用{author}的声音写关于：{desc}",
    "以{author}独特的散文风格，描述：{desc}",
    "像{author}会做的那样写这个场景：{desc}",
    "用{author}的重复技巧，描述：{desc}",
    "捕捉{author}在这段的节奏：{desc}",
    "像{author}一样写：{desc}",
    "用{author}的声音，写：{desc}",
    "这是一个文学练习。像{author}一样写：{desc}",
    "你能用{author}的风格写吗？{desc}",
]
```

### 指令生成

```python
INSTRUCTION_PROMPT = """用 2-3 句话描述这段摘录中发生的事情。
关注：出现的人物、行动、情感、背景。
不要直接引用文本。

摘录：
{text}
"""

# 使用快速、便宜的 LLM（例如，Gemini Flash）
instruction = llm_call(INSTRUCTION_PROMPT.format(text=chunk))
```

## 阶段 4：数据集构建

### 消息格式

```json
{
    "messages": [
        {"role": "system", "content": "你是一位专家创意作家..."},
        {"role": "user", "content": "以作者风格写：场景描述..."},
        {"role": "assistant", "content": "块中的实际书籍文本..."}
    ]
}
```

### 每个块的多个变体

```python
def build_examples(chunk, instruction, author, variants=2):
    examples = []
    for i in range(variants):
        system = SYSTEM_PROMPTS[i % len(SYSTEM_PROMPTS)]
        template = PROMPT_TEMPLATES[(chunk.id + i) % len(PROMPT_TEMPLATES)]
        user = template.format(author=author, desc=instruction)
        examples.append({"messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
            {"role": "assistant", "content": chunk.text}
        ]})
    return examples
```

## 阶段 5：Tinker 上的 LoRA 训练

### 配置

```python
CONFIG = {
    "model_name": "Qwen/Qwen3-8B-Base",  # 基础模型，不是指令调优版
    "lora_rank": 32,                      # 352MB 适配器
    "learning_rate": 5e-4,                # LoRA 的更高学习率
    "batch_size": 4,
    "epochs": 3,
}
```

### 为什么使用基础模型？

使用**基础**（预训练）模型，而不是指令调优版本：
- 基础模型对新风格更具可塑性
- 指令模型的模式会抵抗覆盖
- 风格是低级模式，基础模型捕捉得更好

### 训练循环

```python
import tinker
from tinker import types

training_client = await service_client.create_lora_training_client_async(
    base_model="Qwen/Qwen3-8B-Base",
    rank=32
)

for epoch in range(3):
    for batch in batches:
        await training_client.forward_backward_async(batch, loss_fn="cross_entropy")
        await training_client.optim_step_async(types.AdamParams(learning_rate=5e-4))

result = await training_client.save_weights_for_sampler_async(name="final")
```

## 阶段 6：验证

### 现代场景测试

使用原始书籍中不存在的场景进行测试：

```python
TEST_PROMPTS = [
    "写关于一个咖啡师制作拿铁的故事",
    "描述情侣通过短信交流",
    "写关于某人对气候变化的焦虑",
]
```

如果模型将风格标记应用于现代场景，它学到了**风格**，而不是**内容**。

### 原创性验证

```bash
# 在训练数据中搜索输出短语
grep "输出中的特定短语" dataset.jsonl
# 应该返回：无匹配
```

### AI 检测器测试

使用 GPTZero、Pangram 或 ZeroGPT 测试输出。

## 已知问题和解决方案

### 角色名称泄露

**症状**：模型在新场景中使用原始角色名称。
**原因**：单本书中名称多样性有限。
**解决方案**：训练多本书或添加合成示例。

### 模型复述确切短语

**症状**：输出包含来自训练数据的确切句子。
**原因**：提示变化太少或epoch太多。
**解决方案**：使用 15+ 个模板，限制在 3 个 epoch。

### 碎片化输出

**症状**：句子感觉不完整。
**原因**：分段不良在思想中间断开。
**解决方案**：始终在段落边界处断开。

## 准则

1. **始终选择 ePub 而非 PDF** - OCR 错误会成为学习的模式
2. **从不在句子中间断开** - 边界必须语法完整
3. **使用多样化提示** - 15+ 个模板，5+ 个系统提示
4. **使用基础模型** - 不是指令调优版本
5. **使用更小的块** - 150-400 字以获得更多示例
6. **保留测试集** - 最少 50 个示例
7. **在现代场景上测试** - 证明风格迁移 vs 记忆化
8. **验证原创性** - 在训练数据中 grep 输出短语

## 预期结果

| 指标 | 数值 |
|--------|-------|
| 每本书的训练示例 | 500-1000 |
| 模型 | Qwen/Qwen3-8B-Base |
| LoRA 秩 | 32 |
| 适配器大小 | 约 350 MB |
| 训练时间 | 约 15 分钟 |
| 损失降低 | 90%+ |
| 风格迁移成功率 | 约 50% 完美 |

## 成本估算

| 组件 | 成本 |
|-----------|------|
| LLM（指令生成） | 约 $0.50 |
| Tinker 训练（15 分钟） | 约 $1.50 |
| **总计** | **约 $2.00** |

## 与上下文工程技能的集成

这个例子应用了代理上下文工程集合中的几个技能：

### project-development
管道遵循分阶段、幂等架构模式：
- **获取**：从 ePub 提取文本
- **准备**：分段成训练块
- **处理**：生成合成指令
- **解析**：构建消息格式
- **渲染**：输出 Tinker 兼容的 JSONL
- **训练**：LoRA 微调
- **验证**：现代场景测试

每个阶段都是可恢复的，并为调试生成中间工件。

### context-compression
分段是训练的上下文压缩形式。来自上下文压缩的核心见解适用：信息密度比信息数量更重要。更小、连贯的块（150-400 字）比更大、稀释的块产生更好的风格迁移。

两层策略镜像上下文压缩评估：
- 第 1 层：快速、确定性压缩
- 第 2 层：LLM 辅助边缘情况

### multi-agent-patterns
管道使用**监督者/协调器**模式：
- 协调器协调阶段并管理状态
- 专门代理（提取、分段、指令、构建器）具有隔离的上下文
- 每个代理仅接收其任务所需的信息

这符合以下原则：子代理主要存在于隔离上下文中，而不是模拟角色。

### evaluation
验证遵循**最终状态评估**模式：
- 功能测试：输出是否匹配预期风格标记？
- 原创性验证：内容是否真正生成？
- 外部验证：AI 检测器分数

"现代场景"测试是一种分布外评估形式，证明泛化。

### context-fundamentals
提示多样性防止对单一模式的注意力崩溃。当使用相同提示结构进行训练时，模型会记忆化指令-响应映射。多样化模板强制注意力跨越风格模式本身。

## 参考资源

内部参考：
- [分段策略](./references/segmentation-strategies.md) - 文本分块模式
- [Tinker 格式规范](./references/tinker-format.md) - 数据结构
- [Tinker API 文档](./references/tinker.txt) - 完整 API 参考

来自代理上下文工程的相关技能：
- project-development - 管道架构模式
- context-compression - 压缩策略  
- multi-agent-patterns - 代理协调
- evaluation - 评估框架
- context-fundamentals - 注意力和信息密度

外部资源：
- [研究论文](https://arxiv.org/pdf/2510.13939) - Chakrabarty et al. 2025
- [Hugging Face 上的数据集](https://huggingface.co/datasets/MuratcanKoylan/gertrude-stein-style-sft)
- [格特鲁德·斯坦因案例研究](./examples/gertrude-stein/) - 完整工作示例

---

## 技能元数据

**创建**：2025-12-26
**最后更新**：2025-12-28
**作者**：Muratcan Koylan
**版本**：2.0.0
**独立**：是（与主要上下文工程集合分离）

