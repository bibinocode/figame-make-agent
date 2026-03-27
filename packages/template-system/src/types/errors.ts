export class TemplateNotFoundError extends Error {
  constructor(templateId: string, templatesRoot: string) {
    super(`Template "${templateId}" was not found under "${templatesRoot}".`);
    this.name = "TemplateNotFoundError";
  }
}

export class TemplateManifestParseError extends Error {
  cause?: unknown;

  constructor(manifestPath: string, cause?: unknown) {
    super(`Failed to parse template manifest at "${manifestPath}".`);
    this.name = "TemplateManifestParseError";
    this.cause = cause;
  }
}

export class TemplateManifestValidationError extends Error {
  constructor(manifestPath: string, details: string) {
    super(`Template manifest at "${manifestPath}" is invalid: ${details}`);
    this.name = "TemplateManifestValidationError";
  }
}

export class TemplateAssembleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateAssembleError";
  }
}

export class TemplatePreviewConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplatePreviewConfigError";
  }
}
