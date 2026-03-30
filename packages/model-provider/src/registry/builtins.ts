/**
 * 在这里统一管理内置Provider
 */
import type { ProviderDescriptor } from "../types/model";
import { hasProviderDescriptor, registerProviderDescriptors } from "./provider-registry";
import { deepseekProviderDescriptor } from "../providers/deepseek/descriptor";
import { minimaxProviderDescriptor } from "../providers/minimax/descriptor";
import { ollamaProviderDescriptor } from "../providers/ollama/descriptor";
import { openaiProviderDescriptor } from "../providers/openai/descriptor";

// 统一收口当前项目内置支持的 provider
export const BUILTIN_PROVIDER_DESCRIPTORS: ProviderDescriptor[] = [
  minimaxProviderDescriptor,
  deepseekProviderDescriptor,
  ollamaProviderDescriptor,
  openaiProviderDescriptor,
];

/**
 * 注册所有内置 provider
 * 后面包启动时可以调一次这个函数。
 */
export function registerBuiltinProviders(): void {
  const missingDescriptors = BUILTIN_PROVIDER_DESCRIPTORS.filter(
    (descriptor) => !hasProviderDescriptor(descriptor.id),
  );

  if (missingDescriptors.length === 0) {
    return;
  }

  registerProviderDescriptors(missingDescriptors);
}
