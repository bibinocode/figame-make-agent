import type { ProfileId, ProviderId } from "./provider";

/** 解析后的配置类型,“可直接创建模型”的干净类型 */

export interface ResolvedChatModelOptions {
  provider: ProviderId;
  profile: ProfileId;
  model: string;
  apiKey: string;
  baseURL?: string;
  temperature: number;
  maxTokens?: number;
}
