import { resolve } from "node:path";
import { getTemplate } from "@figame/template-system";
import type { AssembledTemplate } from "@figame/template-system";

export async function getDemoTemplate(): Promise<AssembledTemplate> {
  // web 应用运行时当前工作目录是 apps/web，所以这里显式回到仓库根下的 templates 目录。
  const templatesRoot = resolve(process.cwd(), "../../templates");

  return getTemplate("react-ts", { templatesRoot });
}
