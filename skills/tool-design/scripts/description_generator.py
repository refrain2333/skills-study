"""
工具描述工程 (Tool Description Engineering)

此模块提供用于生成和评估工具描述的实用程序。
"""

from typing import Dict, List, Any
import re


# 描述模板 (Description Templates)

TOOL_DESCRIPTION_TEMPLATE = """
## {tool_name}

{detailed_description}

### 何时使用 (When to Use)
{usage_context}

### 参数 (Parameters)
{parameters_description}

### 返回 (Returns)
{returns_description}

### 错误 (Errors)
{errors_description}
"""

PARAM_TEMPLATE = """
- **{param_name}** ({param_type}{" | 必填" if required else " | 可选"})
  
  {param_description}
  {"默认值: " + default if default else ""}
"""


# 示例生成 (Example Generation)

def generate_tool_description(tool_spec):
    """从规范生成完整的工具描述。"""
    description = TOOL_DESCRIPTION_TEMPLATE.format(
        tool_name=tool_spec.name,
        detailed_description=tool_spec.description,
        usage_context=generate_usage_context(tool_spec),
        parameters_description=generate_parameters(tool_spec.parameters),
        returns_description=generate_returns(tool_spec.returns),
        errors_description=generate_errors(tool_spec.errors)
    )
    return description


def generate_usage_context(tool_spec):
    """生成使用上下文部分。"""
    contexts = []
    
    for trigger in tool_spec.triggers:
        contexts.append(f"- 当 {trigger} 时")
    
    if tool_spec.examples:
        contexts.append("\n**示例 (Examples)**:\n")
        for example in tool_spec.examples:
            contexts.append(f"- 输入: {example.input}")
            contexts.append(f"  输出: {example.tool_call}")
    
    return "\n".join(contexts)


# 描述评估 (Description Evaluation)

class ToolDescriptionEvaluator:
    """工具描述评估器，用于根据预定义标准检查描述质量。"""
    def __init__(self):
        self.criteria = [
            "clarity",       # 清晰度
            "completeness",  # 完整性
            "accuracy",      # 准确性
            "actionability", # 可操作性
            "consistency"    # 一致性
        ]
    
    def evaluate(self, description: str, tool_spec) -> Dict:
        """根据标准评估描述。"""
        results = {}
        
        # 检查清晰度
        results["clarity"] = self._check_clarity(description)
        
        # 检查完整性
        results["completeness"] = self._check_completeness(description, tool_spec)
        
        # 检查准确性
        results["accuracy"] = self._check_accuracy(description, tool_spec)
        
        # 检查可操作性
        results["actionability"] = self._check_actionability(description)
        
        # 检查一致性
        results["consistency"] = self._check_consistency(description, tool_spec)
        
        return results
    
    def _check_clarity(self, description: str) -> float:
        """检查描述清晰度 (0-1 分)。"""
        # 检查模糊词汇
        vague_terms = ["help", "assist", "thing", "stuff", "handle", "帮助", "协助", "处理"]
        vague_count = sum(1 for term in vague_terms if term in description.lower())
        
        # 检查歧义引用
        ambiguous = ["it", "this", "that", "它", "这个", "那个"]  # 且没有明确的前置指代
        ambiguous_count = sum(1 for term in ambiguous if f" {term} " in description)
        
        # 计算清晰度得分
        clarity = 1.0 - (vague_count * 0.1) - (ambiguous_count * 0.05)
        return max(0, clarity)
    
    def _check_completeness(self, description: str, tool_spec) -> float:
        """检查所有必需元素是否存在。"""
        required_sections = [
            ("description", r"## " + tool_spec.name),
            ("parameters", r"### (Parameters|参数)"),
            ("returns", r"### (Returns|返回)"),
            ("errors", r"### (Errors|错误)")
        ]
        
        present = sum(1 for _, pattern in required_sections 
                      if re.search(pattern, description))
        
        return present / len(required_sections)


# 错误消息模板 (Error Message Templates)

class ErrorMessageGenerator:
    """错误消息生成器，用于创建一致且可操作的错误响应。"""
    TEMPLATES = {
        "NOT_FOUND": """
        {{
            "error": "{error_code}",
            "message": "{specific_message}",
            "resolution": "{how_to_resolve}",
            "example": "{correct_format}"
        }}
        """,
        
        "INVALID_INPUT": """
        {{
            "error": "{error_code}",
            "message": "无效的 {field}: {received_value}",
            "expected_format": "{expected_format}",
            "resolution": "提供符合 {expected_format} 的值"
        }}
        """,
        
        "RATE_LIMITED": """
        {{
            "error": "{error_code}",
            "message": "已超过速率限制",
            "retry_after": {seconds},
            "resolution": "等待 {seconds} 秒后重试"
        }}
        """
    }
    
    def generate(self, error_type: str, context: Dict) -> str:
        """从模板生成错误消息。"""
        template = self.TEMPLATES.get(error_type, self.TEMPLATES["INVALID_INPUT"])
        return template.format(**context)


# 工具 Schema 生成器 (Tool Schema Generator)

class ToolSchemaBuilder:
    """用于构建一致的工具定义 Schema 的构建器。"""
    def __init__(self, name: str):
        self.name = name
        self.description = ""
        self.detailed_description = ""
        self.parameters = []
        self.returns = None
        self.errors = []
    
    def set_description(self, short: str, detailed: str):
        """设置描述部分。"""
        self.description = short
        self.detailed_description = detailed
        return self
    
    def add_parameter(self, name: str, param_type: str, description: str,
                      required: bool = False, default=None, enum=None):
        """添加参数定义。"""
        self.parameters.append({
            "name": name,
            "type": param_type,
            "description": description,
            "required": required,
            "default": default,
            "enum": enum
        })
        return self
    
    def set_returns(self, return_type: str, description: str, properties: Dict):
        """设置返回值定义。"""
        self.returns = {
            "type": return_type,
            "description": description,
            "properties": properties
        }
        return self
    
    def add_error(self, code: str, description: str, resolution: str):
        """添加错误定义。"""
        self.errors.append({
            "code": code,
            "description": description,
            "resolution": resolution
        })
        return self
    
    def build(self) -> Dict:
        """构建完整的 Schema。"""
        return {
            "name": self.name,
            "description": self.description,
            "detailed_description": self.detailed_description,
            "parameters": {
                "type": "object",
                "properties": {
                    p["name"]: {
                        "type": p["type"],
                        "description": p["description"]
                    }
                    for p in self.parameters
                },
                "required": [p["name"] for p in self.parameters if p["required"]]
            },
            "returns": self.returns,
            "errors": self.errors
        }
