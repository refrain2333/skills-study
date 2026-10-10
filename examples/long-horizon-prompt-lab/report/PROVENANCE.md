# 周期双重覆盖报告来源记录

本示例以 OpenAI 发布的周期双重覆盖猜想提示词和候选证明为案例。该案例由 GPT-5.6 Sol Ultra 使用 64 个子智能体编排生成。

## 文件清单

| 文件 | 来源 | 字节数 | SHA-256 |
| --- | --- | ---: | --- |
| `cdc_prompt.pdf` | https://cdn.openai.com/pdf/04d1d1e4-bc75-476a-97cf-49055cd98d31/cdc_prompt.pdf | 123015 | `0e48deee28caba82ee5b4191d4c5c6ec4d62e5d27890fa7f0d2c8868f8b758f3` |
| `cdc_proof.pdf` | https://cdn.openai.com/pdf/04d1d1e4-bc75-476a-97cf-49055cd98d31/cdc_proof.pdf | 325198 | `b4797f5053d9067329b3dcfcbf913f8bb40d13467453b1300f6d78d08460fc13` |

`cdc_prompt.txt` 和 `cdc_proof.txt` 是使用 pypdf 提取的文本，便于搜索和差异比较；PDF 才是权威原件。

## 获取记录

- 本次获取日期：2026-07-11，使用 `scripts/fetch_report.sh`。
- 两份 PDF 的内部 `CreationDate` 均为 `D:20260710`，与 2026-07-10 的公开日期一致。
- 两份文件均由 `pdfTeX-1.40.28` 和 `LaTeX with hyperref` 生成。
- 提示词 PDF 共 2 页；证明 PDF 共 3 页。

## 与仓库技能引用的核对

`scripts/verify_report.py` 会重新提取提示词，并确认 `skills/long-horizon-prompting/references/cdc-prompt-annotated.md` 中的每段引用都能在公开提示词中逐字找到。获取时结果为 0 段偏差，说明技能注释忠实反映一手来源，而非改写内容。

## 限制（应始终保留）

- 候选证明发布时没有独立同行评审、Lean/Coq 形式化，也没有 arXiv 发布。已核验的对象是提示词结构，不是定理。
- 没有公开消融实验能区分哪些提示词要素对结果有贡献。技能中逐项机制的证据来自独立学术研究，不是这一次运行。
- 证明对 AI 使用的原始声明称：“本笔记中的证明完全由 GPT 5.6 Sol Ultra 完成，之后使用 GPT 5.6 Sol 和 Codex 整理成文。”
