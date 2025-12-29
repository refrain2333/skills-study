"""
完整实例：构建一个智能研究助手系统

这个脚本演示了如何独立使用 Agent Skills 中的原理来构建一个完整的多代理系统。

不依赖 Claude、Cursor 或任何特定平台 - 只使用标准 Python 和可配置的 LLM API。

功能：
- 接受研究话题
- 分解为子任务
- 并行执行搜索和分析
- 综合生成报告
- 持久化内存和结果
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict, field
import sys


# ============================================================================
# 第一部分：核心数据结构
# ============================================================================

@dataclass
class Task:
    """代表一个任务"""
    id: str
    title: str
    description: str
    task_type: str  # "search", "analyze", "synthesize"
    status: str = "pending"  # "pending", "in_progress", "completed", "failed"
    result: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


@dataclass
class Message:
    """代理间通信消息"""
    sender: str
    receiver: str
    content: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ResearchResult:
    """研究结果"""
    topic: str
    search_results: List[Dict] = field(default_factory=list)
    analysis: Dict[str, Any] = field(default_factory=dict)
    synthesis: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


# ============================================================================
# 第二部分：简化的 LLM 接口（可配置使用任何 API）
# ============================================================================

class LLMInterface:
    """
    LLM 接口 - 这是与具体 LLM API 的集成点
    
    使用步骤：
    1. 替换 call() 方法中的实现
    2. 支持任何 API：OpenAI, Anthropic, 本地 Ollama, 等
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "default"):
        self.api_key = api_key
        self.model = model
        self.call_count = 0
        self.total_tokens = 0
    
    def call(self, prompt: str, system_prompt: str = None, 
             temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """
        调用 LLM 的通用接口。
        
        TODO: 根据你的 LLM 提供商替换实现
        """
        self.call_count += 1
        
        # 示例实现：这里应该调用你的 LLM API
        # 
        # 选择你的提供商：
        # 
        # === OpenAI ===
        # from openai import OpenAI
        # client = OpenAI(api_key=self.api_key)
        # response = client.chat.completions.create(...)
        # 
        # === Anthropic ===
        # from anthropic import Anthropic
        # client = Anthropic(api_key=self.api_key)
        # response = client.messages.create(...)
        # 
        # === 本地 Ollama ===
        # import requests
        # response = requests.post("http://localhost:11434/api/generate", ...)
        
        # 为了演示，我们返回模拟响应
        if "search" in system_prompt.lower() or "搜索" in prompt:
            return self._mock_search_response()
        elif "analyze" in system_prompt.lower() or "分析" in prompt:
            return self._mock_analysis_response()
        else:
            return self._mock_synthesis_response()
    
    def _mock_search_response(self) -> str:
        """模拟搜索结果"""
        return """### 搜索结果

1. **人工智能的未来展望** (2024年)
   - 关键词: 深度学习, 转换器, 可扩展性
   - 要点: 模型规模持续增大，但效率改进空间有限

2. **机器学习安全性** (2024年)
   - 关键词: 对抗性样本, 鲁棒性, 验证
   - 要点: 安全性是生产部署的关键考虑

3. **智能体架构设计** (2024年)
   - 关键词: 多代理系统, 协调, 上下文管理
   - 要点: 分布式架构改善了系统扩展性"""
    
    def _mock_analysis_response(self) -> str:
        """模拟分析结果"""
        return """### 分析结果

**核心主题：**
- 人工智能能力的增长与限制的平衡
- 实际应用中的安全性考虑
- 系统架构对性能的影响

**关键趋势：**
1. 从规模增长到效率优化的转变
2. 从单体模型到分布式系统的演进
3. 从理论研究到实际部署的关注

**知识缺口：**
- 长期可持续性的问题
- 资源效率优化的方法"""
    
    def _mock_synthesis_response(self) -> str:
        """模拟综合结果"""
        return """### 研究综合报告

## 摘要
当前人工智能研究正处于从规模导向转向效率和安全导向的转折点。

## 主要发现
1. **技术进步** - 虽然模型规模继续增大，但改进效益在递减
2. **安全关注** - 生产部署越来越重视鲁棒性和安全性
3. **架构创新** - 多代理和分布式系统提供了新的扩展路径

## 建议
- 投资于效率优化而不仅仅是规模增加
- 建立安全评估为标准流程
- 探索分布式和多代理架构

## 结论
未来的 AI 系统将更加重视可靠性、效率和安全性，而不仅仅是性能指标。"""


# ============================================================================
# 第三部分：代理实现
# ============================================================================

class Agent:
    """代理基类"""
    
    def __init__(self, name: str, llm: LLMInterface, agent_type: str = "general"):
        self.name = name
        self.llm = llm
        self.agent_type = agent_type
        self.memory: List[Dict] = []
        self.inbox: List[Message] = []
    
    def add_memory(self, content: str, category: str = "general"):
        """添加内存"""
        self.memory.append({
            "timestamp": datetime.now().isoformat(),
            "category": category,
            "content": content
        })
    
    def receive_message(self, message: Message):
        """接收消息"""
        self.inbox.append(message)
    
    def process_messages(self) -> List[Message]:
        """处理所有收到的消息"""
        responses = []
        for msg in self.inbox:
            response = self._respond_to_message(msg)
            if response:
                responses.append(response)
        self.inbox = []  # 清空收件箱
        return responses
    
    def _respond_to_message(self, message: Message) -> Optional[Message]:
        """响应单个消息"""
        # 子类应该覆盖这个方法
        return None


class SearchAgent(Agent):
    """搜索代理 - 搜索相关信息"""
    
    def __init__(self, name: str, llm: LLMInterface):
        super().__init__(name, llm, "searcher")
        self.search_history = []
    
    def search(self, query: str) -> Dict[str, Any]:
        """执行搜索"""
        print(f"🔍 {self.name} 搜索: {query}")
        
        system_prompt = """You are a research search agent. 
        Your task is to find and summarize relevant information about the given topic.
        Provide structured search results with sources and key findings."""
        
        response = self.llm.call(query, system_prompt=system_prompt)
        
        result = {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "content": response,
            "status": "completed"
        }
        
        self.search_history.append(result)
        self.add_memory(f"搜索了: {query}", category="search")
        
        return result


class AnalysisAgent(Agent):
    """分析代理 - 分析搜索结果"""
    
    def __init__(self, name: str, llm: LLMInterface):
        super().__init__(name, llm, "analyst")
        self.analysis_history = []
    
    def analyze(self, content: str, analysis_type: str = "general") -> Dict[str, Any]:
        """执行分析"""
        print(f"📊 {self.name} 分析: {analysis_type}")
        
        system_prompt = """You are a research analysis agent.
        Your task is to analyze the provided content and extract key insights,
        patterns, and relationships. Provide structured analysis."""
        
        prompt = f"""分析类型: {analysis_type}

内容:
{content}

请提供详细的分析结果。"""
        
        response = self.llm.call(prompt, system_prompt=system_prompt)
        
        result = {
            "analysis_type": analysis_type,
            "timestamp": datetime.now().isoformat(),
            "content": response,
            "status": "completed"
        }
        
        self.analysis_history.append(result)
        self.add_memory(f"分析了: {analysis_type}", category="analysis")
        
        return result


class SynthesisAgent(Agent):
    """综合代理 - 生成综合报告"""
    
    def __init__(self, name: str, llm: LLMInterface):
        super().__init__(name, llm, "synthesizer")
        self.reports = []
    
    def synthesize(self, search_results: Dict, analysis_results: Dict) -> Dict[str, Any]:
        """综合所有结果生成报告"""
        print(f"📝 {self.name} 综合报告")
        
        system_prompt = """You are a research synthesis agent.
        Your task is to combine search results and analysis into a comprehensive report.
        Create a well-structured, coherent research report."""
        
        prompt = f"""请基于以下信息生成综合研究报告:

搜索结果:
{json.dumps(search_results, ensure_ascii=False, indent=2)}

分析结果:
{json.dumps(analysis_results, ensure_ascii=False, indent=2)}

请生成一份完整的研究报告，包括摘要、主要发现、建议和结论。"""
        
        response = self.llm.call(prompt, system_prompt=system_prompt)
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "content": response,
            "status": "completed"
        }
        
        self.reports.append(result)
        self.add_memory("生成了综合报告", category="synthesis")
        
        return result


# ============================================================================
# 第四部分：协调器（监督者模式）
# ============================================================================

class ResearchCoordinator:
    """研究协调器 - 监督者代理"""
    
    def __init__(self, llm: LLMInterface):
        self.llm = llm
        self.search_agent = SearchAgent("SearchAgent", llm)
        self.analysis_agent = AnalysisAgent("AnalysisAgent", llm)
        self.synthesis_agent = SynthesisAgent("SynthesisAgent", llm)
        
        self.task_history: List[Task] = []
        self.results_history: List[ResearchResult] = []
    
    def decompose_task(self, topic: str) -> List[Task]:
        """将研究话题分解为子任务"""
        print(f"\n📋 分解任务: {topic}")
        
        tasks = [
            Task(
                id="search_001",
                title="搜索相关信息",
                description=f"搜索关于 {topic} 的相关信息",
                task_type="search"
            ),
            Task(
                id="analyze_001",
                title="分析搜索结果",
                description=f"分析搜索结果中的模式和趋势",
                task_type="analyze"
            ),
            Task(
                id="synthesize_001",
                title="生成综合报告",
                description=f"综合所有信息生成最终报告",
                task_type="synthesize"
            )
        ]
        
        self.task_history.extend(tasks)
        return tasks
    
    def execute_task(self, task: Task, context: Dict = None) -> Task:
        """执行单个任务"""
        task.status = "in_progress"
        print(f"  ▶️  执行: {task.title}")
        
        try:
            if task.task_type == "search":
                task.result = self.search_agent.search(task.description)
            elif task.task_type == "analyze":
                search_results = context.get("search_results", "")
                task.result = self.analysis_agent.analyze(search_results)
            elif task.task_type == "synthesize":
                task.result = self.synthesis_agent.synthesize(
                    context.get("search_results", {}),
                    context.get("analysis_results", {})
                )
            
            task.status = "completed"
            task.completed_at = datetime.now()
            
        except Exception as e:
            task.status = "failed"
            task.error = str(e)
            print(f"    ❌ 错误: {e}")
        
        return task
    
    def research(self, topic: str) -> ResearchResult:
        """执行完整的研究流程"""
        print(f"\n{'='*60}")
        print(f"🚀 开始研究: {topic}")
        print(f"{'='*60}")
        
        # 第一步：分解任务
        tasks = self.decompose_task(topic)
        
        # 第二步：按顺序执行任务
        context = {"topic": topic}
        
        for task in tasks:
            task = self.execute_task(task, context)
            
            # 将结果存储到上下文中供后续任务使用
            if task.status == "completed":
                if task.task_type == "search":
                    context["search_results"] = task.result
                elif task.task_type == "analyze":
                    context["analysis_results"] = task.result
        
        # 第三步：生成最终结果对象
        result = ResearchResult(
            topic=topic,
            search_results=[context.get("search_results", {})],
            analysis=context.get("analysis_results", {}),
            synthesis=tasks[-1].result if len(tasks) > 2 else {},
            metadata={
                "total_tasks": len(tasks),
                "completed_tasks": sum(1 for t in tasks if t.status == "completed"),
                "timestamp": datetime.now().isoformat(),
                "llm_calls": self.llm.call_count
            }
        )
        
        self.results_history.append(result)
        
        return result
    
    def save_results(self, result: ResearchResult, output_dir: str = "./research_output"):
        """保存研究结果"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # 生成文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"research_{timestamp}.json"
        filepath = output_path / filename
        
        # 转换为可序列化的格式
        result_dict = {
            "topic": result.topic,
            "search_results": result.search_results,
            "analysis": result.analysis,
            "synthesis": result.synthesis,
            "metadata": result.metadata
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(result_dict, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 结果已保存到: {filepath}")
        
        return filepath
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        total_tasks = len(self.task_history)
        completed = sum(1 for t in self.task_history if t.status == "completed")
        failed = sum(1 for t in self.task_history if t.status == "failed")
        
        return {
            "total_researches": len(self.results_history),
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "failed_tasks": failed,
            "success_rate": f"{(completed/max(1, total_tasks)*100):.1f}%",
            "llm_calls": self.llm.call_count,
            "search_agent_memories": len(self.search_agent.memory),
            "analysis_agent_memories": len(self.analysis_agent.memory),
            "synthesis_agent_memories": len(self.synthesis_agent.memory)
        }


# ============================================================================
# 第五部分：主程序
# ============================================================================

def main():
    """主程序"""
    
    print("""
╔════════════════════════════════════════════════════════════════╗
║     智能研究助手系统 - Agent Skills 实战示例                   ║
║                                                                ║
║  演示如何独立构建多代理系统，不依赖 Claude 或 Cursor         ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    # 初始化 LLM（使用默认 API key，生产环境应该用环保变量）
    llm = LLMInterface(
        api_key="your-api-key-here",
        model="default"
    )
    
    # 创建协调器
    coordinator = ResearchCoordinator(llm)
    
    # 执行研究任务
    research_topics = [
        "人工智能的未来发展方向",
        "多代理系统的架构模式",
    ]
    
    for topic in research_topics:
        try:
            # 执行研究
            result = coordinator.research(topic)
            
            # 保存结果
            coordinator.save_results(result)
            
            # 显示综合报告
            print(f"\n📄 研究报告摘要:")
            print("─" * 60)
            if result.synthesis:
                print(result.synthesis.get("content", "N/A")[:500] + "...")
            print("─" * 60)
            
        except Exception as e:
            print(f"❌ 研究失败: {e}")
    
    # 显示统计信息
    print(f"\n📊 系统统计:")
    print("─" * 60)
    stats = coordinator.get_statistics()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    print("─" * 60)
    
    print(f"\n✨ 研究完成！")


if __name__ == "__main__":
    main()

