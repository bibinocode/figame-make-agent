import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { describe, expect, it, vi } from "vitest";
import { getMainModel } from "./get-main-model";
import { getModelByProfile } from "./get-model-by-profile";
import { registerProviderDescriptor } from "../registry/provider-registry";
import type { ProviderDescriptor } from "../types/model";

describe("profile-based model selection", () => {
  // 这条测试验证“getMainModel 不是随便拿一个模型”，
  // 而是明确走 main profile 对应的 provider / model。
  // 这样 main profile 配置调整时，主模型入口会自动跟着变化。
  it("getMainModel 应该解析到 main profile 对应的模型", () => {
    const minimaxModel = { kind: "minimax-main" } as unknown as BaseChatModel;
    const openaiModel = { kind: "openai-fast" } as unknown as BaseChatModel;

    const minimaxChatCreator = vi.fn(() => minimaxModel);
    const openaiChatCreator = vi.fn(() => openaiModel);

    registerProviderDescriptor({
      id: "minimax",
      capabilities: {
        chat: minimaxChatCreator,
      },
      defaults: {
        structuredMethod: "functionCalling",
      },
    } satisfies ProviderDescriptor);

    registerProviderDescriptor({
      id: "openai",
      capabilities: {
        chat: openaiChatCreator,
      },
      defaults: {
        structuredMethod: "functionCalling",
      },
    } satisfies ProviderDescriptor);

    const externalConfig = {
      defaultProfile: "main" as const,
      profiles: {
        main: {
          provider: "minimax" as const,
          model: "minimax-m2.7",
          temperature: 0,
        },
        fast: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          temperature: 0,
        },
      },
      providers: {
        minimax: {
          apiKey: "test-minimax-key",
        },
        openai: {
          apiKey: "test-openai-key",
        },
      },
    };

    const mainModel = getMainModel(externalConfig);

    expect(mainModel).toBe(minimaxModel);
    expect(minimaxChatCreator).toHaveBeenCalledTimes(1);
    expect(openaiChatCreator).not.toHaveBeenCalled();
  });

  // 这条测试验证“getModelByProfile(profile) 会按请求的 profile 选模型”。
  // 这里专门测 fast，是为了证明 profile 入口和 main 入口是分开的，
  // 不会不小心全部都落到同一个默认 provider 上。
  it("getModelByProfile 应该解析到指定 profile 对应的模型", () => {
    const minimaxModel = { kind: "minimax-main" } as unknown as BaseChatModel;
    const openaiModel = { kind: "openai-fast" } as unknown as BaseChatModel;

    const minimaxChatCreator = vi.fn(() => minimaxModel);
    const openaiChatCreator = vi.fn(() => openaiModel);

    registerProviderDescriptor({
      id: "minimax",
      capabilities: {
        chat: minimaxChatCreator,
      },
      defaults: {
        structuredMethod: "functionCalling",
      },
    } satisfies ProviderDescriptor);

    registerProviderDescriptor({
      id: "openai",
      capabilities: {
        chat: openaiChatCreator,
      },
      defaults: {
        structuredMethod: "functionCalling",
      },
    } satisfies ProviderDescriptor);

    const externalConfig = {
      defaultProfile: "main" as const,
      profiles: {
        main: {
          provider: "minimax" as const,
          model: "minimax-m2.7",
          temperature: 0,
        },
        fast: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          temperature: 0,
        },
      },
      providers: {
        minimax: {
          apiKey: "test-minimax-key",
        },
        openai: {
          apiKey: "test-openai-key",
        },
      },
    };

    const fastModel = getModelByProfile("fast", externalConfig);

    expect(fastModel).toBe(openaiModel);
    expect(openaiChatCreator).toHaveBeenCalledTimes(1);
    expect(minimaxChatCreator).not.toHaveBeenCalled();
  });
});
