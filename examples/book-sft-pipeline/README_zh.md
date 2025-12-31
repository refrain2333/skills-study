# 书籍 SFT 管道

一个用于训练语言模型以任何作者风格写作的独立技能。这是主上下文工程集合中的**独立插件**。

## 安装

### Claude Code

```bash
# 先添加市场
/plugin marketplace add muratcankoylan/Agent-Skills-for-Context-Engineering

# 安装 book-sft-pipeline 插件
/plugin install book-sft-pipeline@context-engineering-marketplace
```

### Cursor / Codex / IDE

将 `SKILL.md` 复制到你的 `.rules` 或项目技能文件夹中。

### 手动

直接在你的代理上下文中引用 `SKILL.md` 文件。

## 包含内容

```
book-sft-pipeline/
├── README.md                 # 本文件
├── SKILL.md                  # 完整技能文档（独立）
├── examples/
│   └── gertrude-stein/       # 完整案例研究，包含真实输出
│       ├── README.md         # 结果和分析
│       ├── sample_outputs.md # 原始模型输出
│       ├── training_config.json
│       ├── dataset_sample.jsonl
│       └── pangram/          # AI 检测器截图
├── scripts/
│   └── pipeline_example.py   # 概念实现
└── references/
    ├── segmentation-strategies.md
    ├── tinker-format.md
    └── tinker.txt
```

## 关键结果

在格特鲁德·斯坦因的《三个女人》（1909 年）上训练 Qwen3-8B-Base：

| 指标 | 数值 |
|--------|-------|
| 训练样本数 | 592 |
| 损失降低 | 97% |
| Pangram AI 检测器 | 70% 人类 |
| 训练时间 | 15 分钟 |
| 总成本 | $2 |

## 相关上下文工程技能

本技能应用了[代理上下文工程技能](../../README.md)集合中的模式：

| 技能 | 应用 |
|-------|-------------|
| [project-development](../../skills/project-development/) | 分阶段管道架构 |
| [context-compression](../../skills/context-compression/) | 分段策略 |
| [multi-agent-patterns](../../skills/multi-agent-patterns/) | 协调器模式 |
| [evaluation](../../skills/evaluation/) | 现代场景测试 |
| [context-fundamentals](../../skills/context-fundamentals/) | 提示多样性 |

## 资源

- [Hugging Face 上的数据集](https://huggingface.co/datasets/MuratcanKoylan/gertrude-stein-style-sft)
- [研究论文](https://arxiv.org/pdf/2510.13939)（Chakrabarty et al. 2025）

## 许可证

MIT

