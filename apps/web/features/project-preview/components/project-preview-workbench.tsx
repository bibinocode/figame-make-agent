import type { CSSProperties } from "react";
import type { AssembledTemplate } from "@figame/template-system";
import { WORKBENCH_UI_SKILL_PRESET } from "../design/workbench-ui-skill-preset";
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
  const themeStyle = {
    "--workbench-accent": WORKBENCH_UI_SKILL_PRESET.colors.accent,
    "--workbench-accent-soft": WORKBENCH_UI_SKILL_PRESET.colors.accentSoft,
    "--workbench-accent-strong": WORKBENCH_UI_SKILL_PRESET.colors.accentStrong,
    "--workbench-canvas": WORKBENCH_UI_SKILL_PRESET.colors.canvas,
    "--workbench-chrome": WORKBENCH_UI_SKILL_PRESET.colors.chrome,
    "--workbench-line": WORKBENCH_UI_SKILL_PRESET.colors.line,
    "--workbench-muted": WORKBENCH_UI_SKILL_PRESET.colors.muted,
    "--workbench-panel": WORKBENCH_UI_SKILL_PRESET.colors.panel,
    "--workbench-panel-muted": WORKBENCH_UI_SKILL_PRESET.colors.panelMuted,
    "--workbench-success": WORKBENCH_UI_SKILL_PRESET.colors.success,
    "--workbench-surface": WORKBENCH_UI_SKILL_PRESET.colors.surface,
    "--workbench-surface-alt": WORKBENCH_UI_SKILL_PRESET.colors.surfaceAlt,
    "--workbench-terminal": WORKBENCH_UI_SKILL_PRESET.colors.terminal,
    "--workbench-terminal-border":
      WORKBENCH_UI_SKILL_PRESET.colors.terminalBorder,
    "--workbench-text": WORKBENCH_UI_SKILL_PRESET.colors.text,
    "--workbench-transition-fast": WORKBENCH_UI_SKILL_PRESET.motion.fast,
    "--workbench-transition-normal": WORKBENCH_UI_SKILL_PRESET.motion.normal,
    "--workbench-transition-slow": WORKBENCH_UI_SKILL_PRESET.motion.slow,
  } as CSSProperties;

  return (
    <div
      className="figame-workbench-theme h-screen overflow-hidden bg-[var(--workbench-canvas)] text-[var(--workbench-text)]"
      style={themeStyle}
    >
      <WorkbenchTopbar
        mcpLabels={["WebContainer", "Ollama"]}
        projectTitle={templateLabel}
        skillLabels={["UI/UX Pro Max"]}
      />

      <main className="flex h-[calc(100vh-44px)] overflow-hidden">
        <ProjectPreviewWorkspace
          template={template}
          templateLabel={templateLabel}
        />
        <ChatSidebarPlaceholder activeFilePath={template.preview.activeFile} />
      </main>
    </div>
  );
}
