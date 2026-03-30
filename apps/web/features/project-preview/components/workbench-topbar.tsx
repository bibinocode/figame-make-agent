type WorkbenchTopbarProps = {
  mcpLabels: string[];
  projectTitle: string;
  skillLabels: string[];
};

export function WorkbenchTopbar({
  mcpLabels,
  projectTitle,
  skillLabels,
}: WorkbenchTopbarProps) {
  return (
    <header className="flex h-11 items-center justify-between border-b border-[var(--workbench-line)] bg-[var(--workbench-panel)] px-4 text-[var(--workbench-text)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center border border-[var(--workbench-line)] bg-[var(--workbench-surface)] font-mono text-[11px] font-semibold text-[var(--workbench-chrome)]">
          FA
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="truncate font-medium text-[var(--workbench-text)]">
              {projectTitle}
            </span>
            <span className="h-1.5 w-1.5 bg-[var(--workbench-success)]" />
            <span className="text-xs text-[var(--workbench-muted)]">
              本地工作区
            </span>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        {mcpLabels.map((label) => (
          <ToolbarChip key={`mcp-${label}`} label={label} prefix="MCP" />
        ))}
        {skillLabels.map((label) => (
          <ToolbarChip key={`skill-${label}`} label={label} prefix="Skill" />
        ))}
      </div>
    </header>
  );
}

type ToolbarChipProps = {
  label: string;
  prefix: "MCP" | "Skill";
};

function ToolbarChip({ label, prefix }: ToolbarChipProps) {
  return (
    <div className="inline-flex h-7 items-center gap-2 border border-[var(--workbench-line)] bg-[var(--workbench-surface)] px-2.5 text-xs font-medium text-[var(--workbench-muted)]">
      <span className="font-mono uppercase tracking-[0.12em] text-[10px] text-[var(--workbench-accent)]">
        {prefix}
      </span>
      <span>{label}</span>
    </div>
  );
}
