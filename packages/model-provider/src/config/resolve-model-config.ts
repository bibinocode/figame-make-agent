import { DEFAULT_MODEL_CONFIG } from "./defaults";
import { readModelConfigFromEnv } from "./env";
import { pickFirstDefined } from "./pick-config-value";
import { resolveProfile } from "./profiles";
import { getProjectModelConfig } from "./project-config";
import type {
  GetModelOptions,
  ModelConfig,
  ModelProfileConfig,
} from "../types/config";
import type { ProviderId } from "../types/provider";
import type { ResolvedChatModelOptions } from "../types/runtime";
import {
  MissingApiKeyError,
  MissingProfileConfigError,
  MissingProviderConfigError,
} from "../types/errors";

/**
 * 解析最终模型配置
 *
 * 合并优先级：
 * 1. 包内默认值
 * 2. 环境变量
 * 3. 项目级配置文件
 * 4. 调用方传入 externalConfig
 * 5. 调用方传入 options
 *
 * 目标是返回一份“可以直接创建模型实例”的最终配置。
 */
export function resolveModelConfig(
  externalConfig?: Partial<ModelConfig>,
  options?: GetModelOptions,
): ResolvedChatModelOptions {
  const envConfig = readModelConfigFromEnv();
  const projectConfig = getProjectModelConfig();

  // profile 选择时，也要按完整优先级链路来判断
  const mergedConfigForProfile: Partial<ModelConfig> = {
    ...DEFAULT_MODEL_CONFIG,
    ...envConfig,
    ...projectConfig,
    ...externalConfig,
  };

  const profile = resolveProfile(options, mergedConfigForProfile);

  // 读取 profile 配置时，按优先级逐层回退
  const profileConfig: ModelProfileConfig | undefined = pickFirstDefined(
    externalConfig?.profiles?.[profile],
    projectConfig.profiles?.[profile],
    envConfig.profiles?.[profile],
    DEFAULT_MODEL_CONFIG.profiles[profile],
  );

  if (!profileConfig) {
    throw new MissingProfileConfigError(profile);
  }

  // provider 允许被运行时 options 显式覆盖
  const provider: ProviderId = pickFirstDefined(
    options?.provider,
    profileConfig.provider,
  ) as ProviderId;

  // provider 配置同样按优先级逐层回退
  const providerConfig = pickFirstDefined(
    externalConfig?.providers?.[provider],
    projectConfig.providers?.[provider],
    envConfig.providers?.[provider],
    DEFAULT_MODEL_CONFIG.providers[provider],
  );

  if (!providerConfig) {
    throw new MissingProviderConfigError(provider);
  }

  const apiKey = pickFirstDefined(options?.apiKey, providerConfig.apiKey);
  if (!apiKey) {
    throw new MissingApiKeyError(provider);
  }

  return {
    profile,
    provider,
    model: pickFirstDefined(options?.model, profileConfig.model) as string,
    apiKey,
    baseURL: pickFirstDefined(
      options?.baseURL,
      profileConfig.baseURL,
      providerConfig.baseURL,
    ),
    temperature:
      pickFirstDefined(options?.temperature, profileConfig.temperature) ?? 0,
    maxTokens: pickFirstDefined(options?.maxTokens, profileConfig.maxTokens),
  };
}
