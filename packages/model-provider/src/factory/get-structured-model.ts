import type { z } from "zod";
import type { GetModelOptions, ModelConfig } from "../types/config";
import { getChatModel } from "./get-chat-model";
import { getProviderDescriptor } from "../registry/provider-registry";
import { resolveModelConfig } from "../config/resolve-model-config";

/**
 * 获取结构化输出模型
 *
 * 这条链路的核心思想是：
 * 1. 先解析最终配置，知道当前到底在用哪个 provider
 * 2. 再拿到 provider descriptor，读取它的 structured 默认策略
 * 3. 再基于底层 chat model 调用 withStructuredOutput
 *
 * 注意：
 * - 这里不单独缓存 structured model
 * - 缓存的仍然是底层 chat model
 * - 因为 structured output 和 schema 强相关，不适合做全局实例缓存
 */
export function getStructuredModel<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
) {
  // 先拿到最终配置，这一步是为了知道当前 provider 是谁
  const resolvedConfig = resolveModelConfig(externalConfig, options);

  // 根据 provider 找到 descriptor，读取 provider 默认 structured 策略
  const descriptor = getProviderDescriptor(resolvedConfig.provider);

  // 底层仍然是 chat model
  const chatModel = getChatModel(externalConfig, options);

  // 如果 provider descriptor 里没有声明 structuredMethod，
  // 这里默认回退到 functionCalling
  const structuredMethod =
    descriptor.defaults?.structuredMethod ?? "functionCalling";

  // 返回基于 schema 包装后的结构化输出模型
  return chatModel.withStructuredOutput(schema, {
    method: structuredMethod,
    includeRaw: false,
  });
}
