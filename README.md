# FigameMcpAgnet

这是一个Nextjs16和Langchain构建的Figame生成UI智能体

## 当前仓库结构

仓库已经调整为 `pnpm monorepo` 结构：

- `apps/web`：当前 Next.js Web 应用
- `packages/*`：后续逐步实现的 agent 核心能力包
- `skills/`：基于目录约定的 skill 定义
- `mcps/`：基于目录约定的 MCP 定义
- `flows/`：基于目录约定的 flow 定义
- `templates/`：Sandpack / 项目模板
- `configs/`：显式配置入口
- `docs/`：架构、计划、指南
- `tests/`：单测、集成测试、E2E

技术栈：

- LangChain + LangGraph
- LLM模型: minimax-m2.7
- Schema: Annotation
- 代码预览技术：Sandpack https://sandpack.codesandbox.io


