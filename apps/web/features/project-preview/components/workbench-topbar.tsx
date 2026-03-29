type WorkbenchTopbarProps = {
  projectTitle: string;
};

export function WorkbenchTopbar({ projectTitle }: WorkbenchTopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-[#f7f4ec] px-4 text-slate-950 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white">
          FA
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Workspace
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="truncate">本地模板已连接</span>
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 items-center gap-3 px-4 lg:flex">
        <span className="text-sm text-slate-400">当前项目</span>
        <span className="truncate text-sm font-medium text-slate-900">
          {projectTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ToolbarButton label="设置" tone="default" />
        <ToolbarButton label="分享" tone="default" />
        <ToolbarButton label="发布" tone="primary" />
      </div>
    </header>
  );
}

type ToolbarButtonProps = {
  label: string;
  tone: "default" | "primary";
};

function ToolbarButton({ label, tone }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={[
        "h-9 rounded-md border px-3 text-sm font-medium transition",
        tone === "primary"
          ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
