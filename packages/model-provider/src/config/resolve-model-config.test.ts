import { describe, expect, it, vi } from "vitest";
import type { ModelConfig } from "../types/config";
import * as projectConfigModule from "./project-config";
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

  // 这条测试验证“项目配置优先于环境变量”。
  // 我们显式设置 OPENAI_API_KEY，但仍然要求 main profile 走项目配置里的 minimax。
  // 这样可以锁住“项目默认策略覆盖环境兜底”的约定。
  it("项目配置应该优先于环境变量中的默认选择", () => {
    process.env.FIGAME_DEFAULT_PROFILE = "fast";
    process.env.OPENAI_API_KEY = "env-openai-key";
    process.env.MINIMAX_API_KEY = "env-minimax-key";

    const resolved = resolveModelConfig(undefined, {
      apiKey: "runtime-minimax-key",
    });

    expect(resolved.profile).toBe("main");
    expect(resolved.provider).toBe("minimax");
    expect(resolved.model).toBe("minimax-m2.7");
    expect(resolved.apiKey).toBe("runtime-minimax-key");
  });

  // 这条测试验证“externalConfig 优先于项目配置”。
  // 这样后面 flow 或调用方临时注入一套配置时，能够稳定覆盖掉项目默认值。
  it("外部传入的配置应该优先于项目配置", () => {
    const externalConfig: Partial<ModelConfig> = {
      defaultProfile: "main",
      profiles: {
        main: {
          provider: "deepseek",
          model: "deepseek-reasoner",
          temperature: 0,
          maxTokens: 8192,
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
    });

    expect(resolved.profile).toBe("main");
    expect(resolved.provider).toBe("deepseek");
    expect(resolved.model).toBe("deepseek-reasoner");
    expect(resolved.apiKey).toBe("external-deepseek-key");
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

  // 这条测试验证“project-config 模块被替换时，resolver 会真实读取替换结果”。
  // 这样后面如果我们想在测试里精确控制项目配置来源，就不会被静态导入卡住。
  it("应该读取 project-config 模块当前返回的配置", () => {
    vi.spyOn(projectConfigModule, "getProjectModelConfig").mockReturnValue({
      defaultProfile: "planner",
      profiles: {
        planner: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.1,
        },
      },
      providers: {
        openai: {
          apiKey: "mocked-project-openai-key",
        },
      },
    });

    const resolved = resolveModelConfig(undefined, {
      profile: "planner",
    });

    expect(resolved.profile).toBe("planner");
    expect(resolved.provider).toBe("openai");
    expect(resolved.model).toBe("gpt-4o");
    expect(resolved.apiKey).toBe("mocked-project-openai-key");
    expect(resolved.temperature).toBe(0.1);
  });
});
