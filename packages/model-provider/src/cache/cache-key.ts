import type { ResolvedChatModelOptions } from "../types/runtime";

/**
 * 生成 chat model 的缓存 key
 *
 * 为什么要单独抽文件：
 * - 后面 embedding / vision 也会有自己的 key 规则
 * - 缓存 key 是核心逻辑，不适合散落在 factory 里
 *
 * 这里先采用简单稳定的字符串拼接方案。
 * 后面如果你想做 hash，也可以在这个文件里升级，不影响外层调用。
 */
export function createChatModelCacheKey(
  options: ResolvedChatModelOptions,
): string {
  return [
    options.provider,
    options.profile,
    options.model,
    options.baseURL ?? "",
    String(options.temperature),
    String(options.maxTokens ?? ""),
    options.apiKey,
  ].join("::");
}
