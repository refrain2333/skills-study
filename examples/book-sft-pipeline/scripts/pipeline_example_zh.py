"""
书籍 SFT 管道 - 概念实现

这演示了构建书籍到 SFT 管道的核心模式。
适应您特定的 LLM 提供商和训练平台。
"""

from dataclasses import dataclass
from typing import List
import json

# =============================================================================
# 数据结构
# =============================================================================

@dataclass
class Chunk:
    text: str
    word_count: int
    id: int

@dataclass 
class TrainingExample:
    system: str
    user: str
    assistant: str
    
    def to_messages(self) -> dict:
        return {
            "messages": [
                {"role": "system", "content": self.system},
                {"role": "user", "content": self.user},
                {"role": "assistant", "content": self.assistant}
            ]
        }

# =============================================================================
# 分段 - 核心算法
# =============================================================================

def segment_text(text: str, min_words: int = 150, max_words: int = 400) -> List[Chunk]:
    """
    将文本分段为训练大小的块，具有重叠。
    
    关键见解：更小的块（150-400）比更大的块（250-650）产生更多示例
    和更好的风格迁移。
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []
    buffer = []
    buffer_words = 0
    
    for para in paragraphs:
        para_words = len(para.split())
        
        if buffer_words + para_words > max_words and buffer_words >= min_words:
            chunks.append(Chunk(
                text='\n\n'.join(buffer),
                word_count=buffer_words,
                id=len(chunks)
            ))
            # 保留最后一个段落以保持重叠
            buffer = [buffer[-1], para] if buffer else [para]
            buffer_words = len(buffer[-2].split()) + para_words if len(buffer) > 1 else para_words
        else:
            buffer.append(para)
            buffer_words += para_words
    
    if buffer and buffer_words >= min_words // 2:
        chunks.append(Chunk(text='\n\n'.join(buffer), word_count=buffer_words, id=len(chunks)))
    
    return chunks

# =============================================================================
# 多样化提示生成 - 防止记忆化
# =============================================================================

SYSTEM_PROMPTS = [
    "你是一位能够模仿特定文学风格的专家创意作家。",
    "你是一位深谙经典散文风格的文学作家。",
    "你是一位善于模仿独特作者声音的创意作家。",
]

PROMPT_TEMPLATES = [
    "以{author}的风格写一段：{desc}",
    "用{author}的声音写关于：{desc}",
    "以{author}独特的散文风格，描述：{desc}",
    "像{author}会做的那样写这个场景：{desc}",
    "用{author}的重复、有节奏的技巧，写：{desc}",
]

def build_examples(chunk: Chunk, instruction: str, author: str, variants: int = 2) -> List[TrainingExample]:
    """
    为每个块生成多个训练变体。
    
    关键见解：多样化的提示防止模型记忆化特定措辞
    并强制其学习基础风格模式。
    """
    examples = []
    for i in range(variants):
        system = SYSTEM_PROMPTS[i % len(SYSTEM_PROMPTS)]
        template = PROMPT_TEMPLATES[(chunk.id + i) % len(PROMPT_TEMPLATES)]
        user = template.format(author=author, desc=instruction)
        examples.append(TrainingExample(system=system, user=user, assistant=chunk.text))
    return examples

# =============================================================================
# 指令生成提示
# =============================================================================

INSTRUCTION_PROMPT = """用 2-3 句话描述这段摘录中发生的事情。
关注：出现的人物、行动、情感和背景。
不要直接引用文本。

摘录：
{text}
"""

def generate_instruction(chunk: Chunk, llm_call) -> str:
    """
    为块生成场景描述。
    用你的实际 LLM API 替换 llm_call。
    """
    prompt = INSTRUCTION_PROMPT.format(text=chunk.text[:2000])
    response = llm_call(prompt)
    # 清理常见前缀
    cleaned = response.strip()
    for prefix in ["这段摘录", "摘录", "在这段中"]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):].lstrip(", :")
    return cleaned

# =============================================================================
# Tinker 数据构建
# =============================================================================

def build_tinker_datum(example: dict, tokenizer, renderer):
    """
    将训练示例转换为 Tinker Datum 格式。
    
    关键见解：提示的权重为 0，完成的权重为 1。
    这教导模型生成完成，而不是重复提示。
    """
    messages = example["messages"]
    model_input, weights = renderer.build_supervised_example(messages)
    
    input_tokens = model_input.to_ints()
    target_tokens = input_tokens[1:]  # 为下一个令牌预测移位
    weights = weights[1:]             # 对齐权重
    
    return {
        "model_input": input_tokens[:-1],
        "loss_fn_inputs": {
            "target_tokens": target_tokens,
            "weights": weights
        }
    }

# =============================================================================
# 验证模式
# =============================================================================

def validate_style_transfer(output: str, training_data_path: str) -> dict:
    """
    验证模型学到了风格，而不仅是记忆化了内容。
    """
    # 检查训练数据中的确切短语匹配
    with open(training_data_path) as f:
        training_text = f.read()
    
    # 将输出分割成短语并检查匹配
    phrases = [output[i:i+50] for i in range(0, len(output)-50, 25)]
    exact_matches = sum(1 for p in phrases if p in training_text)
    
    return {
        "originality_score": 1.0 - (exact_matches / max(len(phrases), 1)),
        "exact_matches": exact_matches,
        "is_original": exact_matches < 3
    }

MODERN_TEST_SCENARIOS = [
    "写关于一个咖啡师制作拿铁的故事",
    "描述两个情侣通过短信交流",
    "写关于某人对气候变化的焦虑",
]
# 如果模型将风格应用于现代场景，它学到了风格而不是内容

