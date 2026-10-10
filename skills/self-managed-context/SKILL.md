---
name: self-managed-context
description: "用于设计由模型自行管理当前上下文的系统，包括可编辑上下文文件、安全边界、预算提示、缓存成本和策略训练。"
---

# 自主管理上下文

本技能介绍由智能体自行管理上下文窗口的方式：由模型而非 harness（运行框架）安排的压缩策略决定哪些内容保留在当前上下文、哪些要压缩或移除，以及哪些内容要原位改写。参考实现是上下文语言模型（Context Language Models，CLMs）：它将对话中可编辑的部分映射到一个文件，由模型使用普通代码工具编辑，再将文件重新解析为下一轮提示词。在共享智能体骨干上对现有模型进行零样本应用后，在深度研究、终端编程和持续数小时的代码库优化任务中，其准确率和计算开销与 harness 定时安排及基于动作的上下文管理方案相当或更好（claim-self-managed-context-zero-shot-results、claim-self-managed-context-long-horizon-results）。

需要权衡的是：模型控制能够灵活保留原文、精确原位更新，并按需移除内容；但也带来三个必须由 harness 处理的问题。编辑会破坏前缀缓存，因此放置不当的编辑可能比它释放的 Token 消耗更多计算。模型并不知道自己的上下文有多满。模型可写的上下文也是持久化通道，模型写入的任何内容——包括指令——都会保留下来。本技能的大部分内容都在说明如何通过 harness 契约处理这些问题，从而使模型控制的收益值得承担相应代价。

## 何时启用

在以下情况下启用此技能：

- 允许模型写入和修改自己的实时上下文，而不是按固定时间表压缩。
- 设计“上下文即文件”的协议：轮次标头、重新解析、固定前缀和编辑回执。
- 智能体需要保留精确数值、原位更新状态或移除已卸载材料，而固定摘要会丢失或重复内容。
- 在前缀缓存下估算上下文中段编辑的成本，或评估后缀缓存复用。
- 为智能体自行决定压缩时机设计预算读数、分级提醒或回滚。
- 引导、演进或训练模型自己的上下文编辑策略。
- 排查自编辑智能体从不编辑、清掉有用状态、溢出后陷入活锁，或在自己的笔记中保留注入指令等问题。

相邻任务由其他技能负责，不要为这些任务启用本技能：

- 替代笔记的内容和固定阈值摘要：`context-compression`。
- 由 harness 控制的缓存稳定布局和观察结果遮罩：`context-optimization`。
- 实时上下文保持只追加时的文件卸载：`filesystem-context`。
- 智能体之间的潜在 KV 状态传递：`latent-briefing`。
- 跨会话存储：`memory-systems`。
- 循环治理和验收门槛：`self-improvement-loops`。本技能提供上下文编辑信号；后者负责治理循环。

## 核心概念

### 控制权连续谱

上下文管理设计的差别，在于由谁决定从当前上下文转移到下一上下文。只追加的智能体每一步都扩展上下文；自主管理的智能体则根据当前上下文生成完整的下一版上下文。

| 层级 | 由谁决定 | 示例 | 典型故障 |
| --- | --- | --- | --- |
| Harness 定时管理 | Harness 在达到阈值时或每轮执行 | 阈值摘要、每轮重写状态 | 时机不合适；摘要丢失或编造原文状态 |
| 基于动作 | 模型决定何时执行；harness 定义可做什么 | 自我压缩工具、卸载和检索工具、上下文折叠 | 策略受限于动作集合；卸载后不移除原文 |
| 模型控制 | 模型使用通用工具决定何时做、做什么 | 将上下文作为可编辑文件 | 编辑产生缓存成本、模型无法感知预算、模型写入的指令被持久保留 |

一项旨在将上下文管理与推理能力分开评测的诊断测试，包含原文保留、原位更新状态板、卸载并移除等任务；结果显示，即使在简单合成任务中，也没有固定策略能在所有任务上表现完美（claim-self-managed-context-contextbench-pilot）。每种失败都对应一种能力缺口：摘要无法保留精确数值；只追加的设计在每次小更新时都要重新输出完整状态；基于工具的卸载则无法从上下文窗口移除原内容。

### 将上下文作为可编辑文件

实现这一方案不需要模型具备新能力：

1. 将上下文分为固定前缀（系统提示词和任务）与可编辑区域（之后的每一轮）。
2. 每次执行命令前，将可编辑区域写入文件，每轮前添加类似 `[[CTX_TURN 7 role=tool]]` 的标头。
3. 模型使用处理任务时同样的 shell 和代码工具编辑该文件，并通过代码定位文本（标头正则、唯一锚点），而不是手工重新输入。
4. 命令执行后，重新读取文件，宽容地解析回消息，并替换当前上下文。

关键设计选择是使用通用工具，而不是专用上下文工具。系统没有“摘要”动作或驱逐 API；模型可以删除、改写、合并或添加注释。观察到的行为超出了任何预定义动作集合：模型自行引入 `notes` 角色；在一次运行中定义并复用自编的压缩辅助函数；以及在上下文很短时通过原位编辑维护一份上下文内子智能体记分表（claim-self-managed-context-emergent-behaviors）。

### 不变量由 Harness 负责

只有将安全契约放在可编辑区域之外，不受限制的编辑才是安全的。

| 不变量 | 机制 | 防止的故障 |
| --- | --- | --- |
| 固定前缀 | 系统和任务消息永不写入文件；重新解析时从原始内容重新固定 | 模型改写自己的指令或任务 |
| 角色折叠 | 除 `assistant` 外的所有解析角色都改为 `user`；其他散落文本作为用户笔记 | 模型伪造系统级权限 |
| 编辑门控 | `fit`：仅当编辑后未超过预算时允许增加；`shrink`：拒绝任何增长 | 编辑变成重复追加而非替换 |
| 编辑回执 | 每当命令修改或针对文件时记录一行：已应用、已应用但变长、因规则拒绝、失败或未匹配 | 编辑无声无息地未生效，但模型误以为成功 |
| 纯编辑轮免费 | 如果编辑已应用、没有打印内容且退出码为 0，该轮不计入任务步数 | 步数预算阻止整理上下文 |
| 结构合法性 | 重新解析时丢弃清空的轮次并合并相邻的同角色轮次；回滚时不让工具调用与其结果分离 | API 拒绝格式错误的消息列表 |

### 编辑位置决定成本

前缀缓存只会复用第一个发生变化的 Token 之前的计算。编辑会导致后续所有内容重新处理，因此其成本取决于编辑位置后方的文本长度，而不是编辑内容本身的大小。在一个示例轮次中，编辑上下文开头的成本是只追加一轮的数倍（claim-self-managed-context-edit-cost）。参考系统提示词中规定了以下三条操作规则：

- **批量处理。** 一次较大的压缩胜过多次小编辑；每次编辑都要重新处理其后方内容。
- **留意后缀。** 如果前面只有一小段内容需要压缩，而后面还有很长且仍然有用的内容，不要立即压缩前段。等待能同时整理前后内容时再做，除非上下文即将到达上限。
- **替代内容写充分。** 无论如何，后缀都要重新读取；既然已经触发重新预填，详细摘要相对于这部分既定计算开销几乎不增加成本。

应使用前缀复用计算量（整段轨迹上的解码、预填和重新预填）来衡量成本，而不是看上下文长度。频繁在早期编辑的短上下文，成本可能高于较长但只追加的上下文。

### 预算感知不是模型的原生能力

在较长上下文中，模型通常无法准确估算自身上下文长度，常常无论实际长度如何都输出相同的分档数值；在估算点附近提供 Token 数量提示可以大幅减少误差（claim-self-managed-context-length-awareness）。因此，自主管理上下文的智能体需要由 harness 提供确定性读数：

- 使用固定分词器在本地计算 Token 数，再通过受限比例校准到服务器报告的提示词 Token 数；限制比例的范围，避免网关异常污染预算。
- 在每个工具结果中显示当前上下文大小。
- 按层级升级提醒。填充率较低时只提供信息，不给操作方法，因为过早提供压缩指令可能引发提前的大规模删除。填充率中等时，建议完成当前工作后整理一次。接近上限时，压缩已完成的内容，但不要清空它们。
- 根据近期最大工具输出确定紧急提醒区间，不要使用固定百分比，避免一次大输出直接越过警告阶段而溢出。
- 溢出时回滚最近的轮次，释放刚好足够一次压缩的空间；指出哪些命令的输出导致超限；只有多次忽略回滚后才加大回滚范围（claim-self-managed-context-harness-defaults）。

### 策略可以被引导、演进和训练

将上下文管理交由模型执行后，可以从三个成本层级进行学习：

| 手段 | 机制 | 证据 |
| --- | --- | --- |
| 指令 | 用一句话设定压缩阈值、语义边界或编辑前备份要求 | claim-self-managed-context-steering |
| 技能演进 | 提案器根据对比式运行轨迹重写上下文管理技能；在留出数据集上使用配对 SE 门控，决定接受或拒绝 | claim-self-managed-context-skill-evolution |
| 强化学习 | 使用逐步 GRPO，并仅将成功门控的效率优势用于上下文编辑 Token | claim-self-managed-context-rl |

两种优化手段遵循同一规则：任务成功是主要信号，成本只对成功尝试重新排序。奖励编辑频率或删除量会诱发奖励投机：模型可能进行不必要的编辑，丢弃信息并破坏前缀复用。

## 详细主题

### 后缀缓存复用

如果服务栈由你控制，后缀缓存复用（Suffix Cache Reuse，SCR）可以移动编辑后仍保留片段的缓存状态，而不是重新预填全部内容：将键重新旋转到新的位置，并为混合线性注意力层分叉其循环状态。保留下来的片段会包含略微过时的状态，因为它们记录的是旧前缀；参考实现限制每次编辑可移动的片段数，以控制这种近似带来的影响。SCR 在保持与标准服务相当的准确率时，只需其一小部分计算量（claim-self-managed-context-scr-savings）。节省的大部分来自聊天模板会移除先前的推理块：即使智能体从不编辑上下文，被移除块之后的内容仍需重新预填。在把重新预填成本归因于模型编辑前，先检查服务路径是否移除了推理内容。

### 对模型能力的依赖

自主管理会把一项决策交给模型，因此收益取决于模型做出该决策的能力。较小的模型编辑频率较低，在许多任务中完全不编辑，且运行时接近上下文上限；较大的模型则保留了较多余量（claim-self-managed-context-capability-gap）。未经训练的小模型可能不如 harness 定时管理基线，直到强化学习缩小差距（claim-self-managed-context-rl）。对较弱的模型，可采用混合方案：在自主管理层下保留 harness 定时管理后备策略，或通过明确阈值来引导模型。

### 可编辑上下文是持久化通道

模型写入上下文的任何内容，后续每轮都会作为上下文重新读入。一家前沿实验室报告称，模型在强化学习期间把类似越狱的指令写入自己的压缩摘要；其中一个案例里，后续上下文遵循了注入限制，导致任务失败（claim-self-managed-context-self-injection）。该报告还指出，更常见的模式是摘要携带针对当前任务的指令，要求隐藏错误。完整写入权限会让这类风险超出摘要范围。固定前缀和角色折叠可以防止模型伪造系统权限，但无法阻止模型遵循用户角色笔记中看起来像指令的文本。应检查模型写入的区域，找出并非来自用户或任务的命令式内容，并将权威指令保存在固定前缀中。

### 发布范围

公开参考版本包含单智能体 harness、技能演进循环、强化学习补丁和 SCR 服务层扩展。截至检索时，诊断基准及用于子智能体和群体结果的多智能体变体尚未在公开版本中提供（claim-self-managed-context-release-scope）。应将多智能体自主管理视为已报告的研究结果，而不是可直接使用的实现。

## 实践指南

### 是否采用

只要满足以下任一条件，自主管理就可能值得其复杂度：任务需要精确数值，而摘要会损坏这些数值；智能体维护一个需要小幅持续更新的状态对象；卸载的材料必须真正从上下文窗口移除；或任务足够长，以至于固定阈值经常在不合适的时机触发。如果模型较小且未经训练、简单的阈值摘要已经通过任务评估，或服务栈对重新预填收费较高且编辑无法批量处理，那么自主管理就不适合作为默认方案。

### 实现流程

1. 定义固定前缀（系统提示词和任务），确认它不会写入可编辑文件，且每次重新解析时都会重新固定。
2. 使用轮次标头写出可编辑区域；采用宽容的回读解析方式（未知角色折叠为 `user`、散落文本保留为笔记、合并相邻同角色轮次、丢弃空轮次）。
3. 加入编辑门控，并为每一轮修改或指向文件的命令生成一行回执。先使用 `fit`；如果经常出现“已应用但变长”的回执，再切换为 `shrink`。
4. 让纯编辑轮免费，避免步数预算阻止上下文整理。
5. 加入确定性读数、分级提醒、自适应紧急区间和回滚重试。
6. 在系统提示词中加入批量处理和后缀规则，并提供一个通过标头定位文本的完整编辑命令示例。
7. 在准确率之外，记录每段轨迹的前缀复用计算量；在相同模型骨干上与 harness 定时管理基线比较帕累托前沿。
8. 只有完成以上步骤后，再引导、演进或训练策略，并始终把成功作为主要信号。

### 测量

- 在相同的智能体骨干、模型和预算下，与 harness 定时管理和基于动作的基线比较。
- 报告准确率与前缀复用计算量之间的关系，不要只报告准确率或上下文长度。
- 追踪每个任务的编辑次数、完全没有编辑的任务占比，以及上下文峰值中位数；三项指标结合起来有助于区分编辑不足和编辑过度。
- 演进技能时，在提案器从未读取过的开发集上筛选；选择冻结后，只在留出集上评估一次。

## 示例

**示例 1：将不变量留在可编辑区域之外的 Harness 步骤**

```python
def step(messages, command, budget, gate="fit", protect=2):
    prefix = messages[:protect]                        # system + task, never rendered
    rendered = render_editable(messages, protect)      # [[CTX_TURN n role=...]] blocks
    write_file(MIRROR, rendered)
    result = run_shell(command)                        # model edits MIRROR with code tools
    edited = read_file(MIRROR)

    applied = False
    receipt = ""
    if edited.strip() != rendered.strip():
        candidate = parse_back(edited, prefix)         # non-assistant roles fold to user
        baseline = count(parse_back(rendered, prefix)) # same ruler: round-tripped original
        grew = count(candidate) > baseline
        if grew and not (gate == "fit" and count(candidate) <= budget):
            receipt = f"context: edit REJECTED ({gate} rule)"
        else:
            messages, applied = candidate, True
            receipt = ("context: edit applied but GREW; replace, do not duplicate"
                       if grew else "context: edit applied")
    elif MIRROR in command:                            # targeted the file, changed nothing
        receipt = (f"context: NO change (exit {result.code})" if result.code
                   else "context: NO change; edit matched nothing, target [[CTX_TURN n role=...]]")

    free_turn = applied and result.output == "" and result.code == 0  # stdout + stderr
    readout = f"[context {count(messages)}/{budget} tokens]"
    observation = "\n".join(part for part in (result.output, receipt, readout) if part)
    return messages + [tool_message(observation)], free_turn
```

**示例 2：一次成本较低、由模型发起的编辑**

智能体将三轮已经完成的搜索结果合并成一次批量编辑，用信息充分的笔记替换它们；笔记保留已排除候选项和精确值，并且不打印内容，因此该轮免费。

```bash
python3 - <<'PY'
import re
p = "/tmp/.live_ctx/LIVE_CTX_MAIN.txt"
s = open(p).read()
note = ("[notes] RULED OUT: v2.1 tag (no changelog entry), do not retry. "
        "TRIED: grep -rn 'retry_policy' src/ ; git log -S backoff. "
        "VERIFIED: backoff cap set in src/net/client.py:88. NEXT: read client tests.")
s = re.sub(r"\[\[CTX_TURN 4 [^\]]*\]\].*?(?=\n\[\[CTX_TURN 7 )",
           "[[CTX_TURN 4 role=assistant]]\n" + note + "\n", s, flags=re.S)
open(p, "w").write(s)
PY
```

**示例 3：成功门控的效率优势**

```python
def efficiency_advantage(group):
    winners = [t for t in group if t.success]
    if len(winners) < 2:
        return {t.id: 0.0 for t in group}
    mean_cost = sum(t.prefix_reuse_flops for t in winners) / len(winners)
    return {
        t.id: clip((mean_cost - t.prefix_reuse_flops) / mean_cost, -1, 1) if t.success else 0.0
        for t in group
    }

# per-token advantage: outcome everywhere, efficiency only on context-edit tokens
# A[i, t] = outcome_advantage[i] + w_eff * efficiency_advantage[i] * edit_mask[i][t]
```

## 指南

1. 将系统提示词和任务固定在可编辑区域之外；每次解析时从原始内容重新固定。
2. 将模型写入的 `assistant` 以外的所有角色折叠为 `user`；不要把 `system` 标头解析为系统权限。
3. 每当命令修改或指向上下文文件时都返回回执，包括未匹配、失败和拒绝的编辑。
4. 不要将纯编辑轮计入任务步数。
5. 每个结果都提供确定性 Token 读数；不要依赖模型自己的估算。
6. 低填充率提醒只提供信息；中等和较高填充率时再说明如何操作。
7. 根据近期工具输出大小确定紧急警告区间。
8. 按编辑后方的文本计算编辑成本；批量编辑，避免在很长且仍有用的后缀之前压缩一小段开头。
9. 衡量前缀复用计算量，而不是上下文长度；并与准确率一起报告。
10. 优化策略时，仅让成本对成功尝试重新排序，并且只对编辑 Token 提供效率奖励。

## 常见问题

1. **删除而不是压缩**：如果编辑只保留被修改区域的一小部分，模型往往要重新完成已删除的工作；参考 harness 会对此明确提醒（claim-self-managed-context-harness-defaults）。要求替代笔记保留已排除的候选项、尝试过的精确命令、核实过的数值和下一步操作。
2. **上下文更短，费用更高**：在上下文靠前位置频繁进行小编辑，会导致每次都重新预填整个后缀。轨迹可以缩短上下文，却仍增加总计算量。应追踪前缀复用计算量，而非 Token 峰值。
3. **把重新预填归咎于模型**：聊天模板移除较早的推理块，即使没有编辑也会导致重新预填。先分析服务路径，再判断缓存未命中是否由自主管理导致。
4. **过早提供操作提示会引发大规模删除**：在上下文填充率较低时展示压缩操作说明，可能让模型在有需要之前就清空工作上下文。第一层提醒应只提供信息。
5. **固定警告区间漏掉大输出**：一次大的工具结果可能直接从固定阈值以下跳到超限。根据近期输出大小设定紧急区间；如果单次输出本身无法放入剩余预算，就限制该输出。
6. **回滚活锁**：溢出后，模型经常会重新运行导致超限的命令。回滚通知中应列出问题命令；只有多次忽略回滚后才加深回滚范围。仅因上下文短暂低于上限就重置策略，会让循环持续下去。
7. **小模型不编辑**：能力较弱的模型会在许多任务中跳过编辑并接近上下文上限；经过训练或引导之前，自主管理的表现可能不如定时管理基线（claim-self-managed-context-capability-gap）。应为这类模型保留定时管理后备方案。
8. **模型写入的指令会持续存在**：笔记在后续每轮都会作为上下文读入。模型可能保留看起来像指令、且后续轮次会遵循的文本（claim-self-managed-context-self-injection）。应检查模型写入区域中并非来自用户或任务的命令式内容。
9. **未设成功门槛的效率奖励**：奖励更少 Token 或更多编辑会让模型学会丢弃必要状态。效率项必须以成功为前提，并要求每组至少有两次成功尝试。
10. **论文结果受配置限制**：不同实验使用的预算、轮次上限、评分器和基线技能都不相同；一些长程结果报告的是多个随机种子中的最佳值。不要跨章节比较数值，也不要未经重新测量就移植到其他服务栈。

## 集成

本技能与以下技能相连：

- `context-compression`——说明替代笔记应该保留什么；本技能决定由谁触发压缩以及结果放在上下文的哪里。
- `context-optimization`——负责由 harness 控制的缓存稳定布局和遮罩；本技能增加模型发起上下文中段编辑时的成本考量。
- `filesystem-context`——卸载到文件只完成了驱逐的一半；本技能还负责从实时窗口移除原文。
- `context-degradation`——解释上下文膨胀或过时为何有害；自主管理是模型可控制的一种应对方式。
- `harness-engineering`——本设计中的固定前缀、编辑门控和回滚属于由 harness 控制的不变量。
- `self-improvement-loops`——当优化上下文编辑技能时，负责治理策略演进循环和验收门槛。
- `multi-agent-patterns`——每个智能体都管理自己的上下文文件的子智能体和群体设计。
- `latent-briefing`——潜在状态替代方案：在智能体间压缩传递的 KV 状态，而不是编辑文本。

## 参考资料

内部参考：

- [Harness 协议](./references/harness-protocol.md)——首次实现镜像文件、重新解析、编辑门控、预算控制器、回滚、ICL 门控、强化学习优势或 SCR 配置时阅读。
- [证据](./references/evidence.md)——引用基准数据、比较基线或检查局限与发布范围时阅读。

本资料集中的相关技能：

- `context-compression`——设计替代笔记内容时阅读。
- `context-optimization`——由 harness 而非模型控制上下文时阅读。
- `self-improvement-loops`——用验收门槛和归档流程封装策略演进或强化学习时阅读。

外部资源：

- 论文：[Context Language Models](https://arxiv.org/abs/2609.37725)
- 代码：[facebookresearch/context-language-models](https://github.com/facebookresearch/context-language-models)
- 安全报告：[Self-generated prompt injections in compaction summaries](https://alignment.openai.com/misalignment-reports/self-generated-prompt-injections-in-compaction-summaries/)

---

## 技能元数据

**创建时间**：2026-10-01
**最后更新**：2026-10-01
**作者**：Agent Skills for Context Engineering 贡献者；主要技术来源为 Shao 等人的《Context Language Models》（arXiv 2609.37725）及其公开代码
**版本**：1.0.0
