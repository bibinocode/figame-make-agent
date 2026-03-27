import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { GetModelOptions, ModelConfig } from "../types/config";
import { resolveModelConfig } from "../config/resolve-model-config";
import { getProviderDescriptor } from "../registry/provider-registry";
import { getOrCreateCachedChatModel } from "../cache/chat-model-cache";
import { createChatModelCacheKey } from "../cache/cache-key";
import { assertCapability } from "../utils/assert-capability";

/**
 * 获取一个可用的 ChatModel
 *
 * 当前主链：
 * 1. 解析最终运行时配置
 * 2. 根据 provider 找到 descriptor
 * 3. 校验 provider 是否支持 chat
 * 4. 基于最终配置生成缓存 key
 * 5. 优先从缓存返回；没有时再真正创建模型
 */
export function getChatModel(
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): BaseChatModel {
  // 先把所有配置来源合并成“最终可执行配置”
  const resolvedConfig = resolveModelConfig(externalConfig, options);

  // 找到这个 provider 对应的 descriptor
  const descriptor = getProviderDescriptor(resolvedConfig.provider);

  // 明确要求当前 provider 必须支持 chat
  assertCapability(descriptor, "chat");

  // 生成同配置复用的缓存 key
  const cacheKey = options?.cacheKey ?? createChatModelCacheKey(resolvedConfig);

  // 经过断言后，理论上 chat creator 必须存在
  const chatCreator = descriptor.capabilities.chat;
  if (!chatCreator) {
    throw new Error(
      `Provider "${descriptor.id}" chat capability is missing after assertion.`,
    );
  }

  // 先查缓存；没有才真正创建模型实例
  return getOrCreateCachedChatModel(cacheKey, () => {
    return chatCreator(resolvedConfig);
  });
}
