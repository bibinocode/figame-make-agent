import type { ModelConfig, ProviderBaseConfig } from "../types/config";
import type { ProviderId } from "../types/provider";

function readProviderEnv(provider: ProviderId): ProviderBaseConfig {
  switch (provider) {
    case "minimax":
      return {
        apiKey: process.env.MINIMAX_API_KEY,
        baseURL: process.env.MINIMAX_BASE_URL,
      };
    case "deepseek":
      return {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_BASE_URL,
      };
    case "openai":
      return {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        organization: process.env.OPENAI_ORGANIZATION,
      };
    case "ollama":
      return {
        apiKey: process.env.OLLAMA_API_KEY ?? "ollama-local",
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
      };
  }
}

export function readModelConfigFromEnv(): Partial<ModelConfig> {
  return {
    defaultProfile:
      (process.env.FIGAME_DEFAULT_PROFILE as
        | ModelConfig["defaultProfile"]
        | undefined) ?? undefined,
    providers: {
      minimax: readProviderEnv("minimax"),
      deepseek: readProviderEnv("deepseek"),
      ollama: readProviderEnv("ollama"),
      openai: readProviderEnv("openai"),
    },
  };
}
