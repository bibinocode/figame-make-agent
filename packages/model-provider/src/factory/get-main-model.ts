import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { GetModelOptions, ModelConfig } from "../types/config";
import { getChatModel } from "./get-chat-model";

/**
 * 获取主模型
 *
 * 当前阶段的 main model 本质上还是：
 * “基于默认 profile 和运行时覆盖参数得到一个 chat model”
 *
 * 后面如果我们单独实现 getModelByProfile("main")，
 * 这里就会变成那个函数的语义化封装。
 */
export function getMainModel(
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): BaseChatModel {
  return getChatModel(externalConfig, options);
}
