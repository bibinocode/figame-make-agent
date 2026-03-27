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

  // 这条测试验证“structured 层不会把不同 schema 的包装结果缓存成同一个对象”。
  // 当前设计里，缓存的是底层 chat model，而不是结构化包装后的结果。
  // 这样不同 schema 才不会互相污染，但底层模型实例仍然可以复用。
  it("应该复用底层 chat model，但不复用不同 schema 的 structured 包装结果", () => {
    const structuredModelA = { kind: "structured-model-a" };
    const structuredModelB = { kind: "structured-model-b" };

    const withStructuredOutput = vi
      .fn()
      .mockReturnValueOnce(structuredModelA)
      .mockReturnValueOnce(structuredModelB);

    const fakeChatModel = {
      withStructuredOutput,
    } as any;

    const chatCreator = vi.fn(() => fakeChatModel);

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
        },
      },
      providers: {
        openai: {
          apiKey: "test-openai-key",
        },
      },
    };

    const schemaA = z.object({
      title: z.string(),
    });

    const schemaB = z.object({
      answer: z.string(),
    });

    const resultA = getStructuredModel(schemaA, externalConfig, {
      profile: "main",
    });

    const resultB = getStructuredModel(schemaB, externalConfig, {
      profile: "main",
    });

    expect(resultA).toBe(structuredModelA);
    expect(resultB).toBe(structuredModelB);
    expect(chatCreator).toHaveBeenCalledTimes(1);
    expect(withStructuredOutput).toHaveBeenCalledTimes(2);
    expect(withStructuredOutput).toHaveBeenNthCalledWith(1, schemaA, {
      method: "functionCalling",
      includeRaw: false,
    });
    expect(withStructuredOutput).toHaveBeenNthCalledWith(2, schemaB, {
      method: "functionCalling",
      includeRaw: false,
    });
  });
});
