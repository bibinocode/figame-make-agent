import { ProjectPreviewWorkbench } from "@/features/project-preview/components/project-preview-workbench";
import { getDemoSandpackTemplate } from "@/features/project-preview/services/get-demo-sandpack-template";

export default async function Home() {
  const sandpackTemplate = await getDemoSandpackTemplate();

  return (
    <ProjectPreviewWorkbench
      sandpackTemplate={sandpackTemplate}
      templateLabel="React TypeScript"
    />
  );
}
