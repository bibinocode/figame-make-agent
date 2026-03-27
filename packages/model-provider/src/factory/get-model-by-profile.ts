import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { GetModelOptions, ModelConfig } from "../types/config";
import type { ProfileId } from "../types/provider";
import { getChatModel } from "./get-chat-model";

/**
 * 按 profile 获取模型
 *
 * 这是比 getChatModel 更高一层的语义化入口。
 * getChatModel 更像“给我一个最终可用的 chat model”；
 * getModelByProfile 更像“我要 main / structured / planner 这个业务场景对应的模型”。
 */
export function getModelByProfile(
  profile: ProfileId,
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): BaseChatModel {
  return getChatModel(externalConfig, {
    ...options,
    profile,
  });
}
