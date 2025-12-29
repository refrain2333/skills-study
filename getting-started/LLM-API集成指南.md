# LLM API 集成指南

这个指南展示了如何将研究助手系统与不同的 LLM 提供商集成。

## 快速选择

选择你想要使用的 LLM 提供商：

- **OpenAI (GPT-4o)** - 最强大的闭源模型
- **Anthropic (Claude)** - 安全性和推理能力强
- **本地 Ollama** - 完全私密，无需 API key
- **LangChain** - 统一接口，支持多个提供商
- **Groq** - 超快推理速度（适合实时应用）

---

## 方案 1：OpenAI (GPT-4o)

### 步骤 1：安装依赖

```bash
pip install openai
```

### 步骤 2：设置 API Key

```bash
# Linux/Mac
export OPENAI_API_KEY="sk-xxxxx"

# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-xxxxx"
```

### 步骤 3：集成代码

在 `研究助手系统示例.py` 中替换 `LLMInterface` 类的 `call()` 方法：

```python
def call(self, prompt: str, system_prompt: str = None, 
         temperature: float = 0.7, max_tokens: int = 2000) -> str:
    """调用 OpenAI API"""
    from openai import OpenAI
    
    client = OpenAI(api_key=self.api_key)
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model=self.model or "gpt-4o",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    # 记录令牌使用
    self.total_tokens += response.usage.total_tokens
    
    return response.choices[0].message.content
```

### 步骤 4：运行

```bash
python 研究助手系统示例.py
```

### 成本估算

- 输入：$0.003/1K tokens（gpt-4o）
- 输出：$0.012/1K tokens（gpt-4o）
- 典型研究查询：50K tokens ≈ $0.70

---

## 方案 2：Anthropic Claude

### 步骤 1：安装依赖

```bash
pip install anthropic
```

### 步骤 2：设置 API Key

```bash
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

### 步骤 3：集成代码

```python
def call(self, prompt: str, system_prompt: str = None, 
         temperature: float = 0.7, max_tokens: int = 2000) -> str:
    """调用 Anthropic Claude API"""
    from anthropic import Anthropic
    
    client = Anthropic(api_key=self.api_key)
    
    response = client.messages.create(
        model=self.model or "claude-3-5-sonnet-20241022",
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt or "You are a helpful assistant.",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    # 记录令牌使用
    self.total_tokens += response.usage.input_tokens + response.usage.output_tokens
    
    return response.content[0].text
```

### 成本估算

- Claude 3.5 Sonnet：$0.003/1K input, $0.015/1K output
- 典型研究查询：50K tokens ≈ $0.99

---

## 方案 3：本地 Ollama（推荐用于隐私和开发）

### 步骤 1：安装 Ollama

访问 https://ollama.ai 并下载安装程序

### 步骤 2：启动 Ollama 服务

```bash
ollama serve

# 在另一个终端拉取模型
ollama pull llama2          # 7B，快速
ollama pull mistral         # 7B，高质量
ollama pull neural-chat     # 针对对话优化
```

### 步骤 3：集成代码

```python
def call(self, prompt: str, system_prompt: str = None, 
         temperature: float = 0.7, max_tokens: int = 2000) -> str:
    """调用本地 Ollama API"""
    import requests
    import json
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    # 构建请求
    payload = {
        "model": self.model or "mistral",
        "messages": messages,
        "temperature": temperature,
        "stream": False
    }
    
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json=payload,
            timeout=300  # 本地可能较慢
        )
        response.raise_for_status()
        
        result = response.json()
        return result["message"]["content"]
    
    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            "无法连接到 Ollama 服务。"
            "请确保已运行 `ollama serve`"
        )
```

### 优势和劣势

✅ **优势：**
- 完全免费
- 无隐私顾虑
- 本地运行，离线工作
- 无API限流

❌ **劣势：**
- 需要本地计算资源
- 模型质量通常低于商业模型
- 需要更多的提示工程

---

## 方案 4：LangChain（统一接口）

### 步骤 1：安装依赖

```bash
pip install langchain langchain-openai langchain-anthropic
```

### 步骤 2：集成代码

```python
from langchain.llms import OpenAI, Anthropic
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

class LangChainLLMInterface(LLMInterface):
    def __init__(self, provider: str = "openai", api_key: str = None, model: str = None):
        super().__init__(api_key, model)
        
        if provider == "openai":
            self.llm = OpenAI(
                api_key=api_key,
                model=model or "gpt-4o",
                temperature=0.7
            )
        elif provider == "anthropic":
            self.llm = Anthropic(
                api_key=api_key,
                model=model or "claude-3-5-sonnet-20241022"
            )
    
    def call(self, prompt: str, system_prompt: str = None, 
             temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """使用 LangChain 调用 LLM"""
        
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        response = self.llm.predict(full_prompt, max_tokens=max_tokens)
        self.call_count += 1
        
        return response
```

### 使用

```python
# 轻松切换提供商
llm = LangChainLLMInterface(provider="openai", model="gpt-4o")
# 或
llm = LangChainLLMInterface(provider="anthropic", model="claude-3-5-sonnet-20241022")
```

---

## 方案 5：Groq（极快推理）

### 步骤 1：安装依赖

```bash
pip install groq
```

### 步骤 2：设置 API Key

从 https://console.groq.com 获取 API Key

```bash
export GROQ_API_KEY="gsk_xxxxx"
```

### 步骤 3：集成代码

```python
def call(self, prompt: str, system_prompt: str = None, 
         temperature: float = 0.7, max_tokens: int = 2000) -> str:
    """调用 Groq API（超快推理）"""
    from groq import Groq
    
    client = Groq(api_key=self.api_key)
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model=self.model or "mixtral-8x7b-32768",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    self.total_tokens += response.usage.total_tokens
    return response.choices[0].message.content
```

### 性能对比

| 提供商 | 速度 | 成本 | 质量 | 隐私 |
|-------|------|------|------|------|
| Groq | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| OpenAI | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| Anthropic | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Ollama | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 完整的多提供商切换示例

```python
import os
from enum import Enum

class LLMProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    OLLAMA = "ollama"
    GROQ = "groq"
    LANGCHAIN = "langchain"


def create_llm_interface(provider: LLMProvider, model: str = None) -> LLMInterface:
    """工厂函数 - 根据环境变量或参数选择 LLM 提供商"""
    
    api_key = os.getenv(f"{provider.name}_API_KEY")
    
    if provider == LLMProvider.OPENAI:
        return OpenAIInterface(api_key, model or "gpt-4o")
    elif provider == LLMProvider.ANTHROPIC:
        return AnthropicInterface(api_key, model or "claude-3-5-sonnet-20241022")
    elif provider == LLMProvider.OLLAMA:
        return OllamaInterface(model or "mistral")
    elif provider == LLMProvider.GROQ:
        return GroqInterface(api_key, model or "mixtral-8x7b-32768")
    else:
        raise ValueError(f"未知的提供商: {provider}")


# 使用
if __name__ == "__main__":
    # 从环境变量读取选择
    provider_str = os.getenv("LLM_PROVIDER", "ollama").lower()
    provider = LLMProvider[provider_str.upper()]
    
    llm = create_llm_interface(provider)
    coordinator = ResearchCoordinator(llm)
    
    # 执行研究...
```

### 环境变量配置文件（`.env`）

```bash
# 选择提供商
LLM_PROVIDER=ollama
# LLM_PROVIDER=openai
# LLM_PROVIDER=anthropic

# API Keys
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
GROQ_API_KEY=gsk_xxxxx

# 模型选择
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
GROQ_MODEL=mixtral-8x7b-32768
OLLAMA_MODEL=mistral
```

### 运行时加载配置

```python
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 现在所有环境变量都可用
provider = LLMProvider[os.getenv("LLM_PROVIDER").upper()]
llm = create_llm_interface(provider)
```

---

## 成本追踪示例

```python
class CostTracker:
    """跟踪 LLM API 成本"""
    
    PRICING = {
        "gpt-4o": {"input": 0.003, "output": 0.012},
        "claude-3-5-sonnet": {"input": 0.003, "output": 0.015},
        "mixtral-8x7b": {"input": 0.0, "output": 0.0},  # 免费
        "mistral": {"input": 0.0, "output": 0.0},  # 本地，免费
    }
    
    def __init__(self, model: str):
        self.model = model
        self.input_tokens = 0
        self.output_tokens = 0
    
    def track(self, input_tokens: int, output_tokens: int):
        self.input_tokens += input_tokens
        self.output_tokens += output_tokens
    
    def get_cost(self) -> float:
        if self.model not in self.PRICING:
            return 0.0
        
        pricing = self.PRICING[self.model]
        input_cost = (self.input_tokens / 1000) * pricing["input"]
        output_cost = (self.output_tokens / 1000) * pricing["output"]
        
        return input_cost + output_cost
    
    def report(self) -> str:
        cost = self.get_cost()
        return f"""
成本报告 ({self.model}):
  输入令牌: {self.input_tokens:,}
  输出令牌: {self.output_tokens:,}
  总令牌: {self.input_tokens + self.output_tokens:,}
  估计成本: ${cost:.4f}
        """.strip()
```

---

## 故障排除

### 问题 1：连接超时

**症状：** `ConnectionError: timeout`

**解决方案：**
```python
# 增加超时时间
response = requests.post(
    url,
    json=payload,
    timeout=300  # 增加到 300 秒
)
```

### 问题 2：API 限流

**症状：** `RateLimitError`

**解决方案：**
```python
import time
from tenacity import retry, wait_exponential

@retry(wait=wait_exponential(multiplier=1, min=2, max=10))
def call_llm_with_retry(prompt):
    # 自动重试，指数退避
    return llm.call(prompt)
```

### 问题 3：Ollama 连接失败

**症状：** `无法连接到 Ollama 服务`

**解决方案：**
```bash
# 1. 确保 Ollama 正在运行
ollama serve

# 2. 检查模型是否已下载
ollama list

# 3. 拉取模型
ollama pull mistral

# 4. 检查 localhost:11434 是否可访问
curl http://localhost:11434/api/tags
```

---

## 推荐配置

### 开发环境

```bash
# 免费、快速、离线
LLM_PROVIDER=ollama
OLLAMA_MODEL=mistral
```

### 生产环境

```bash
# 高质量、可靠
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4o
```

### 实时应用

```bash
# 超快速推理
LLM_PROVIDER=groq
GROQ_MODEL=mixtral-8x7b-32768
```

### 隐私敏感

```bash
# 完全本地，无隐私泄露
LLM_PROVIDER=ollama
OLLAMA_MODEL=neural-chat
```

---

## 总结

- **选择提供商** - 基于你的需求（成本、质量、隐私、速度）
- **实现 `call()` 方法** - 替换 LLMInterface 中的通用实现
- **追踪成本** - 从第一天就监控开支
- **使用环境变量** - 不要在代码中硬编码 API keys
- **实现错误处理** - 重试机制、超时处理、限流处理

祝你构建成功的智能体系统！🚀

