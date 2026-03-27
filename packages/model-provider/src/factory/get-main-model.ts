import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { GetModelOptions, ModelConfig } from "../types/config";
import { getModelByProfile } from "./get-model-by-profile";

/**
 * 获取主模型
 *
 * 这里不再直接调用 getChatModel，
 * 而是显式走 main profile。
 *
 * 这样后面如果 main profile 的默认 provider / model 改了，
 * getMainModel 的行为也会自然跟着配置走。
 */
export function getMainModel(
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): BaseChatModel {
  return getModelByProfile("main", externalConfig, options);
}
