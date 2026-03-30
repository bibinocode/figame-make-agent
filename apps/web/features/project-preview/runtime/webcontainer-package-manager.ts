export const PNPM_VERSION = "9.15.3";
export const PNPM_REGISTRY_URL = "https://registry.npmmirror.com";

export type WebcontainerCommand = {
  args: string[];
  command: string;
  label: string;
};

export function getWebcontainerBootstrapCommand(): WebcontainerCommand | null {
  return null;
}

export function getWebcontainerInstallCommand(): WebcontainerCommand {
  return {
    args: ["install"],
    command: "pnpm",
    label: "$ pnpm install",
  };
}

export function getWebcontainerDevCommand(): WebcontainerCommand {
  return {
    args: ["dev"],
    command: "pnpm",
    label: "$ pnpm dev",
  };
}

export function getWebcontainerNpmrcPath() {
  return "/.npmrc";
}

export function getWebcontainerNpmrcContents() {
  return `registry=${PNPM_REGISTRY_URL}\n`;
}
