"use client";

import type { AssembledTemplate } from "@figame/template-system";
import { useEffect, useMemo, useState } from "react";
import { MonacoEditorPane } from "../editor/monaco-editor-pane";
import { PreviewPane } from "../preview/preview-pane";
import { useWebcontainerSession } from "../runtime/use-webcontainer-session";
import { buildFileTree, type FileTreeNode } from "../services/build-file-tree";
import { TerminalPane } from "../terminal/terminal-pane";

type WorkspaceMode = "code" | "preview";

type ProjectPreviewWorkspaceProps = {
  template: AssembledTemplate;
  templateLabel: string;
};

const STATUS_LABELS = {
  booting: "正在启动浏览器运行时",
  error: "运行时启动失败",
  idle: "等待初始化",
  installing: "正在安装依赖",
  mounting: "正在挂载模板文件",
  ready: "开发服务已就绪",
  starting: "正在启动开发服务",
  stopped: "开发服务已停止",
  unsupported: "当前浏览器环境不支持 WebContainer",
} as const;

export function ProjectPreviewWorkspace({
  template,
  templateLabel,
}: ProjectPreviewWorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>("code");
  const [activeFilePath, setActiveFilePath] = useState(template.preview.activeFile);
  const [files, setFiles] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(template.files).map(([path, file]) => [path, file.code]),
    ),
  );

  const fileTree = useMemo(() => buildFileTree(Object.keys(files)), [files]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(collectDirectoryPaths(fileTree)),
  );

  const session = useWebcontainerSession({ template });
  const activeFileCode = files[activeFilePath] ?? "";
  const statusLabel = STATUS_LABELS[session.status];
  const writeFile = session.writeFile;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void writeFile(activeFilePath, activeFileCode);
    }, 200);

    return () => window.clearTimeout(handle);
  }, [activeFileCode, activeFilePath, writeFile]);

  const handleFileChange = (nextValue: string) => {
    setFiles((current) => ({
      ...current,
      [activeFilePath]: nextValue,
    }));
  };

  const toggleDirectory = (path: string) => {
    setExpandedPaths((current) => {
      const nextValue = new Set(current);

      if (nextValue.has(path)) {
        nextValue.delete(path);
      } else {
        nextValue.add(path);
      }

      return nextValue;
    });
  };

  return (
    <section className="flex min-h-[calc(100vh-56px)] min-w-0 flex-1 flex-col">
      <header className="flex h-12 items-center justify-between border-b border-slate-200 bg-[#f7f4ec] px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Project Preview
          </p>
          <h2 className="truncate text-sm font-semibold text-slate-950">
            {templateLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge label={statusLabel} tone={session.status} />
          <ActionButton
            label="重装依赖"
            onClick={() => void session.reinstallDependencies()}
          />
          <ActionButton
            label="重启服务"
            onClick={() => void session.startDevServer()}
          />
          <ActionButton label="停止服务" onClick={session.stopDevServer} />
          <ModeButton
            isActive={mode === "code"}
            label="代码"
            onClick={() => setMode("code")}
          />
          <ModeButton
            isActive={mode === "preview"}
            label="预览"
            onClick={() => setMode("preview")}
          />
        </div>
      </header>

      {mode === "code" ? (
        <div className="flex min-h-0 flex-1 bg-white">
          <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-[#fbfaf6]">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Files
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
              <div className="space-y-1">
                {fileTree.map((node) => (
                  <FileTreeItem
                    activePath={activeFilePath}
                    expandedPaths={expandedPaths}
                    key={node.path}
                    node={node}
                    onSelect={setActiveFilePath}
                    onToggle={toggleDirectory}
                  />
                ))}
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex h-10 items-center justify-between border-b border-slate-200 px-4 text-sm">
              <span className="font-medium text-slate-950">
                {activeFilePath.slice(1)}
              </span>
              <span className="text-slate-400">Monaco Editor</span>
            </div>
            <div className="min-h-0 flex-1">
              <MonacoEditorPane
                filePath={activeFilePath}
                files={files}
                onActiveFileChange={setActiveFilePath}
                value={activeFileCode}
                onChange={handleFileChange}
              />
            </div>
            <div className="h-64 border-t border-slate-200">
              <TerminalPane
                isInteractive={session.isTerminalReady}
                output={session.output}
                onData={session.sendTerminalInput}
                onResize={session.resizeTerminal}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 bg-white">
          <PreviewPane
            errorMessage={session.errorMessage}
            previewUrl={session.previewUrl}
            statusLabel={statusLabel}
          />
        </div>
      )}
    </section>
  );
}

type ModeButtonProps = {
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function ModeButton({ isActive, label, onClick }: ModeButtonProps) {
  return (
    <button
      aria-pressed={isActive}
      className={[
        "h-9 rounded-md border px-3 text-sm font-medium transition",
        isActive
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

type ActionButtonProps = {
  label: string;
  onClick: () => void;
};

function ActionButton({ label, onClick }: ActionButtonProps) {
  return (
    <button
      className="hidden h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:border-slate-400 lg:inline-flex lg:items-center"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

type StatusBadgeProps = {
  label: string;
  tone: keyof typeof STATUS_LABELS;
};

function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneClassName =
    tone === "error"
      ? "bg-rose-100 text-rose-700"
      : tone === "ready"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-200 text-slate-700";

  return (
    <div
      className={`hidden h-9 items-center rounded-md px-3 text-sm font-medium lg:inline-flex ${toneClassName}`}
    >
      {label}
    </div>
  );
}

type FileTreeItemProps = {
  activePath: string;
  expandedPaths: Set<string>;
  node: FileTreeNode;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
};

function FileTreeItem({
  activePath,
  expandedPaths,
  node,
  onSelect,
  onToggle,
}: FileTreeItemProps) {
  const isDirectory = node.kind === "directory";
  const isExpanded = expandedPaths.has(node.path);
  const isActive = activePath === node.path;

  return (
    <div className="relative">
      <button
        className={[
          "relative flex h-8 w-full items-center gap-2 px-2 text-left text-sm transition",
          "before:absolute before:-left-2 before:top-1/2 before:h-px before:w-2 before:bg-slate-200",
          isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
        onClick={() => {
          if (isDirectory) {
            onToggle(node.path);
            return;
          }

          onSelect(node.path);
        }}
        type="button"
      >
        {isDirectory ? (
          <span className="w-4 text-xs text-slate-400">
            {isExpanded ? "▾" : "▸"}
          </span>
        ) : (
          <span className="w-4 text-xs text-slate-300">•</span>
        )}
        <span>{node.name}</span>
      </button>

      {isDirectory && isExpanded ? (
        <div className="ml-4 border-l border-slate-200 pl-2">
          {node.children.map((child) => (
            <FileTreeItem
              activePath={activePath}
              expandedPaths={expandedPaths}
              key={child.path}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function collectDirectoryPaths(nodes: FileTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.kind === "directory"
      ? [node.path, ...collectDirectoryPaths(node.children)]
      : [],
  );
}
