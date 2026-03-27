import { DEFAULT_MODEL_CONFIG } from "./defaults";
import { readModelConfigFromEnv } from "./env";
import { resolveProfile } from "./profiles";
import type { GetModelOptions, ModelConfig } from "../types/config";
import type { ResolvedChatModelOptions } from "../types/runtime";
import {
  MissingApiKeyError,
  MissingProfileConfigError,
  MissingProviderConfigError,
} from "../types/errors";

export function resolveModelConfig(
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): ResolvedChatModelOptions {
  const envConfig = readModelConfigFromEnv();

  // 1. 先确定当前要使用哪个 profile，例如 main / structured
  const profile = resolveProfile(options, {
    ...DEFAULT_MODEL_CONFIG,
    ...envConfig,
    ...externalConfig,
  });

  // 2. 再从 多层配置 里拿到这个 profile 对应的模型配置
  const profileConfig =
    externalConfig?.profiles?.[profile] ??
    envConfig.profiles?.[profile] ??
    DEFAULT_MODEL_CONFIG.profiles[profile];

  if (!profileConfig) {
    throw new MissingProfileConfigError(profile);
  }

  // 3. 如果调用方传了 provider，就以调用方为准；否则使用 profile 默认 provider
  const provider = options?.provider ?? profileConfig.provider;

  const providerConfig =
    externalConfig?.providers?.[provider] ??
    envConfig.providers?.[provider] ??
    DEFAULT_MODEL_CONFIG.providers[provider];

  if (!providerConfig) {
    throw new MissingProviderConfigError(provider);
  }

  const apiKey = options?.apiKey ?? providerConfig.apiKey;
  if (!apiKey) {
    throw new MissingApiKeyError(provider);
  }

  return {
    profile,
    provider,
    model: options?.model ?? profileConfig.model,
    apiKey,
    baseURL:
      options?.baseURL ?? profileConfig.baseURL ?? providerConfig.baseURL,
    temperature: options?.temperature ?? profileConfig.temperature ?? 0,
    maxTokens: options?.maxTokens ?? profileConfig.maxTokens,
  };
}
