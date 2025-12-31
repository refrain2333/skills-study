# 分段策略

用于在保留叙述连贯性的同时将书籍分割为训练块的高级模式。

## 分段问题

书籍对训练数据创建带来独特挑战：

1. **可变段落长度**：某些作者写跨越 1000+ 字的单个段落
2. **对话繁重部分**：短交换，个别部分太小
3. **场景边界**：不与字数对齐的自然断点
4. **风格变化**：作者在叙述、对话和论述之间转换声音

差的分段教导模型产生：
- 不完整的思想
- 突兀的结尾
- 不连贯的过渡
- 碎片化的风格

## 两层策略

### 第 1 层：基于段落的累积

结构良好文本的默认方法：

```python
class Tier1Segmenter:
    def __init__(self, min_words: int = 250, max_words: int = 650):
        self.min_words = min_words
        self.max_words = max_words
    
    def segment(self, text: str) -> list[Chunk]:
        paragraphs = self._split_paragraphs(text)
        chunks = []
        current = ChunkBuilder()
        
        for para in paragraphs:
            word_count = len(para.split())
            
            # 检查单个段落是否超过最大值
            if word_count > self.max_words:
                # 如果存在，完成当前块
                if current.word_count > 0:
                    chunks.append(current.build())
                    current = ChunkBuilder()
                
                # 标记为第 2 层处理
                chunks.append(Chunk(
                    text=para,
                    requires_tier2=True,
                    word_count=word_count
                ))
                continue
            
            # 这个段落会溢出当前块吗？
            if current.word_count + word_count > self.max_words:
                if current.word_count >= self.min_words:
                    chunks.append(current.build())
                    current = ChunkBuilder()
            
            current.add(para)
        
        # 不要忘记最后的块
        if current.word_count > 0:
            chunks.append(current.build())
        
        return chunks
    
    def _split_paragraphs(self, text: str) -> list[str]:
        # 在双换行符处分割，保留单个换行符
        paragraphs = text.split('\n\n')
        return [p.strip() for p in paragraphs if p.strip()]
```

### 第 2 层：LLM 辅助分段

对于无法在段落边界处分割的超大段落：

```python
class Tier2Segmenter:
    def __init__(self, model: str = "gpt-4o"):
        self.model = model
        self.prompt_template = self._load_prompt()
    
    async def segment(self, oversized_chunk: Chunk) -> list[Chunk]:
        """使用 LLM 分割超大段落。"""
        
        response = await self._call_llm(
            self.prompt_template.format(text=oversized_chunk.text)
        )
        
        segments = self._parse_segments(response)
        
        # 验证零删除
        original_words = len(oversized_chunk.text.split())
        segmented_words = sum(len(s.split()) for s in segments)
        
        if abs(original_words - segmented_words) > 5:  # 允许微小差异
            raise SegmentationError(
                f"字数不匹配：{original_words} -> {segmented_words}"
            )
        
        return [
            Chunk(text=s, requires_tier2=False, word_count=len(s.split()))
            for s in segments
        ]
    
    def _load_prompt(self) -> str:
        return """将此文本分割为最少 300-350 字的摘录。

要求：
- 每个摘录必须从开始在语法上完整
- 每个摘录不应感觉突然被切断
- 零删除 - 保持原始字数完全相同
- 在语法自然的地方断开：
  * 完整的对话交换后
  * 场景转换处
  * 完整思想或描述后
  * 段落自然打破的地方
- 避免分割成太多小摘录
- 直接从摘录开始
- 用 ===SEGMENT=== 分隔摘录

要分割的文本：
{text}
"""
    
    def _parse_segments(self, response: str) -> list[str]:
        segments = response.split("===SEGMENT===")
        return [s.strip() for s in segments if s.strip()]
```

## 场景感知分段

对于更高质量的结果，检测场景边界：

```python
class SceneAwareSegmenter:
    """当在字数限制内时，优先在场景边界处断开。"""
    
    SCENE_MARKERS = [
        r'\n\n\* \* \*\n\n',      # 星号分隔符
        r'\n\n---\n\n',            # 破折号分隔符
        r'\n\n###\n\n',            # 哈希分隔符
        r'\n\nCHAPTER \d+',        # 章节标题
        r'\n\n[A-Z]{3,}\n\n',      # 全大写场景断开
    ]
    
    def find_scene_breaks(self, text: str) -> list[int]:
        """查找场景断开的字符位置。"""
        breaks = []
        for pattern in self.SCENE_MARKERS:
            for match in re.finditer(pattern, text):
                breaks.append(match.start())
        return sorted(set(breaks))
    
    def segment_with_scenes(self, text: str) -> list[Chunk]:
        scene_breaks = self.find_scene_breaks(text)
        
        # 如果存在场景断开，优先于任意段落断开
        if scene_breaks:
            return self._segment_at_scenes(text, scene_breaks)
        else:
            return Tier1Segmenter().segment(text)
```

## 对话处理

对话繁重的部分需要特殊处理：

```python
class DialogueAwareSegmenter:
    """将对话交换分组以维持对话连贯性。"""
    
    def is_dialogue_paragraph(self, para: str) -> bool:
        """检查段落是否主要是对话。"""
        # 计数对话标记
        quote_count = para.count('"') + para.count("'")
        word_count = len(para.split())
        
        # 如果超过 20% 的字在引号中，则是对话繁重的
        return quote_count > word_count * 0.2
    
    def segment(self, text: str) -> list[Chunk]:
        paragraphs = text.split('\n\n')
        chunks = []
        current = ChunkBuilder()
        in_dialogue_block = False
        
        for para in paragraphs:
            is_dialogue = self.is_dialogue_paragraph(para)
            
            # 不要在对话交换中间断开
            if is_dialogue:
                in_dialogue_block = True
                current.add(para)
            else:
                if in_dialogue_block:
                    # 对话块结束 - 好的断点
                    in_dialogue_block = False
                    if current.word_count >= 250:
                        chunks.append(current.build())
                        current = ChunkBuilder()
                
                current.add(para)
                
                # 检查是否超过最大值
                if current.word_count > 650:
                    chunks.append(current.build())
                    current = ChunkBuilder()
        
        if current.word_count > 0:
            chunks.append(current.build())
        
        return chunks
```

## 验证管道

每个分段结果都应通过验证：

```python
class SegmentationValidator:
    def validate(self, chunks: list[Chunk]) -> ValidationResult:
        errors = []
        warnings = []
        
        for i, chunk in enumerate(chunks):
            # 检查字数限制
            if chunk.word_count < 200:
                warnings.append(f"块 {i}：仅 {chunk.word_count} 字")
            if chunk.word_count > 700:
                errors.append(f"块 {i}：{chunk.word_count} 字超过最大值")
            
            # 检查句子完整性
            if not self._ends_with_terminal(chunk.text):
                errors.append(f"块 {i}：在句子中间结束")
            
            if not self._starts_grammatically(chunk.text):
                errors.append(f"块 {i}：在句子中间开始")
            
            # 检查孤立对话
            if chunk.text.count('"') % 2 != 0:
                warnings.append(f"块 {i}：引号不平衡")
        
        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )
    
    def _ends_with_terminal(self, text: str) -> bool:
        text = text.strip()
        return text[-1] in '.!?"\'—'
    
    def _starts_grammatically(self, text: str) -> bool:
        text = text.strip()
        # 应该以大写或引号开始
        return text[0].isupper() or text[0] in '"\'—'
```

## 性能考虑

| 策略 | 速度 | 质量 | 用例 |
|----------|-------|---------|----------|
| 仅第 1 层 | 快 | 中等 | 结构良好的散文 |
| 第 1 + 2 层 | 中等 | 高 | 混合段落长度 |
| 场景感知 | 快 | 高 | 具有明确场景断开的小说 |
| 对话感知 | 中等 | 高 | 对话繁重的小说 |

## 边界情况

**1. 意识流写作**
- 单个"段落"跨越页面
- 解决方案：使用明确句子边界检测强制第 2 层

**2. 诗歌或韵文**
- 换行符是语义的，不是格式的
- 解决方案：将每个诗节视为原子单位

**3. 包含列表/项目的非虚构**
- 项目符号破坏段落检测
- 解决方案：预处理以将项目符号转换为散文

**4. 多个叙述者**
- 章节内的声音转移
- 解决方案：检测叙述者标记并优先在那里断开

## 与管道的集成

```python
class SegmentationAgent:
    def __init__(self, config: SegmentationConfig):
        self.tier1 = Tier1Segmenter(
            min_words=config.min_words,
            max_words=config.max_words
        )
        self.tier2 = Tier2Segmenter(model=config.tier2_model)
        self.validator = SegmentationValidator()
    
    async def segment(self, text: str) -> list[Chunk]:
        # 阶段 1：第 1 层分段
        chunks = self.tier1.segment(text)
        
        # 阶段 2：使用第 2 层处理超大块
        final_chunks = []
        for chunk in chunks:
            if chunk.requires_tier2:
                sub_chunks = await self.tier2.segment(chunk)
                final_chunks.extend(sub_chunks)
            else:
                final_chunks.append(chunk)
        
        # 阶段 3：验证
        result = self.validator.validate(final_chunks)
        if not result.valid:
            raise SegmentationError(result.errors)
        
        if result.warnings:
            logger.warning(f"分段警告：{result.warnings}")
        
        return final_chunks
```

