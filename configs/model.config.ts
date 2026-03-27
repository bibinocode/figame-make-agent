import type { ModelConfig } from "../packages/model-provider/src/types/config";

/**
 * 项目级模型配置
 *
 * 这里定义的是“业务层默认策略”，
 * 而不是 provider 底层实现。
 *
 * 后面 UI 切换、flow 切换，都会优先围绕这份配置展开。
 */
export const modelConfig: ModelConfig = {
  defaultProfile: "main",

  profiles: {
    // 主对话模型
    main: {
      provider: "minimax",
      model: "minimax-m2.7",
      temperature: 0,
      maxTokens: 4096,
    },

    // 结构化输出优先走 deepseek
    structured: {
      provider: "deepseek",
      model: "deepseek-chat",
      temperature: 0,
      maxTokens: 4096,
      baseURL: "https://api.deepseek.com",
    },

    // 快速模型，后面前端预览或低成本任务可以优先走这个
    fast: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0,
      maxTokens: 2048,
    },

    // 先给 planner 一个默认位，后面 flow 接进来时直接能用
    planner: {
      provider: "minimax",
      model: "minimax-m2.7",
      temperature: 0,
      maxTokens: 4096,
    },
  },

  providers: {
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY,
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      organization: process.env.OPENAI_ORGANIZATION,
    },
  },
};
