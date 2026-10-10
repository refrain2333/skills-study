# 推理轨迹优化器

<p align="center">
  <strong>使用 MiniMax M2.1 交错思考分析推理轨迹，调试并优化 AI 智能体</strong>
</p>

<p align="center">
  <a href="#核心能力">核心能力</a> |
  <a href="#快速开始">快速开始</a> |
  <a href="#工作原理">工作原理</a> |
  <a href="#示例">示例</a> |
  <a href="#接口参考">接口参考</a>
</p>

## 问题

传统 AI 智能体的失败过程往往不透明：我们能看到最终结果，却看不到决策原因。智能体调用错误工具、忘记目标或编造信息时，开发者只能猜测问题出在哪里。

## 解决方案

**推理轨迹优化器**利用 MiniMax M2.1 的**交错思考**能力，在每次工具调用之间记录智能体的推理过程，从而支持：

1. **深入调试**：定位推理从何处偏离预期。
2. **模式检测**：自动识别上下文退化、工具混淆等失败模式。
3. **自动优化**：根据检测结果生成改进后的提示词。
4. **共享技能**：将经验整理为可复用的 Agent Skills，供团队分享。

## 为什么使用 MiniMax M2.1？

传统模式是在开始时推理一次，然后连续执行动作；M2.1 则可以在工具调用之间持续推理：

```text
传统：推理 → 执行 → 执行 → 执行 → 完成
M2.1：推理 → 执行 → 推理 → 执行 → 推理 → 执行 → 完成
```

这对智能体很重要，因为长任务需要跨多轮保持专注；工具输出会带来意外信息，需要及时调整；调试需要观察决策过程，而不只是最终结果。

Anthropic SDK 中的 `thinking` 内容块和 OpenAI SDK 中的 `reasoning_details` 字段可用于读取推理轨迹。

## 核心能力

| 组件 | 用途 |
| --- | --- |
| `TraceCapture` | 包装 M2.1 API，记录完整上下文中的所有思考内容 |
| `TraceAnalyzer` | 检测上下文退化、工具混淆、指令漂移等模式 |
| `PromptOptimizer` | 使用 M2.1 根据分析结果生成改进提示词 |
| `OptimizationLoop` | 自动执行“捕获 → 分析 → 改进 → 重跑”循环 |
| `SkillGenerator` | 将经验整理为可分享的 Agent Skills |

分析器可检测：

| 模式 | 含义 | 严重程度 |
| --- | --- | --- |
| `context_degradation` | 模型在长上下文中遗失信息 | 高 |
| `tool_confusion` | 模型误解工具能力 | 高 |
| `instruction_drift` | 模型偏离原始指令 | 中 |
| `hallucination` | 模型生成无依据的信息 | 严重 |
| `goal_abandonment` | 模型停止追求原目标 | 高 |
| `circular_reasoning` | 模型重复相似动作而没有进展 | 中 |
| `premature_conclusion` | 任务未完成就提前下结论 | 中 |
| `missing_validation` | 模型没有验证结果 | 高 |

每个模式包含思考轨迹证据、严重程度、提示词改进建议和检测置信度。

## 快速开始

### 安装

```bash
cd examples/interleaved-thinking
pip install -e .
```

### 配置

```bash
export ANTHROPIC_API_KEY=your_minimax_api_key
export ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
```

也可以写入 `.env`：

```env
ANTHROPIC_API_KEY=your_minimax_api_key
ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
```

### 基本用法

```python
from reasoning_trace_optimizer import TraceCapture, TraceAnalyzer

capture = TraceCapture()
trace = capture.run(
    task="解释量子计算",
    system_prompt="你是一名科学教育者。"
)

print(f"Captured {len(trace.thinking_blocks)} thinking blocks")

analyzer = TraceAnalyzer()
analysis = analyzer.analyze(trace)
print(f"Overall Score: {analysis.overall_score}/100")
```

## 工作原理

### 优化循环

```text
执行智能体 → 捕获轨迹 → 分析模式 → 优化提示词
      ↑                                  │
      └──────────────────────────────────┘
       直到收敛或达到最大迭代次数
```

当分数提升低于阈值，或达到目标分数时停止。

### 捕获内容

每次执行会记录：思考内容块、工具调用及参数、工具返回结果、最终回复，以及令牌数、轮数和成功/失败状态等元数据。

### 分析内容

分析器检查智能体当前对任务的理解、如何解释工具结果、考虑过哪些方案，以及是否仍在追求原始目标。

## 示例

### 简单轨迹捕获

```python
from reasoning_trace_optimizer import TraceCapture

capture = TraceCapture()
trace = capture.run(
    task="解释交错思考是什么，以及它对 AI 智能体为何重要。",
    system_prompt="你是一名善于清楚解释概念的 AI 研究者。"
)
```

### 使用工具并分析

定义工具后，将工具和执行函数传给 `TraceCapture`，再使用 `TraceAnalyzer.analyze(trace)` 分析。分析结果包含总分、思考块数量、工具调用数量和检测到的模式。

### 完整优化循环

复杂研究任务可以使用 `OptimizationLoop`，设置最大迭代数、最低目标分数和是否保存产物。结束后可用 `SkillGenerator` 生成可分享技能。

典型输出会展示每轮分数、任务完成情况、思考块和工具调用数量、检测模式以及分数退化提示。系统会追踪最佳分数，避免后续迭代退化时丢弃更好的提示词。

## 生成的产物

每次优化运行可保存 `optimization_artifacts/`，包含总摘要、最终提示词，以及每轮的完整轨迹、模式分析和提示词改动。

`SkillGenerator` 可生成包含 `SKILL.md` 和参考资料的技能目录。生成技能示例会记录缺少验证、引用未读取来源和忽略矛盾等失败模式，以及相应实践建议。

## 接口参考

### `TraceCapture`

```python
capture = TraceCapture(
    api_key="...",
    base_url="https://api.minimax.io/anthropic",
    model="MiniMax-M2.1"
)

trace = capture.run(
    task="...",
    system_prompt="...",
    tools=[...],
    tool_executor=fn,
    max_turns=10,
    max_tokens=4096
)
```

### `TraceAnalyzer`

```python
analyzer = TraceAnalyzer(
    api_key="...",
    base_url="https://api.minimax.io/anthropic",
    model="MiniMax-M2.1"
)
analysis = analyzer.analyze(trace)
quick_score = analyzer.quick_score(trace)
```

### `OptimizationLoop`

```python
config = LoopConfig(
    max_iterations=5,
    convergence_threshold=3.0,
    min_score_threshold=75.0,
    regression_threshold=8.0,
    use_best_prompt=True,
    max_prompt_growth=5.0,
    save_artifacts=True,
    artifacts_dir="./artifacts"
)

loop = OptimizationLoop(config=config)
result = loop.run(task, initial_prompt, tools, tool_executor)
```

保护措施包括保留最高分提示词、限制提示词增长、防止提示词膨胀，并在分数下降时告警或停止。

复杂任务分数通常低于简单任务：单工具简单任务约 80—95 分，3—5 个工具的中等任务约 70—85 分，6 个以上工具的复杂长链任务约 60—75 分。分数受工具输出差异、有效解法多样性和长任务随机性影响，优化重点应放在相对提升和消除失败模式，而非追求绝对分数。

### `SkillGenerator`

```python
generator = SkillGenerator()
skill_path = generator.generate(
    result=loop_result,
    skill_name="my-skill",
    output_dir="./generated_skills",
    title="便于阅读的标题"
)
```

## 命令行用法

```bash
rto capture "解释交错思考" -s "你是一名 AI 研究者。"
rto analyze "调试这段代码" -o analysis.txt
rto optimize "研究 AI 论文" --max-iterations 5 --generate-skill
rto generate-skill my-skill-name --artifacts-dir ./optimization_artifacts
```

## 示例使用的真实资料

示例三使用真实文档网址模拟研究流程，包括 Anthropic 文档与研究文章、OpenAI 文档、MiniMax M2.1 文档、DAIR.AI 提示词指南、LangChain 调试文档以及 arXiv 的“中间位置丢失”论文（`2307.03172`）。

## 稳健性

### 解析容错

模型有时无法生成有效 JSON，系统会采取回退处理：

| 组件 | 回退方式 |
| --- | --- |
| 分析器 | JSON 解析失败时使用正则抽取分数，默认 50/100，而不是 0 |
| 优化器 | 依次尝试 JSON、正则、标记和代码块提取提示词 |
| 循环 | 提示词未变化时发出警告，并追踪最佳迭代 |

十轮测试显示，随机模型行为可能使分数上下波动约 15 分；最佳分数可能出现在中途；启用 `use_best_prompt=True` 可保留中途最佳结果。解析失败时也会使用容错路径，而非将分数直接设为 0。

## 项目结构

```text
reasoning_trace_optimizer/
├── __init__.py          # 公共接口
├── models.py            # Pydantic 数据模型
├── capture.py           # M2.1 API 轨迹捕获
├── analyzer.py          # 模式检测与解析回退
├── optimizer.py         # 提示词改进与提取回退
├── loop.py              # 优化循环和最佳分数追踪
├── skill_generator.py   # 技能生成
└── cli.py               # 命令行接口
```

## 集成方式

此项目包含 Claude Code 技能，可在任务失败时自动分析、按需分析当前会话，并提供技能改进建议。

也可作为 Python 库导入：

```python
from reasoning_trace_optimizer import (
    TraceCapture,
    TraceAnalyzer,
    PromptOptimizer,
    OptimizationLoop,
    LoopConfig,
    SkillGenerator,
)
```

## 许可证与参考资料

MIT 许可证。本项目属于[智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)。

- [MiniMax M2.1 文档](https://www.minimax.io/platform/docs)
- [MiniMax API 参考](https://www.minimax.io/platform/docs/M2.1)
- [交错思考指南](./docs/interleavedthinking.md)
- [智能体泛化研究](./docs/agentthinking.md)
- [Anthropic API 兼容说明](./docs/m2-1.md)

<p align="center"><strong>与 MiniMax AI 合作构建，展示交错思考如何帮助调试智能体</strong></p>
