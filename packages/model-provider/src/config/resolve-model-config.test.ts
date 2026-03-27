import { describe, expect, it } from "vitest";
import type { ModelConfig } from "../types/config";
import { resolveModelConfig } from "./resolve-model-config";

describe("resolveModelConfig", () => {
  // 这条测试验证“运行时参数优先级最高”。
  // 因为 model-provider 的核心承诺之一就是：
  // options > externalConfig > projectConfig > env > defaults
  // 如果这里失效，后面的 flow 或 UI 临时切换模型就会失真。
  it("运行时参数应该覆盖外部配置", () => {
    const externalConfig: Partial<ModelConfig> = {
      defaultProfile: "main",
      profiles: {
        main: {
          provider: "deepseek",
          model: "deepseek-chat",
          temperature: 0,
          maxTokens: 4096,
        },
      },
      providers: {
        deepseek: {
          apiKey: "external-deepseek-key",
          baseURL: "https://api.deepseek.com",
        },
      },
    };

    const resolved = resolveModelConfig(externalConfig, {
      profile: "main",
      provider: "openai",
      model: "gpt-4o-mini",
      apiKey: "runtime-openai-key",
      temperature: 0.3,
    });

    expect(resolved.profile).toBe("main");
    expect(resolved.provider).toBe("openai");
    expect(resolved.model).toBe("gpt-4o-mini");
    expect(resolved.apiKey).toBe("runtime-openai-key");
    expect(resolved.temperature).toBe(0.3);
  });

  // 这条测试验证“profile 路由是否真的读取了项目配置”。
  // 这里不传 externalConfig，只传 profile 和运行时 apiKey，
  // 目标是确认 fast profile 会默认解析到 openai / gpt-4o-mini。
  it("选择已知 profile 时应该使用项目配置", () => {
    const resolved = resolveModelConfig(undefined, {
      profile: "fast",
      apiKey: "runtime-openai-key",
    });

    expect(resolved.profile).toBe("fast");
    expect(resolved.provider).toBe("openai");
    expect(resolved.model).toBe("gpt-4o-mini");
    expect(resolved.apiKey).toBe("runtime-openai-key");
  });

  // 这条测试验证“缺少 API key 时要尽早失败”。
  // 这个行为很重要，因为 provider 缺 key 如果不在配置层报错，
  // 错误就会拖到真正请求模型时才暴露，定位会困难很多。
  it("当选中的 provider 没有 API key 时应该抛错", () => {
    const externalConfig: Partial<ModelConfig> = {
      defaultProfile: "main",
      profiles: {
        main: {
          provider: "openai",
          model: "gpt-4o-mini",
        },
      },
      providers: {
        openai: {},
      },
    };

    expect(() =>
      resolveModelConfig(externalConfig, { profile: "main" }),
    ).toThrow(/Missing API key/);
  });
});
