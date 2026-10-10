# M2.1 工具调用与交错思考

> 使用 Anthropic 或 OpenAI SDK 调用 MiniMax 模型。

MiniMax-M2.1 原生支持交错思考，可在每轮工具交互之间推理。每次调用工具前，模型都会根据当前环境和工具结果评估下一步操作。

![M2.1 交错思考示意](https://filecdn.minimax.chat/public/4f4b43c1-f0a5-416a-8770-1a4f80feeb1e.png)

这项能力适用于长时程和复杂任务。来源文档称，M2.1 在 SWE、BrowseCamp 和 xBench 等同时测试编程与智能体推理能力的基准上取得领先结果。

**关键原则**：每轮都要把模型的完整回复传回对话历史，尤其是 `thinking` 或 `reasoning_details` 等内部推理字段。

## 参数

### 请求参数

- `tools`：可调用函数列表，包含函数名、描述和参数数据结构。

### 响应字段

- `thinking` / `reasoning_details`：模型的推理过程。
- `text` / `content`：模型输出文本。
- `tool_calls`：模型决定调用的函数。
- `function.name`：被调用的函数名。
- `function.arguments`：函数参数，以 JSON 字符串表示。
- `id`：工具调用的唯一编号。

## 重要说明：保存完整历史

多轮函数调用中，必须把模型返回的完整助手消息追加到对话历史，才能保持推理链连续。

**OpenAI SDK**：追加完整的 `response_message`，包括 `tool_calls`。M2.1 默认可在 `content` 中返回 `<think>` 标签；设置 `reasoning_split=True` 时，推理内容会放在 `reasoning_details`，同样必须写回历史。

**Anthropic SDK**：追加完整的 `response.content` 列表，其中包括 thinking、text 和 tool_use 内容块。

## Anthropic SDK

国际用户使用 `https://api.minimax.io/anthropic`；中国大陆用户使用 `https://api.minimaxi.com/anthropic`。

```bash
export ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
export ANTHROPIC_API_KEY=${YOUR_API_KEY}
```

示例：

```python
import anthropic
import json

client = anthropic.Anthropic()
tools = [{
    "name": "get_weather",
    "description": "查询地点天气；用户需先提供地点。",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "城市和州/国家，例如 San Francisco, US"
            }
        },
        "required": ["location"]
    }
}]

def send_messages(messages):
    return client.messages.create(
        model="MiniMax-M2.1",
        max_tokens=4096,
        messages=messages,
        tools=tools,
    )

messages = [{"role": "user", "content": "旧金山现在天气如何？"}]
response = send_messages(messages)

for block in response.content:
    if block.type == "thinking":
        print("推理过程：", block.thinking)
    elif block.type == "text":
        print("模型回复：", block.text)
    elif block.type == "tool_use":
        print("工具调用：", block.name, json.dumps(block.input, ensure_ascii=False))

if any(block.type == "tool_use" for block in response.content):
    # 关键：完整保存助手回复，包括 thinking 和 tool_use 内容块。
    messages.append({"role": "assistant", "content": response.content})
    tool_block = next(block for block in response.content if block.type == "tool_use")
    tool_result = "24℃，晴朗"
    messages.append({
        "role": "user",
        "content": [{
            "type": "tool_result",
            "tool_use_id": tool_block.id,
            "content": tool_result,
        }]
    })
    final_response = send_messages(messages)
```

## OpenAI SDK

国际用户使用 `https://api.minimax.io/v1`；中国大陆用户使用 `https://api.minimaxi.com/v1`。

```bash
export OPENAI_BASE_URL=https://api.minimax.io/v1
export OPENAI_API_KEY=${YOUR_API_KEY}
```

### 兼容的交错思考格式

通过 OpenAI SDK 调用 MiniMax-M2.1 时，可传入额外参数 `reasoning_split=True`，让推理内容以开发者更容易处理的格式返回。

必须把完整的 `response_message`（包括 `reasoning_details`）保留在历史中，并在下一轮传回模型。检查请求、响应处理和 `messages.append(response_message)` 的实现。

```python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="MiniMax-M2.1",
    messages=[{"role": "user", "content": "旧金山现在天气如何？"}],
    tools=tools,
    extra_body={"reasoning_split": True},
)
response_message = response.choices[0].message

# 不要删减 reasoning_details 或 tool_calls。
messages.append(response_message)
```

### OpenAI 原生格式

OpenAI ChatCompletion 原生格式不能直接在独立字段中返回并回传思考内容。模型会将思考内容写入 `content`，并用 `<think>...</think>` 包裹；开发者可自行解析用于显示，但推荐使用兼容格式。

设置 `extra_body={"reasoning_split": False}` 时，思考会嵌入 `content`，需要时可手动解析 `<think>`。使用原生格式时，不得修改历史消息中的 `content`，必须完整保留思考内容。

## 支持的模型

Anthropic SDK 兼容接口支持以下模型：

| 模型 | 说明 |
| --- | --- |
| MiniMax-M2.1 | 编程能力强，输出速度约 60 token/秒 |
| MiniMax-M2.1-lightning | 速度更快、更灵敏，约 100 token/秒 |
| MiniMax-M2 | 智能体能力和高级推理 |

如需使用其他模型，请使用标准 MiniMax API。可用模型和支持范围可能随服务更新而变化。

## 参数兼容性

| 参数 | 支持情况 | 说明 |
| --- | --- | --- |
| `model` | 完全支持 | 支持上述 MiniMax 模型 |
| `messages` | 部分支持 | 支持文本和工具调用，不支持图片或文档输入 |
| `max_tokens` | 完全支持 | 生成令牌上限 |
| `stream` | 完全支持 | 流式响应 |
| `system` | 完全支持 | 系统提示词 |
| `temperature` | 完全支持 | 范围为 `(0.0, 1.0]`，建议值为 1 |
| `tool_choice` | 完全支持 | 工具选择策略 |
| `tools` | 完全支持 | 工具定义 |
| `top_p` | 完全支持 | 核采样参数 |
| `metadata` | 完全支持 | 元数据 |
| `thinking` | 完全支持 | 推理内容 |
| `top_k`、`stop_sequences`、`service_tier`、`mcp_servers`、`context_management`、`container` | 忽略 | 当前接口忽略这些参数 |
| `image`、`document` 内容类型 | 不支持 | 暂不支持图片和文档输入 |

## 相关文档

- [Anthropic SDK 文档](https://docs.anthropic.com/en/api/client-sdks)
- [MiniMax 文本生成 API](https://platform.minimax.io/docs/api-reference/text-intro)
- [MiniMax M2.1 工具调用和交错思考](https://platform.minimax.io/docs/guides/text-m2-function-call)
- [兼容的 Anthropic API](https://platform.minimax.io/docs/api-reference/text-anthropic-api)
- [兼容的 OpenAI API](https://platform.minimax.io/docs/api-reference/text-openai-api)
