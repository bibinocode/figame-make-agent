import { beforeEach } from "vitest";
import { clearChatModelCache } from "../cache/chat-model-cache";
import { clearProviderRegistry } from "../registry/provider-registry";

const MODEL_ENV_KEYS = [
  "FIGAME_DEFAULT_PROFILE",
  "MINIMAX_API_KEY",
  "MINIMAX_BASE_URL",
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_BASE_URL",
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_ORGANIZATION",
] as const;

/**
 * 每个测试前清理全局状态。
 *
 * 这些状态都带有“进程内单例”特征：
 * - provider registry
 * - chat model cache
 * - process.env
 *
 * 不清理的话，测试之间会互相污染，结果会不稳定。
 */
beforeEach(() => {
  clearProviderRegistry();
  clearChatModelCache();

  for (const key of MODEL_ENV_KEYS) {
    delete process.env[key];
  }
});
