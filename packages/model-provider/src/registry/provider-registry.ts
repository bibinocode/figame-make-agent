import type { ProviderDescriptor } from "../types/model";
import type { ProviderId } from "../types/provider";
import {
  DuplicateProviderRegistrationError,
  UnsupportedProviderError,
} from "../types/errors";

// 用 Map 做注册表，后面查找 provider 会比较直接。
const providerRegistry = new Map<ProviderId, ProviderDescriptor>();

/**
 * 注册单个 provider descriptor
 */
export function registerProviderDescriptor(
  descriptor: ProviderDescriptor,
): void {
  // 同名 provider 只允许注册一次。
  // 这样可以避免初始化顺序变化时，后注册的实现静默覆盖前一个实现。
  if (providerRegistry.has(descriptor.id)) {
    throw new DuplicateProviderRegistrationError(descriptor.id);
  }

  providerRegistry.set(descriptor.id, descriptor);
}

/**
 * 批量注册 provider descriptor
 */
export function registerProviderDescriptors(
  descriptors: ProviderDescriptor[],
): void {
  for (const descriptor of descriptors) {
    registerProviderDescriptor(descriptor);
  }
}

/**
 * 根据 providerId 读取 descriptor
 * 如果没有注册，直接抛错，避免后面静默失败。
 */
export function getProviderDescriptor(
  provider: ProviderId,
): ProviderDescriptor {
  const descriptor = providerRegistry.get(provider);

  if (!descriptor) {
    throw new UnsupportedProviderError(provider);
  }

  return descriptor;
}

/**
 * 返回当前已注册的 provider 列表
 * 这个函数后面在调试、面板展示、测试里都会很有用。
 */
export function listProviderDescriptors(): ProviderDescriptor[] {
  return Array.from(providerRegistry.values());
}

/**
 * 测试时可能需要清空注册表。
 */
export function clearProviderRegistry(): void {
  providerRegistry.clear();
}
