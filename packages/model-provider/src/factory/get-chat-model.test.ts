import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { describe, expect, it, vi } from "vitest";
import { getChatModel } from "./get-chat-model";
import { registerProviderDescriptor } from "../registry/provider-registry";
import type { ProviderDescriptor } from "../types/model";

describe("getChatModel", () => {
  // 这条测试验证“相同配置下会复用同一个 chat model 实例”。
  // 这是当前缓存层最重要的承诺：
  // 同 provider / model / profile / apiKey 的请求，不应该重复创建模型对象。
  it("相同解析配置下应该复用同一个 chat model 实例", () => {
    const fakeModel = {} as BaseChatModel;
    const chatCreator = vi.fn(() => fakeModel);

    const descriptor: ProviderDescriptor = {
      id: "openai",
      capabilities: {
        chat: chatCreator,
      },
      defaults: {
        structuredMethod: "functionCalling",
      },
    };

    registerProviderDescriptor(descriptor);

    const externalConfig = {
      defaultProfile: "main" as const,
      profiles: {
        main: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          temperature: 0,
          maxTokens: 2048,
        },
      },
      providers: {
        openai: {
          apiKey: "test-openai-key",
        },
      },
    };

    const first = getChatModel(externalConfig, { profile: "main" });
    const second = getChatModel(externalConfig, { profile: "main" });

    expect(first).toBe(fakeModel);
    expect(second).toBe(fakeModel);
    expect(chatCreator).toHaveBeenCalledTimes(1);
  });
});
