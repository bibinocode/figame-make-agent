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






## 项目组织架构（规划版本）


```bash
figame-make-agent/
├─ apps/
│  └─ web/                                   # Next.js 前端应用
│     ├─ app/
│     │  ├─ api/
│     │  │  ├─ chat/route.ts                 # 对话入口
│     │  │  ├─ agent/route.ts                # agent 执行入口
│     │  │  ├─ preview/route.ts              # 预览/模板相关接口
│     │  │  └─ health/route.ts
│     │  ├─ globals.css
│     │  ├─ layout.tsx
│     │  └─ page.tsx
│     ├─ components/                         # 通用 UI 组件
│     │  ├─ ui/
│     │  ├─ layout/
│     │  └─ feedback/
│     ├─ features/                           # 页面级业务模块
│     │  ├─ agent-chat/
│     │  │  ├─ components/
│     │  │  ├─ hooks/
│     │  │  ├─ services/
│     │  │  └─ types.ts
│     │  ├─ project-preview/
│     │  │  ├─ components/
│     │  │  ├─ sandpack/
│     │  │  └─ services/
│     │  ├─ model-selector/
│     │  ├─ skill-panel/
│     │  ├─ mcp-panel/
│     │  └─ flow-runner/
│     ├─ lib/
│     │  ├─ api-client/
│     │  ├─ server/
│     │  ├─ constants/
│     │  └─ utils/
│     ├─ public/
│     ├─ next.config.ts
│     ├─ package.json
│     └─ tsconfig.json
│
├─ packages/
│  ├─ agent-core/                            # 运行时核心：怎么跑
│  │  ├─ src/
│  │  │  ├─ runtime/                         # agent 生命周期、启动入口
│  │  │  ├─ executor/                        # 执行器
│  │  │  ├─ planner/                         # 规划器
│  │  │  ├─ memory/                          # 记忆/上下文
│  │  │  ├─ events/                          # 流式事件/日志/trace
│  │  │  ├─ session/                         # 会话管理
│  │  │  ├─ context/                         # 执行上下文
│  │  │  ├─ registry/                        # flow/skill/mcp 注册聚合
│  │  │  ├─ errors/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ agent-flows/                           # 跑什么流程
│  │  ├─ src/
│  │  │  ├─ registry/                        # flow 注册中心
│  │  │  ├─ shared/                          # flow 共享节点/工具
│  │  │  ├─ ui-generate/
│  │  │  │  ├─ flow.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ nodes/
│  │  │  │  ├─ local-schema.ts
│  │  │  │  └─ prompt.ts
│  │  │  ├─ code-optimize/
│  │  │  │  ├─ flow.ts
│  │  │  │  ├─ nodes/
│  │  │  │  ├─ local-schema.ts
│  │  │  │  └─ prompt.ts
│  │  │  ├─ template-build/
│  │  │  │  ├─ flow.ts
│  │  │  │  ├─ nodes/
│  │  │  │  ├─ local-schema.ts
│  │  │  │  └─ prompt.ts
│  │  │  ├─ project-analyze/
│  │  │  ├─ multi-agent/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ agent-schema/                          # 全局共享 schema / annotation / contract
│  │  ├─ src/
│  │  │  ├─ annotation/
│  │  │  ├─ input/
│  │  │  ├─ output/
│  │  │  ├─ domain/                          # 页面/组件/文件/模板领域模型
│  │  │  ├─ graph/                           # flow state / node state
│  │  │  ├─ model/
│  │  │  ├─ mcp/
│  │  │  ├─ skill/
│  │  │  ├─ template/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ agent-prompts/                         # Prompt 资产与组装器
│  │  ├─ src/
│  │  │  ├─ system/
│  │  │  ├─ flows/
│  │  │  │  ├─ ui-generate/
│  │  │  │  ├─ code-optimize/
│  │  │  │  ├─ template-build/
│  │  │  │  └─ project-analyze/
│  │  │  ├─ skills/
│  │  │  ├─ mcps/
│  │  │  ├─ fragments/                       # 可复用 prompt 片段
│  │  │  ├─ builders/                        # prompt 拼装器
│  │  │  ├─ guards/                          # 输出约束
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ model-provider/                        # 模型提供层
│  │  ├─ src/
│  │  │  ├─ providers/
│  │  │  │  ├─ deepseek/
│  │  │  │  ├─ minimax/
│  │  │  │  ├─ openai/
│  │  │  │  ├─ qwen/
│  │  │  │  └─ index.ts
│  │  │  ├─ factory/                         # getMainModel/getStructuredModel
│  │  │  ├─ config/
│  │  │  ├─ cache/
│  │  │  ├─ telemetry/
│  │  │  ├─ types/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ mcp-system/                            # MCP 注册、发现、调用
│  │  ├─ src/
│  │  │  ├─ registry/
│  │  │  ├─ discovery/                       # 目录自动发现
│  │  │  ├─ loaders/                         # 配置驱动加载
│  │  │  ├─ adapters/                        # 各类 MCP 客户端适配
│  │  │  ├─ invoker/
│  │  │  ├─ transport/
│  │  │  ├─ validators/
│  │  │  ├─ errors/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ skill-system/                          # Skill 注册、发现、执行
│  │  ├─ src/
│  │  │  ├─ registry/
│  │  │  ├─ discovery/                       # 目录自动发现
│  │  │  ├─ loaders/                         # 配置驱动加载
│  │  │  ├─ executor/
│  │  │  ├─ builtins/
│  │  │  ├─ validators/
│  │  │  ├─ context/
│  │  │  ├─ errors/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ template-system/                       # 模板工程与文件组装
│  │  ├─ src/
│  │  │  ├─ registry/
│  │  │  ├─ scanner/                         # fast-glob 扫描模板
│  │  │  ├─ assembler/                       # 转成 Sandpack files
│  │  │  ├─ manifest/
│  │  │  ├─ transforms/
│  │  │  ├─ validators/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ sandpack-runtime/                      # Sandpack 运行时封装
│  │  ├─ src/
│  │  │  ├─ files/
│  │  │  ├─ preview/
│  │  │  ├─ state/
│  │  │  ├─ transforms/
│  │  │  ├─ templates/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ shared/                                # 全局共享工具
│  │  ├─ src/
│  │  │  ├─ constants/
│  │  │  ├─ utils/
│  │  │  ├─ logger/
│  │  │  ├─ types/
│  │  │  ├─ env/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  └─ config/                                # 配置定义与加载器
│     ├─ src/
│     │  ├─ defaults/
│     │  ├─ loaders/
│     │  ├─ resolvers/
│     │  ├─ validators/
│     │  └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
│
├─ skills/                                   # 文件约定驱动 skill
│  ├─ builtin/
│  │  ├─ ui-generate/
│  │  │  ├─ manifest.json
│  │  │  ├─ prompt.md
│  │  │  └─ schema.ts
│  │  ├─ code-review/
│  │  └─ template-select/
│  └─ custom/
│     └─ README.md
│
├─ mcps/                                     # 文件约定驱动 mcp
│  ├─ builtin/
│  │  ├─ filesystem/
│  │  │  ├─ manifest.json
│  │  │  ├─ tools.json
│  │  │  └─ schema.ts
│  │  ├─ browser/
│  │  └─ search/
│  └─ custom/
│     └─ README.md
│
├─ flows/                                    # 文件约定驱动 flow 声明
│  ├─ builtin/
│  │  ├─ ui-generate.flow.ts
│  │  ├─ code-optimize.flow.ts
│  │  └─ template-build.flow.ts
│  ├─ custom/
│  └─ manifests/
│
├─ templates/                                # Sandpack / 项目模板
│  ├─ react-ts/
│  │  ├─ src/
│  │  ├─ package.json
│  │  └─ template.manifest.json
│  ├─ figame-base/
│  │  ├─ src/
│  │  ├─ public/
│  │  ├─ package.json
│  │  └─ template.manifest.json
│  ├─ figame-dashboard/
│  └─ shared/
│
├─ configs/                                  # 显式配置驱动
│  ├─ agent.config.ts
│  ├─ flow.config.ts
│  ├─ model.config.ts
│  ├─ mcp.config.ts
│  ├─ skill.config.ts
│  ├─ template.config.ts
│  └─ app.config.ts
│
├─ docs/
│  ├─ architecture/
│  │  ├─ overview.md
│  │  ├─ runtime.md
│  │  ├─ flows.md
│  │  ├─ skills.md
│  │  ├─ mcps.md
│  │  ├─ prompts.md
│  │  └─ schemas.md
│  ├─ guides/
│  │  ├─ add-new-flow.md
│  │  ├─ add-new-skill.md
│  │  ├─ add-new-mcp.md
│  │  └─ add-new-template.md
│  ├─ plans/
│  └─ adr/
│
├─ tests/
│  ├─ unit/
│  │  ├─ agent-core/
│  │  ├─ agent-flows/
│  │  ├─ mcp-system/
│  │  ├─ skill-system/
│  │  └─ template-system/
│  ├─ integration/
│  │  ├─ flow-execution/
│  │  ├─ mcp-integration/
│  │  ├─ skill-integration/
│  │  └─ sandpack-preview/
│  └─ e2e/
│     └─ web/
│
├─ .changeset/
├─ .env.example
├─ .gitignore
├─ eslint.config.mjs
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ turbo.json
└─ README.md

```
