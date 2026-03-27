import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { getStructuredModel } from "./get-structured-model";
import { registerProviderDescriptor } from "../registry/provider-registry";
import type { ProviderDescriptor } from "../types/model";

describe("getStructuredModel", () => {
  // 这条测试验证“structuredMethod 会从 provider descriptor 读取”。
  // 也就是说，structured 的默认策略不是写死在工厂里，
  // 而是由 provider 自己声明，这样后面扩 provider 会更稳。
  it("应该使用 provider descriptor 里声明的 structuredMethod", () => {
    const structuredModel = { kind: "structured-model" };
    const withStructuredOutput = vi.fn(() => structuredModel);

    const fakeChatModel = {
      withStructuredOutput,
    } as any;

    const descriptor: ProviderDescriptor = {
      id: "openai",
      capabilities: {
        chat: vi.fn(() => fakeChatModel),
      },
      defaults: {
        structuredMethod: "jsonSchema",
      },
    };

    registerProviderDescriptor(descriptor);

    const schema = z.object({
      title: z.string(),
    });

    const externalConfig = {
      defaultProfile: "main" as const,
      profiles: {
        main: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          temperature: 0,
        },
      },
      providers: {
        openai: {
          apiKey: "test-openai-key",
        },
      },
    };

    const result = getStructuredModel(schema, externalConfig, {
      profile: "main",
    });

    expect(result).toBe(structuredModel);
    expect(withStructuredOutput).toHaveBeenCalledTimes(1);
    expect(withStructuredOutput).toHaveBeenCalledWith(schema, {
      method: "jsonSchema",
      includeRaw: false,
    });
  });

  // 这条测试验证“provider 没声明 structuredMethod 时会回退到 functionCalling”。
  // 这是一个默认行为保护，避免 descriptor 没配时 structured 入口直接失效。
  it("当 descriptor 没有声明 structuredMethod 时应该回退到 functionCalling", () => {
    const structuredModel = { kind: "structured-model" };
    const withStructuredOutput = vi.fn(() => structuredModel);

    const fakeChatModel = {
      withStructuredOutput,
    } as any;

    const descriptor: ProviderDescriptor = {
      id: "deepseek",
      capabilities: {
        chat: vi.fn(() => fakeChatModel),
      },
      defaults: {},
    };

    registerProviderDescriptor(descriptor);

    const schema = z.object({
      answer: z.string(),
    });

    const externalConfig = {
      defaultProfile: "structured" as const,
      profiles: {
        structured: {
          provider: "deepseek" as const,
          model: "deepseek-chat",
          temperature: 0,
        },
      },
      providers: {
        deepseek: {
          apiKey: "test-deepseek-key",
        },
      },
    };

    getStructuredModel(schema, externalConfig, {
      profile: "structured",
    });

    expect(withStructuredOutput).toHaveBeenCalledWith(schema, {
      method: "functionCalling",
      includeRaw: false,
    });
  });
});
