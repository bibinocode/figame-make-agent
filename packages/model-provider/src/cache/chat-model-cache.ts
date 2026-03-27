import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * 用 Map 做最基础的进程内缓存。
 *
 * 现在先不做 TTL / LRU / 手动失效策略，
 * 目标只是“同配置复用同一个 ChatModel 实例”。
 */
const chatModelCache = new Map<string, BaseChatModel>();

/**
 * 按 key 读取 chat model
 */
export function getCachedChatModel(key: string): BaseChatModel | undefined {
  return chatModelCache.get(key);
}

/**
 * 写入 chat model 缓存
 */
export function setCachedChatModel(
  key: string,
  model: BaseChatModel,
): BaseChatModel {
  chatModelCache.set(key, model);
  return model;
}

/**
 * 如果缓存里已有实例，就直接返回；
 * 否则调用 factory 创建，并写入缓存。
 */
export function getOrCreateCachedChatModel(
  key: string,
  factory: () => BaseChatModel,
): BaseChatModel {
  const cachedModel = getCachedChatModel(key);
  if (cachedModel) {
    return cachedModel;
  }

  const nextModel = factory();
  return setCachedChatModel(key, nextModel);
}

/**
 * 测试时需要清空缓存。
 */
export function clearChatModelCache(): void {
  chatModelCache.clear();
}
