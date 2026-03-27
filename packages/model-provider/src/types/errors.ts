export class UnsupportedProviderError extends Error {
  constructor(provider: string) {
    super(`Unsupported provider: ${provider}`);
    this.name = "UnsupportedProviderError";
  }
}

export class UnsupportedCapabilityError extends Error {
  constructor(provider: string, capability: string) {
    super(`Provider "${provider}" does not support capability "${capability}"`);
    this.name = "UnsupportedCapabilityError";
  }
}

export class MissingApiKeyError extends Error {
  constructor(provider: string) {
    super(`Missing API key for provider "${provider}"`);
    this.name = "MissingApiKeyError";
  }
}

export class InvalidProfileError extends Error {
  constructor(profile: string) {
    super(`Invalid model profile: ${profile}`);
    this.name = "InvalidProfileError";
  }
}

export class MissingProviderConfigError extends Error {
  constructor(provider: string) {
    super(`Missing provider config for "${provider}"`);
    this.name = "MissingProviderConfigError";
  }
}

export class MissingProfileConfigError extends Error {
  constructor(profile: string) {
    super(`Missing model profile config for "${profile}"`);
    this.name = "MissingProfileConfigError";
  }
}
