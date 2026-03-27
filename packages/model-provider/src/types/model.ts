import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ResolvedChatModelOptions } from "./runtime";
import type { ModelCapability, ProviderId } from "./provider";

/**
 * ChatModel 创建函数
 *
 * 输入一定是“已经解析完优先级和默认值”的配置，
 * 输出是 LangChain 的标准聊天模型实例。
 */
export type ChatModelCreator = (
  options: ResolvedChatModelOptions,
) => BaseChatModel;

/**
 * Structured model 创建函数
 *
 * 这里先不绑定 schema 相关的精确类型，
 * 因为后面 getStructuredModel 会基于具体 schema 再做包装。
 */
export type StructuredModelCreator = (
  options: ResolvedChatModelOptions,
) => unknown;

/**
 * 这些能力后面还会继续实现。
 * 现在先保留类型位，避免未来重构 descriptor 结构。
 */
export type EmbeddingModelCreator = (options: unknown) => unknown;
export type VisionModelCreator = (options: unknown) => unknown;

/**
 * ProviderDescriptor 描述一个 provider 的能力边界。
 *
 * 它不直接负责做业务逻辑，而是告诉系统：
 * - 我是谁
 * - 我支持什么能力
 * - 我有哪些 provider 默认行为
 */
export interface ProviderDescriptor {
  id: ProviderId;
  capabilities: Partial<{
    chat: ChatModelCreator;
    structured: StructuredModelCreator;
    embedding: EmbeddingModelCreator;
    vision: VisionModelCreator;
  }>;
  defaults?: {
    baseURL?: string;
    structuredMethod?: "functionCalling" | "jsonSchema";
  };
}

/**
 * 一个辅助类型：表示当前 provider 是否支持某种 capability。
 * 这个类型现在还不一定马上用到，但后面写 assert-capability 时会很顺手。
 */
export interface CapabilitySupport {
  provider: ProviderId;
  capability: ModelCapability;
  supported: boolean;
}
