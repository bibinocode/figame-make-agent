import type { AssembledTemplate } from "@figame/template-system";
import { ChatSidebarPlaceholder } from "./chat-sidebar-placeholder";
import { ProjectPreviewWorkspace } from "./project-preview-workspace";
import { WorkbenchTopbar } from "./workbench-topbar";

type ProjectPreviewWorkbenchProps = {
  template: AssembledTemplate;
  templateLabel: string;
};

export function ProjectPreviewWorkbench({
  template,
  templateLabel,
}: ProjectPreviewWorkbenchProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#f4f1e8] text-slate-950">
      <WorkbenchTopbar projectTitle="Figame Agent 工作台" />

      <main className="flex h-[calc(100vh-56px)] overflow-hidden">
        <ProjectPreviewWorkspace
          template={template}
          templateLabel={templateLabel}
        />
        <ChatSidebarPlaceholder activeFilePath={template.preview.activeFile} />
      </main>
    </div>
  );
}
