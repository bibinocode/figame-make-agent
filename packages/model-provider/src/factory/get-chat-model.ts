import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { resolveModelConfig } from "../config/resolve-model-config";
import { createChatModelCacheKey } from "../cache/cache-key";
import { getOrCreateCachedChatModel } from "../cache/chat-model-cache";
import { registerBuiltinProviders } from "../registry/builtins";
import { getProviderDescriptor } from "../registry/provider-registry";
import type { GetModelOptions, ModelConfig } from "../types/config";
import { assertCapability } from "../utils/assert-capability";

export function getChatModel(
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): BaseChatModel {
  registerBuiltinProviders();

  const resolvedConfig = resolveModelConfig(externalConfig, options);
  const descriptor = getProviderDescriptor(resolvedConfig.provider);

  assertCapability(descriptor, "chat");

  const cacheKey = options?.cacheKey ?? createChatModelCacheKey(resolvedConfig);
  const chatCreator = descriptor.capabilities.chat;

  if (!chatCreator) {
    throw new Error(
      `Provider "${descriptor.id}" chat capability is missing after assertion.`,
    );
  }

  return getOrCreateCachedChatModel(cacheKey, () => {
    return chatCreator(resolvedConfig);
  });
}
