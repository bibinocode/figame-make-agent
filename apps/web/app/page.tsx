import { ProjectPreviewWorkbench } from "@/features/project-preview/components/project-preview-workbench";
import { getDemoTemplate } from "@/features/project-preview/services/get-demo-template";

export default async function Home() {
  const template = await getDemoTemplate();

  return (
    <ProjectPreviewWorkbench
      template={template}
      templateLabel="React TypeScript"
    />
  );
}
