# 项目维护说明

## 技能文档

- `skills/` 下的每个目录都是一个对外发布的技能；该目录中的 `SKILL.md` 是唯一规范版本，正文使用中文。
- 当前语料数量见[生成清单](researcher/generated/corpus-summary.md)，不要在其他文档中复制实时统计数字。
- 修改技能后，检查根目录 `README.md` 和 `SKILL.md`、插件清单、`researcher/corpus/index.json`、激活案例、参考资料及依赖该技能的生成清单。
- 数值、基准测试和时效性主张应关联 `researcher/claims/index.jsonl`；若无来源记录，应改为注明日期的限定说法。
- 修改研究运行框架前，先阅读 `researcher/insights/auto-research-experiment.md` 和 `researcher/insights/how-we-built-this.md`。
- 运行队列、日志、报告和未完成的运行目录不是源文件；遵守仓库现有的忽略规则和运行状态规则。

## 修改与检查

- 遵守当前用户提供的测试和验证范围；默认只做与改动直接相关的最小检查。未经用户明确要求，不运行全套测试或模型基准。
- 未经用户明确要求，不启动或停止应用服务、数据库、容器或网站部署。
- 允许时，使用仓库的确定性检查工具验证技能格式、插件清单或数据结构。
- 不要把凭据写入源文件、日志、示例或基准测试输出。
