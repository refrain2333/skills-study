# 智能体工具设计 (Tool Design for Agents)

设计智能体可以有效使用的工具，包括何时减少工具复杂性。

## 概述

此技能涵盖了设计工具接口的原则和模式，使语言模型智能体能够发现、理解并正确使用这些接口。与专为开发人员设计的传统 API 不同，智能体工具必须考虑模型如何推理意图并从自然语言中生成调用。

此技能包括增量式指导（如何设计好的工具）和减量式指导（何时减少工具数量优于复杂的架构）。

## 内容

```
tool-design/
├── SKILL.md                              # 主要技能指令
├── SKILL_zh.md                           # 主要技能指令 (中文)
├── README.md                             # 本文件
├── references/
│   ├── best_practices.md                 # 详细的设计指南
│   ├── best_practices_zh.md              # 详细的设计指南 (中文)
│   ├── architectural_reduction.md        # 关于工具极简主义的案例研究
│   └── architectural_reduction_zh.md     # 关于工具极简主义的案例研究 (中文)
└── scripts/
    └── description_generator.py          # 工具描述实用程序
```

## 核心概念

### 合并原则 (The Consolidation Principle)

如果人类工程师无法明确说明在特定情况下应该使用哪个工具，那么就不能指望智能体做得更好。倾向于使用单一的综合工具，而不是多个功能重叠的狭窄工具。

### 架构精简 (Architectural Reduction)

将合并原则推向逻辑极致。生产实践证明，从 17 个专用工具减少到 2 个原始工具（Bash 命令执行 + SQL）实现了：

- 执行速度快 3.5 倍
- Token 消耗减少 37%
- 成功率达 100%（从 80% 提升）

文件系统智能体模式使用标准 Unix 实用程序（grep、cat、find、ls）来代替自定义探索工具。

### 工具描述工程 (Tool Description Engineering)

工具描述是塑造智能体行为的提示词工程。有效的描述回答：

1. 该工具做什么？
2. 何时应该使用？
3. 它接受什么输入？
4. 它返回什么？

## 何时使用此技能

- 为智能体系统创建新工具
- 调试与工具相关的故障
- 优化现有工具集
- 评估是否增加或移除工具
- 标准化工具约定

## 快速参考

### 良好的工具设计

```python
def get_customer(customer_id: str, format: str = "concise"):
    """
    通过 ID 检索客户信息。
    
    使用场景:
    - 用户询问特定客户详情
    - 决策需要客户上下文
    
    参数:
        customer_id: 格式为 "CUST-######" (例如 "CUST-000001")
        format: "concise" 返回关键字段，"detailed" 返回完整记录
    
    返回:
        带有请求字段的客户对象
    
    错误:
        NOT_FOUND: 找不到客户 ID
        INVALID_FORMAT: ID 必须符合 CUST-###### 模式
    """
```

### 糟糕的工具设计

```python
def search(query):
    """搜索数据库。"""
    pass
```

问题：名称模糊、缺失参数、没有返回描述、没有使用上下文、没有错误处理。

## 指南

1. 编写回答“是什么”、“何时用”和“返回什么”的描述
2. 使用合并来减少歧义
3. 实现响应格式选项以提高 Token 效率
4. 为智能体恢复设计错误消息
5. 质疑每个工具是赋能还是约束模型
6. 倾向于使用原始、通用的工具，而不是专用的包装器
7. 在文档质量上投入，而不是工具的复杂性
8. 构建可从模型改进中受益的极简架构

## 相关技能

- `context-fundamentals` - 工具如何与上下文互动
- `multi-agent-patterns` - 每个智能体的专用工具
- `evaluation` - 评估工具的有效性

## 参考资料

- [SKILL.md](./SKILL.md) - 完整技能指令
- [最佳实践](./references/best_practices.md) - 详细指南
- [架构精简案例研究](./references/architectural_reduction.md) - 生产证据

## 版本信息

- **创建日期**: 2025-12-20
- **上次更新**: 2025-12-23
- **版本**: 1.1.0

