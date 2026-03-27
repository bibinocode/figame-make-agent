import type { ProviderDescriptor } from "../types/model";
import type { ModelCapability } from "../types/provider";
import { UnsupportedCapabilityError } from "../types/errors";

/**
 * 断言某个 provider 是否支持指定 capability
 *
 * 为什么要单独抽这个函数：
 * - 工厂层会频繁做“能力检查”
 * - 单独抽出来后，错误信息会更统一
 * - 后面 chat / embedding / vision 都能复用
 */
export function assertCapability(
  descriptor: ProviderDescriptor,
  capability: ModelCapability,
): void {
  const supported = Boolean(descriptor.capabilities[capability]);

  if (!supported) {
    throw new UnsupportedCapabilityError(descriptor.id, capability);
  }
}
