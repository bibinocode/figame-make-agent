export function normalizeTemplatePath(pathValue: string): string {
  const normalizedPath = pathValue.replace(/\\/g, "/");

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}
