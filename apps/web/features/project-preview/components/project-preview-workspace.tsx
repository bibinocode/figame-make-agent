"use client";

import { useState } from "react";
import type { SandpackTemplateResult } from "@figame/sandpack-runtime";
import { SandpackPreviewPanel } from "../sandpack/sandpack-preview-panel";

type ProjectPreviewWorkspaceProps = {
  templateLabel: string;
  sandpackTemplate: SandpackTemplateResult;
};

type WorkspaceMode = "code" | "preview";

export function ProjectPreviewWorkspace({
  templateLabel,
  sandpackTemplate,
}: ProjectPreviewWorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>("code");

  return (
    <section className="flex min-h-[640px] flex-1 flex-col rounded-[28px] border border-black/8 bg-white/88 shadow-[0_24px_80px_rgba(16,24,40,0.12)] backdrop-blur">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/6 px-6 py-5">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-600">
            Project Preview
          </p>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{templateLabel}</h2>
            <p className="text-sm text-slate-500">
              模板已经完成装配，现在可以在代码和预览之间切换。
            </p>
          </div>
        </div>

        <div
          className="inline-flex rounded-full border border-black/8 bg-slate-100 p-1"
          role="tablist"
          aria-label="项目预览模式"
        >
          <ModeButton
            label="代码"
            isActive={mode === "code"}
            onClick={() => setMode("code")}
          />
          <ModeButton
            label="预览"
            isActive={mode === "preview"}
            onClick={() => setMode("preview")}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col p-4">
        <SandpackPreviewPanel mode={mode} sandpackTemplate={sandpackTemplate} />
      </div>
    </section>
  );
}

type ModeButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function ModeButton({ label, isActive, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.2)]"
          : "text-slate-500 hover:text-slate-900",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
