import { ChatMinimax } from "@langchain/community/chat_models/minimax";
import type { ResolvedChatModelOptions } from "../../types/runtime";

/**
 * 创建 MiniMax ChatModel
 *
 * MiniMax 在 LangChain JS 生态里通常仍然走 community integration。
 * 如果后面发现还需要 groupId / region 之类的 provider 特定参数，
 * 我们再把它补进 ProviderBaseConfig 和 ResolvedChatModelOptions。
 */
export function createMiniMaxChatModel(options: ResolvedChatModelOptions) {
  return new ChatMinimax({
    model: options.model,
    temperature: options.temperature,
    minimaxApiKey: options.apiKey,
  });
}
