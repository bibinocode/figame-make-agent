import type { GetModelOptions, ModelConfig } from "../types/config";
import type { ProfileId } from "../types/provider";
import { InvalidProfileError } from "../types/errors";

export function resolveProfile(
  options?: GetModelOptions,
  config?: Partial<ModelConfig>,
): ProfileId {
  const profile = options?.profile ?? config?.defaultProfile ?? "main";

  if (!profile) {
    throw new InvalidProfileError("unknown");
  }

  return profile;
}
