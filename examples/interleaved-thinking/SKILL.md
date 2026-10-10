---
name: reasoning-trace-optimizer
description: "用于分析智能体推理轨迹、上下文退化、工具混淆、指令漂移、重复任务失败和性能退化，以调试并优化 AI 智能体。"
---

# 推理轨迹优化器

通过分析智能体的推理轨迹来调试和优化智能体。本技能利用 MiniMax M2.1 的交错思考，深入观察决策过程并生成具体改进建议。

## 何时启用

- 需要调试或分析智能体推理轨迹，或优化提示词。
- 智能体任务失败，用户想了解原因。
- 用户提到上下文退化、工具混淆或指令漂移。
- 用户希望提高智能体表现或减少错误。
- 用户希望把调试经验整理为可分享的技能。
- 相似任务反复失败。

## 核心概念

### 交错思考

传统推理模型通常只在任务开始时思考；交错思考允许模型在每次工具交互之间继续推理。这对长时程任务、处理外部变化和调试决策过程都很重要。

### 优化循环

```text
执行智能体 → 捕获轨迹 → 分析模式 → 优化提示词 → 重新运行
```

每轮根据检测到的问题改进提示词，直到收敛。

### 失败模式

| 模式 | 说明 |
| --- | --- |
| `context_degradation` | 模型在长上下文中丢失信息 |
| `tool_confusion` | 模型误解工具能力或输出 |
| `instruction_drift` | 模型逐步偏离原始指令 |
| `goal_abandonment` | 模型放弃最初目标 |
| `circular_reasoning` | 模型重复相似动作却没有进展 |
| `premature_conclusion` | 任务未完成就下结论 |

## 使用方式

### 模式一：调试 M2.1 智能体

```python
from reasoning_trace_optimizer import TraceCapture, TraceAnalyzer

capture = TraceCapture()
trace = capture.run(
    task="搜索 Python 教程并总结",
    system_prompt="你是一名研究助理。",
    tools=[search_tool],
    tool_executor=execute_search
)

analyzer = TraceAnalyzer()
analysis = analyzer.analyze(trace)
print(f"Score: {analysis.overall_score}/100")
```

### 模式二：完整优化循环

使用 `OptimizationLoop` 自动迭代至提示词达到目标分数或收敛：

```python
from reasoning_trace_optimizer import OptimizationLoop, LoopConfig

config = LoopConfig(max_iterations=5, min_score_threshold=80.0)
loop = OptimizationLoop(config=config)
result = loop.run(
    task="分析代码库并提出改进建议",
    initial_prompt="你是一名代码审查员。",
    tools=[read_file_tool, search_tool],
    tool_executor=execute_tool
)
```

### 模式三：分析已有会话

在 Claude Code 中启用后，可分析当前会话的思考内容并给出建议：

```text
/reasoning-trace-optimizer analyze-session
```

### 模式四：生成可分享技能

将优化经验转换为可复用 Agent Skills：

```python
from reasoning_trace_optimizer import SkillGenerator

generator = SkillGenerator()
skill_path = generator.generate(
    result=loop_result,
    skill_name="web-search-best-practices",
    output_dir="./skills"
)
```

## 命令行

```bash
rto capture "搜索 Python 教程" -s "你是一名乐于助人的助手。"
rto analyze "调试这段代码" -o analysis.txt
rto optimize "研究 AI 论文" --max-iterations 5 --generate-skill
rto generate-skill my-skill-name --artifacts-dir ./optimization_artifacts
```

## 与 Claude Code 集成

### 失败时自动触发

可以在钩子中配置任务失败后的自动分析：

```json
{
  "hooks": {
    "post_tool_error": {
      "command": "rto analyze-session --last-error"
    }
  }
}
```

### 按需分析

```text
/reasoning-trace-optimizer
```

此命令会提取当前会话的思考轨迹、识别问题模式、提出提示词改进建议，并可选择更新系统提示词。

## 指南

1. **保留完整上下文**：M2.1 需要完整会话历史（包括思考块）才能获得最佳效果。
2. **明确工具定义**：工具描述应清楚且无歧义。
3. **设置合理收敛目标**：每轮提升 5%—10% 是常见情况。
4. **审查生成技能**：分享前先审核自动生成内容。
5. **监控令牌用量**：每次优化迭代都可能使用较多令牌。

## 示例

优化前，智能体可能调用错误工具，并在三轮后忘记目标；得分为 45/100，出现 `tool_confusion` 和 `goal_abandonment`。

优化后，提示词明确要求验证搜索结果、处理工具错误、持续追踪原始目标，并尽可能交叉核验多个来源；示例得分为 85/100，未检测到模式。

## 参考资料

- MiniMax M2.1 文档：https://platform.minimax.io/docs
- 交错思考指南：见 `docs/interleavedthinking.md`
- 智能体泛化：见 `docs/agentthinking.md`

## 技能元数据

创建时间：2025-01-11；作者：Muratcan Koylan；版本：0.1.0；使用模型：MiniMax M2.1；与 MiniMax AI 合作构建。
