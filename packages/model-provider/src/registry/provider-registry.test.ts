import { describe, expect, it } from "vitest";
import type { ProviderDescriptor } from "../types/model";
import {
  getProviderDescriptor,
  listProviderDescriptors,
  registerProviderDescriptor,
} from "./provider-registry";

describe("provider-registry", () => {
  // 这条测试验证“注册之后能取回同一个 descriptor”。
  // registry 是整个 provider 系统的入口，如果这里不稳定，
  // 后面的 getChatModel / getStructuredModel 就都不可信了。
  it("注册 provider 后应该能正确取回 descriptor", () => {
    const descriptor: ProviderDescriptor = {
      id: "openai",
      capabilities: {},
      defaults: {
        structuredMethod: "functionCalling",
      },
    };

    registerProviderDescriptor(descriptor);

    expect(getProviderDescriptor("openai")).toEqual(descriptor);
    expect(listProviderDescriptors()).toHaveLength(1);
  });

  // 这条测试验证“未注册的 provider 要立刻报错”。
  // 这是为了避免系统静默返回 undefined，导致后面在更深层的位置才炸。
  it("当 provider 没有注册时应该抛错", () => {
    expect(() => getProviderDescriptor("deepseek")).toThrow(
      /Unsupported provider/,
    );
  });

  // 这条测试验证“重复注册同名 provider 时不能静默覆盖”。
  // 如果这里允许覆盖，系统初始化顺序一变，最终生效的 provider 实现就会不可预测。
  it("重复注册相同 provider 时应该抛错", () => {
    const firstDescriptor: ProviderDescriptor = {
      id: "openai",
      capabilities: {},
      defaults: {
        structuredMethod: "functionCalling",
      },
    };

    const secondDescriptor: ProviderDescriptor = {
      id: "openai",
      capabilities: {},
      defaults: {
        structuredMethod: "jsonSchema",
      },
    };

    registerProviderDescriptor(firstDescriptor);

    expect(() => registerProviderDescriptor(secondDescriptor)).toThrow(
      /already registered/i,
    );
    expect(getProviderDescriptor("openai")).toEqual(firstDescriptor);
  });
});
