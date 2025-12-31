# OpenRouter API 测试

一个简单的Python脚本来测试OpenRouter API连接。

## 功能

- 测试API健康检查
- 获取可用模型列表
- 测试聊天完成功能

## 安装依赖

```bash
pip install requests
```

## 使用方法

1. 设置API密钥环境变量：

```bash
export OPENROUTER_API_KEY="your-api-key-here"
```

2. 运行测试脚本：

```bash
python openrouter_test.py
```

## 输出示例

```
🚀 OpenRouter API 测试工具
========================================
✅ API连接正常
✅ 成功获取到 100 个模型
  1. gpt-4o-mini - GPT-4o Mini
  2. gpt-4o - GPT-4o
  3. claude-sonnet - Claude Sonnet
  4. gemini-pro - Gemini Pro
  5. llama-3.1-70b - LLaMA 3.1 70B
  ... 还有 95 个模型
✅ 成功获得回复:
   我是一个由OpenRouter平台提供的AI助手，能够帮助您回答问题、提供信息和完成各种任务。

========================================
📊 测试结果: 3/3 通过
🎉 所有测试通过！OpenRouter API 连接正常
```

## 注意事项

- 请确保API密钥正确且有效
- 需要网络连接访问OpenRouter API
- 默认使用gpt-4o-mini模型进行聊天测试