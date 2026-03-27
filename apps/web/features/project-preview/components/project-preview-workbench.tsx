import type { SandpackTemplateResult } from "@figame/sandpack-runtime";
import { ChatSidebarPlaceholder } from "./chat-sidebar-placeholder";
import { ProjectPreviewWorkspace } from "./project-preview-workspace";

type ProjectPreviewWorkbenchProps = {
  sandpackTemplate: SandpackTemplateResult;
  templateLabel: string;
};

export function ProjectPreviewWorkbench({
  sandpackTemplate,
  templateLabel,
}: ProjectPreviewWorkbenchProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.24),_transparent_30%),linear-gradient(180deg,_#f7f5ef_0%,_#ece6d7_100%)] px-4 py-6 text-slate-950 md:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 lg:flex-row">
        <ProjectPreviewWorkspace
          templateLabel={templateLabel}
          sandpackTemplate={sandpackTemplate}
        />
        <ChatSidebarPlaceholder />
      </div>
    </main>
  );
}
