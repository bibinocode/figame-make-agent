# model-provider

`model-provider` 负责统一管理本项目的模型供应商接入、配置解析、能力注册、实例工厂和缓存复用。

这个包不是简单的 `getXXModel()` 工具集合，而是一个面向长期演进的 provider 系统。当前优先落地 `ChatModel` 主链，但整体架构已经为 `structured / embedding / vision` 预留好了扩展位，后续不需要推翻重构。

## 目标

- 支持多个模型供应商，例如 `minimax`、`deepseek`、`openai`
- 支持运行时切换 provider、model、temperature、maxTokens 等参数
- 支持统一的主模型入口和结构化输出入口
- 支持基于配置的模型 profile，例如 `main`、`planner`、`structured`
- 支持 provider 级能力注册，而不是把逻辑散落在多个工具函数里
- 支持实例缓存，避免重复创建 LangChain 模型对象
- 后续可无痛扩展 `embedding`、`vision`

## 核心设计原则

### 1. Provider 和 Capability 分离

- `provider` 表示供应商，例如 `openai`、`deepseek`
- `capability` 表示能力，例如 `chat`、`embedding`、`vision`

这样一个 provider 可以逐步补齐不同能力，而不是一开始就被写死成“只能聊天”。

### 2. Profile 驱动，而不是只靠 default model

智能体系统不止需要一个“默认模型”，而是需要不同场景的模型配置。例如：

- `main`：主对话模型
- `planner`：规划模型
- `structured`：结构化输出模型
- `fast`：低成本快速模型
- `vision`：视觉模型
- `embedding`：向量模型

因此配置层以 `profile` 为核心，`getMainModel()` 只是 `getModelByProfile("main")` 的语义化快捷入口。

### 3. 工厂、配置、缓存、provider 实现严格分层

- `config/*` 只负责“配置从哪里来、怎么合并”
- `registry/*` 只负责“系统里有哪些 provider、支持哪些能力”
- `providers/*` 只负责“某个 provider 如何创建模型实例”
- `factory/*` 只负责“给业务层暴露简洁 API”
- `cache/*` 只负责“实例复用”

### 4. 运行时参数优先级最高

配置优先级固定为：

`运行时参数 > configs/model.config.ts > 环境变量 > 包内默认值`

这样 agent flow 或 UI 层可以临时切换模型，而不需要改基础配置。

## 最终目录设计

```txt
packages/model-provider/src/
├─ types/
│  ├─ provider.ts
│  ├─ config.ts
│  ├─ runtime.ts
│  ├─ model.ts
│  └─ errors.ts
│
├─ config/
│  ├─ defaults.ts
│  ├─ env.ts
│  ├─ profiles.ts
│  └─ resolve-model-config.ts
│
├─ registry/
│  ├─ provider-registry.ts
│  ├─ capability-registry.ts
│  └─ builtins.ts
│
├─ cache/
│  ├─ cache-key.ts
│  ├─ chat-model-cache.ts
│  ├─ embedding-model-cache.ts
│  └─ vision-model-cache.ts
│
├─ providers/
│  ├─ deepseek/
│  │  ├─ descriptor.ts
│  │  ├─ chat.ts
│  │  └─ structured.ts
│  ├─ minimax/
│  │  ├─ descriptor.ts
│  │  └─ chat.ts
│  ├─ openai/
│  │  ├─ descriptor.ts
│  │  ├─ chat.ts
│  │  ├─ structured.ts
│  │  ├─ embedding.ts
│  │  └─ vision.ts
│  └─ index.ts
│
├─ factory/
│  ├─ get-chat-model.ts
│  ├─ get-main-model.ts
│  ├─ get-model-by-profile.ts
│  ├─ get-structured-model.ts
│  ├─ get-embedding-model.ts
│  └─ get-vision-model.ts
│
├─ utils/
│  ├─ assert-capability.ts
│  ├─ pick-provider-config.ts
│  └─ redact-config.ts
│
└─ index.ts
```

## 类型设计

### Provider 维度

```ts
export type ProviderId = "minimax" | "deepseek" | "openai";
```

### Capability 维度

```ts
export type ModelCapability =
  | "chat"
  | "structured"
  | "embedding"
  | "vision";
```

### Profile 维度

```ts
export type ProfileId =
  | "main"
  | "planner"
  | "structured"
  | "fast"
  | "vision"
  | "embedding";
```

### 配置类型

```ts
export interface ProviderBaseConfig {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  timeoutMs?: number;
}

export interface ModelProfileConfig {
  provider: ProviderId;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export interface ModelConfig {
  defaultProfile: ProfileId;
  profiles: Partial<Record<ProfileId, ModelProfileConfig>>;
  providers: Partial<Record<ProviderId, ProviderBaseConfig>>;
}
```

### 运行时覆盖参数

```ts
export interface GetModelOptions {
  profile?: ProfileId;
  provider?: ProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string;
  cacheKey?: string;
}
```

### 解析后的运行时配置

```ts
export interface ResolvedChatModelOptions {
  provider: ProviderId;
  profile: ProfileId;
  model: string;
  apiKey: string;
  baseURL?: string;
  temperature: number;
  maxTokens?: number;
}
```

## 配置模型

### 包内默认值

`src/config/defaults.ts` 只放稳定兜底值，例如：

- `defaultProfile: "main"`
- 默认 `temperature: 0`
- 默认 `maxTokens`

### 环境变量

`src/config/env.ts` 负责读取环境变量，例如：

- `FIGAME_DEFAULT_PROFILE`
- `MINIMAX_API_KEY`
- `DEEPSEEK_API_KEY`
- `OPENAI_API_KEY`
- 各 provider 对应的 `BASE_URL`

### 外部显式配置

外部项目配置放在 [configs/model.config.ts](/E:/abi/ai/figame-make-agent/configs/model.config.ts)，推荐形状如下：

```ts
export const modelConfig = {
  defaultProfile: "main",
  profiles: {
    main: {
      provider: "minimax",
      model: "minimax-m2.7",
      temperature: 0,
    },
    structured: {
      provider: "deepseek",
      model: "deepseek-chat",
      temperature: 0,
    },
    fast: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0,
    },
  },
  providers: {
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY,
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
};
```

## Descriptor + Registry 机制

每个 provider 不直接暴露零散函数，而是通过 `descriptor` 向系统注册自己的能力。

```ts
export interface ProviderDescriptor {
  id: ProviderId;
  capabilities: Partial<{
    chat: ChatModelCreator;
    embedding: EmbeddingModelCreator;
    vision: VisionModelCreator;
  }>;
  defaults?: {
    baseURL?: string;
    structuredMethod?: "functionCalling" | "jsonSchema";
  };
}
```

优势：

- 新增 provider 时只需要新增 descriptor 和实现文件
- 主流程不需要再改 `switch`
- 可以明确知道某个 provider 支持哪些能力

## 工厂层设计

### 通用 API

建议对外暴露以下通用入口：

```ts
getMainModel(options?)
getModelByProfile(profile, options?)
getChatModel(provider, options?)
getStructuredModel(schema, options?)
getEmbeddingModel(options?)
getVisionModel(options?)
```

### 便捷 API

同时保留供应商快捷入口：

```ts
getMiniMaxModel(options?)
getDeepSeekModel(options?)
getOpenAIModel(options?)
```

### 调用关系

`getMainModel()` 的主链：

```txt
getMainModel(options?)
  -> getModelByProfile("main", options?)
  -> resolveModelConfig(profile, options)
  -> assertCapability(provider, "chat")
  -> cache.getOrCreate(resolvedConfig)
  -> provider descriptor.chat(...)
  -> ChatModel
```

`getStructuredModel(schema)` 的主链：

```txt
getStructuredModel(schema, options?)
  -> getModelByProfile("structured", options?)
  -> getChatModel(...)
  -> withStructuredOutput(schema, descriptor.defaults.structuredMethod)
```

## 缓存策略

缓存职责独立在 `cache/*`。

### 当前策略

- 进程内缓存
- 按配置生成稳定 key
- 同配置复用实例

### 缓存 key 建议组成

- `provider`
- `profile`
- `model`
- `baseURL`
- `temperature`
- `maxTokens`
- `apiKey` 的安全摘要

不要直接把明文 `apiKey` 打到日志里。

### 设计约束

- 缓存底层模型实例
- 不缓存 `withStructuredOutput(schema)` 的结果

因为结构化输出是“模型 + schema”的组合，不适合作为通用 provider 实例缓存。

## 错误处理

建议统一定义模型层错误，例如：

- `UnsupportedProviderError`
- `UnsupportedCapabilityError`
- `MissingProviderConfigError`
- `MissingApiKeyError`
- `InvalidProfileError`

要求尽早失败，不做静默降级。

## 未来扩展

这套架构未来可直接扩展：

- 新增 provider：补 `providers/<id>/descriptor.ts`
- 新增能力：补 capability 类型和 factory
- 新增业务场景：补 `profile`
- 新增 UI 切换：只改配置层，不动 provider 实现

## 当前实现建议顺序

虽然整体架构已经按长期方案设计，但实现时建议按这个顺序推进：

1. 先落 `types/*`、`config/*`
2. 再落 `registry/*` 和 `descriptor`
3. 再实现 `chat` 主链
4. 再补 `structured`
5. 最后再补 `embedding / vision`

这样能保证结构一次设计到位，但开发成本按价值逐步释放。
