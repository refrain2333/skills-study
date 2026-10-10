# 参与贡献

感谢你参与本项目。本示例属于[智能体上下文工程技能集](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)。

## 报告问题

- 先检查已有问题。
- 提供清楚的复现步骤。
- 如适用，附上检查输出。

## 新增工具

1. 在 `src/tools/<类别>/<工具名>.ts` 中实现工具。
   - 定义输入和输出 Zod 数据结构。
   - 实现工具函数并处理错误。
   - 补充正确的 TypeScript 类型。
2. 从 `src/tools/<类别>/index.ts` 导出工具。
3. 在 `tools/<类别>/<工具名>.md` 编写说明，包括用途、适用时机、输入输出和示例。
4. 在 `tests/` 中增加数据结构检查和 API 集成测试。

## 代码风格

- 提交前运行 `npm run lint`。
- 使用 `npm run format` 保持格式一致。
- 使用 TypeScript 严格模式。
- 为公开 API 编写 JSDoc 注释。

## 拉取请求流程

1. Fork 仓库。
2. 创建功能分支：`git checkout -b feature/my-feature`。
3. 修改代码。
4. 在当前任务允许的范围内检查改动。
5. 提交：`git commit -m 'Add my feature'`。
6. 推送分支并创建拉取请求。

## 测试指南

原项目测试会调用真实 OpenAI API，需要 API 密钥；单次调用默认超时 `60000ms`，多次调用默认超时 `120000ms`。模型输出存在随机性，设计检查时应考虑这种变化。是否运行测试应遵守当前任务的用户指示。

## 开发环境

```bash
git clone https://github.com/muratcankoylan/llm-as-judge-skills.git
cd llm-as-judge-skills
npm install
cp env.example .env
# 将 OPENAI_API_KEY 写入 .env
npm run build
npm test
```

有问题可在主仓库提交 issue。
