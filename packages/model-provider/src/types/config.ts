import type { ProfileId, ProviderId } from "./provider";

export interface ProviderBaseConfig {
  /** 请求KEY */
  apiKey?: string;
  /** 请求URL  */
  baseURL?: string;
  /** 组织 */
  organization?: string;
  /** 超时时间 */
  timeoutMs?: number;
}

export interface ModelProfileConfig {
  provider: ProviderId;
  model: string;
  /** 温度 */
  temperature?: number;
  /** 最大Tokens */
  maxTokens?: number;
  baseURL?: string;
}

export interface ModelConfig {
  defaultProfile: ProfileId;
  profiles: Partial<Record<ProfileId, ModelProfileConfig>>;
  providers: Partial<Record<ProviderId, ProviderBaseConfig>>;
}

export interface GetModelOptions {
  profile?: ProfileId;
  provider?: ProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string;
  cacheKey?: string;
}
