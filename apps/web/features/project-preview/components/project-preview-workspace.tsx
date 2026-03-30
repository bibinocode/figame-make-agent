"use client";

import type { AssembledTemplate } from "@figame/template-system";
import { useEffect, useMemo, useState } from "react";
import { MonacoEditorPane } from "../editor/monaco-editor-pane";
import { PreviewPane } from "../preview/preview-pane";
import { useWebcontainerSession } from "../runtime/use-webcontainer-session";
import { buildFileTree, type FileTreeNode } from "../services/build-file-tree";
import { useWorkbenchLayoutStore } from "../state/use-workbench-layout-store";
import { TerminalPane } from "../terminal/terminal-pane";

type WorkspaceMode = "code" | "preview";

type ProjectPreviewWorkspaceProps = {
  template: AssembledTemplate;
  templateLabel: string;
};

const STATUS_LABELS = {
  booting: "正在启动 WebContainer",
  error: "运行时启动失败",
  idle: "等待初始化",
  installing: "正在安装依赖",
  mounting: "正在挂载模板文件",
  ready: "开发服务已就绪",
  starting: "正在启动开发服务",
  stopped: "开发服务已停止",
  unsupported: "当前环境不支持 WebContainer",
} as const;

const PANE_BUTTON_CLASS =
  "inline-flex h-7 items-center border border-[var(--workbench-line)] bg-[var(--workbench-surface)] px-2 text-xs font-medium text-[var(--workbench-muted)] transition-colors duration-[var(--workbench-transition-fast)] hover:border-[var(--workbench-accent)] hover:text-[var(--workbench-text)]";

export function ProjectPreviewWorkspace({
  template,
  templateLabel,
}: ProjectPreviewWorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>("code");
  const [activeFilePath, setActiveFilePath] = useState(
    template.preview.activeFile,
  );
  const [files, setFiles] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(template.files).map(([path, file]) => [path, file.code]),
    ),
  );

  const filePaneWidth = useWorkbenchLayoutStore((state) => state.filePaneWidth);
  const terminalPaneHeight = useWorkbenchLayoutStore(
    (state) => state.terminalPaneHeight,
  );
  const isFilePaneCollapsed = useWorkbenchLayoutStore(
    (state) => state.isFilePaneCollapsed,
  );
  const isTerminalCollapsed = useWorkbenchLayoutStore(
    (state) => state.isTerminalCollapsed,
  );
  const setFilePaneWidth = useWorkbenchLayoutStore(
    (state) => state.setFilePaneWidth,
  );
  const setTerminalPaneHeight = useWorkbenchLayoutStore(
    (state) => state.setTerminalPaneHeight,
  );
  const toggleFilePane = useWorkbenchLayoutStore((state) => state.toggleFilePane);
  const toggleTerminal = useWorkbenchLayoutStore((state) => state.toggleTerminal);

  const fileTree = useMemo(() => buildFileTree(Object.keys(files)), [files]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(collectDirectoryPaths(fileTree)),
  );

  const session = useWebcontainerSession({ template });
  const activeFileCode = files[activeFilePath] ?? "";
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

  const beginFilePaneResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = filePaneWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setFilePaneWidth(startWidth + moveEvent.clientX - startX);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const beginTerminalResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = terminalPaneHeight;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setTerminalPaneHeight(startHeight - (moveEvent.clientY - startY));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r border-[var(--workbench-line)] bg-[var(--workbench-surface)]">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--workbench-line)] bg-[var(--workbench-panel)] px-4">
        <div className="min-w-0 flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-[var(--workbench-text)]">
            {templateLabel}
          </h2>
          <span className="border border-[var(--workbench-line)] bg-[var(--workbench-surface)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--workbench-muted)]">
            IDE
          </span>
        </div>

        <div className="flex items-center gap-2">
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
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-[var(--workbench-surface)]">
          {!isFilePaneCollapsed ? (
            <>
              <aside
                className="flex shrink-0 flex-col border-r border-[var(--workbench-line)] bg-[var(--workbench-panel-muted)]"
                style={{ width: filePaneWidth }}
              >
                <div className="flex h-9 shrink-0 items-center justify-between border-b border-[var(--workbench-line)] px-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--workbench-muted)]">
                    资源管理器
                  </p>
                  <PaneToggleButton
                    label="收起文件栏"
                    onClick={toggleFilePane}
                    shortLabel="收起"
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
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

              <div
                className="group relative w-1 shrink-0 cursor-col-resize bg-[var(--workbench-line)] transition-colors duration-[var(--workbench-transition-fast)] hover:bg-[var(--workbench-accent)]"
                onPointerDown={beginFilePaneResize}
                role="separator"
              >
                <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2" />
              </div>
            </>
          ) : null}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-[var(--workbench-line)] bg-[var(--workbench-surface-alt)] px-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <PaneToggleButton
                  label={isFilePaneCollapsed ? "展开文件栏" : "收起文件栏"}
                  onClick={toggleFilePane}
                  shortLabel="文件"
                />
                <PaneToggleButton
                  label={isTerminalCollapsed ? "展开终端" : "收起终端"}
                  onClick={toggleTerminal}
                  shortLabel="终端"
                />
                <span className="truncate font-mono text-xs text-[var(--workbench-text)]">
                  {activeFilePath.slice(1)}
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--workbench-muted)]">
                Monaco Editor
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <MonacoEditorPane
                filePath={activeFilePath}
                files={files}
                onActiveFileChange={setActiveFilePath}
                onChange={handleFileChange}
                value={activeFileCode}
              />
            </div>

            {!isTerminalCollapsed ? (
              <>
                <div
                  className="relative h-1 shrink-0 cursor-row-resize bg-[var(--workbench-line)] transition-colors duration-[var(--workbench-transition-fast)] hover:bg-[var(--workbench-accent)]"
                  onPointerDown={beginTerminalResize}
                  role="separator"
                >
                  <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2" />
                </div>
                <div
                  className="shrink-0 border-t border-[var(--workbench-terminal-border)]"
                  style={{ height: terminalPaneHeight }}
                >
                  <TerminalPane
                    isInteractive={session.isTerminalReady}
                    onData={session.sendTerminalInput}
                    onResize={session.resizeTerminal}
                    output={session.output}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden bg-[var(--workbench-surface)]">
          <PreviewPane
            errorMessage={session.errorMessage}
            previewUrl={session.previewUrl}
            statusLabel={STATUS_LABELS[session.status]}
          />
        </div>
      )}
    </section>
  );
}

type PaneToggleButtonProps = {
  label: string;
  onClick: () => void;
  shortLabel: string;
};

function PaneToggleButton({
  label,
  onClick,
  shortLabel,
}: PaneToggleButtonProps) {
  return (
    <button
      className={PANE_BUTTON_CLASS}
      onClick={onClick}
      title={label}
      type="button"
    >
      {shortLabel}
    </button>
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
        "h-8 border px-3 text-sm font-medium transition-colors duration-[var(--workbench-transition-fast)]",
        isActive
          ? "border-[var(--workbench-accent)] bg-[var(--workbench-accent)] text-white"
          : "border-[var(--workbench-line)] bg-[var(--workbench-surface)] text-[var(--workbench-muted)] hover:border-[var(--workbench-accent)] hover:text-[var(--workbench-text)]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
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
          "relative flex h-8 w-full items-center gap-2 border-l px-2 text-left text-sm transition-colors duration-[var(--workbench-transition-fast)]",
          isActive
            ? "border-[var(--workbench-accent)] bg-[var(--workbench-accent-soft)] text-[var(--workbench-accent-strong)]"
            : "border-transparent text-[var(--workbench-muted)] hover:bg-[var(--workbench-surface)] hover:text-[var(--workbench-text)]",
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
          <span className="w-4 font-mono text-xs text-[var(--workbench-muted)]">
            {isExpanded ? "v" : ">"}
          </span>
        ) : (
          <span className="w-4 font-mono text-xs text-[var(--workbench-muted)]">
            -
          </span>
        )}
        <span className="truncate font-mono text-xs">{node.name}</span>
      </button>

      {isDirectory && isExpanded ? (
        <div className="ml-3 border-l border-[var(--workbench-line)] pl-2">
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
