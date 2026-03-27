import { resolve } from "node:path";
import { createSandpackTemplate } from "@figame/sandpack-runtime";
import type { SandpackTemplateResult } from "@figame/sandpack-runtime";
import { getTemplate } from "@figame/template-system";

export async function getDemoSandpackTemplate(): Promise<SandpackTemplateResult> {
  // web 包当前是从 apps/web 目录启动，所以这里显式回到仓库 templates 根目录。
  const templatesRoot = resolve(process.cwd(), "../../templates");
  const template = await getTemplate("react-ts", { templatesRoot });

  return createSandpackTemplate(template);
}
