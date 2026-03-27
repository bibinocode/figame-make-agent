import type { ModelConfig } from "../types/config";

/** 默认模型 */
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  defaultProfile: "main",
  profiles: {
    main: {
      provider: "minimax",
      model: "minimax-m2.7",
      temperature: 0,
      maxTokens: 4096,
    },
  },
  providers: {},
};
