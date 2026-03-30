"use client";

import type { AssembledTemplate } from "@figame/template-system";
import { useEffect, useMemo, useState } from "react";
import { MonacoEditorPane } from "../editor/monaco-editor-pane";
import { PreviewPane } from "../preview/preview-pane";
import { useWebcontainerSession } from "../runtime/use-webcontainer-session";
import { buildFileTree, type FileTreeNode } from "../services/build-file-tree";
import { useWorkbenchLayoutStore } from "../state/use-workbench-layout-store";
import { TerminalPane } from "../terminal/terminal-pane";
import { FileTypeIcon } from "./file-tree-icons";

type WorkspaceMode = "code" | "preview";
type WorkbenchIconName =
  | "chevron-down"
  | "chevron-right"
  | "close"
  | "files"
  | "folder"
  | "folder-open"
  | "preview"
  | "terminal";

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

const ICON_BUTTON_CLASS =
  "inline-flex h-7 w-7 items-center justify-center border border-[var(--workbench-line)] bg-[var(--workbench-surface)] text-[var(--workbench-muted)] transition-colors duration-[var(--workbench-transition-fast)] hover:border-[var(--workbench-accent)] hover:text-[var(--workbench-text)]";

export function ProjectPreviewWorkspace({
  template,
  templateLabel,
}: ProjectPreviewWorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>("code");
  const [activeFilePath, setActiveFilePath] = useState(
    template.preview.activeFile,
  );
  const [openFilePaths, setOpenFilePaths] = useState<string[]>([
    template.preview.activeFile,
  ]);
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
  const statusLabel = STATUS_LABELS[session.status];
  const writeFile = session.writeFile;

  useEffect(() => {
    setOpenFilePaths((current) =>
      current.includes(activeFilePath) ? current : [...current, activeFilePath],
    );
  }, [activeFilePath]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void writeFile(activeFilePath, activeFileCode);
    }, 200);

    return () => window.clearTimeout(handle);
  }, [activeFileCode, activeFilePath, writeFile]);

  const openFile = (path: string) => {
    setActiveFilePath(path);
    setOpenFilePaths((current) =>
      current.includes(path) ? current : [...current, path],
    );
  };

  const closeFile = (path: string) => {
    setOpenFilePaths((current) => {
      const nextTabs = current.filter((item) => item !== path);

      if (path === activeFilePath) {
        const nextActive =
          nextTabs[nextTabs.length - 1] ?? template.preview.activeFile;
        setActiveFilePath(nextActive);
      }

      return nextTabs.length > 0 ? nextTabs : [template.preview.activeFile];
    });
  };

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
            icon="files"
            isActive={mode === "code"}
            label="代码"
            onClick={() => setMode("code")}
          />
          <ModeButton
            icon="preview"
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
                  <div className="flex items-center gap-2">
                    <WorkbenchIcon name="folder-open" />
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--workbench-muted)]">
                      文件
                    </p>
                  </div>
                  <IconButton icon="files" label="收起文件栏" onClick={toggleFilePane} />
                </div>
                <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
                  <div className="space-y-0.5">
                    {fileTree.map((node) => (
                      <FileTreeItem
                        activePath={activeFilePath}
                        depth={0}
                        expandedPaths={expandedPaths}
                        key={node.path}
                        node={node}
                        onSelect={openFile}
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
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[var(--workbench-line)] bg-[var(--workbench-surface-alt)] px-3">
              <IconButton
                icon="files"
                label={isFilePaneCollapsed ? "展开文件栏" : "收起文件栏"}
                onClick={toggleFilePane}
              />
              <IconButton
                icon="terminal"
                label={isTerminalCollapsed ? "展开终端" : "收起终端"}
                onClick={toggleTerminal}
              />

              <div className="min-w-0 flex-1 overflow-x-auto">
                <div className="flex min-w-max items-center">
                  {openFilePaths.map((path) => (
                    <EditorTab
                      active={path === activeFilePath}
                      key={path}
                      path={path}
                      onClose={closeFile}
                      onSelect={openFile}
                    />
                  ))}
                </div>
              </div>

              <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--workbench-muted)] xl:inline">
                Monaco Editor
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <MonacoEditorPane
                filePath={activeFilePath}
                files={files}
                onActiveFileChange={openFile}
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
                  <div className="flex h-8 items-center justify-between border-b border-[var(--workbench-terminal-border)] bg-[var(--workbench-terminal)] px-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <WorkbenchIcon name="terminal" />
                      <span className="font-mono uppercase tracking-[0.16em]">
                        终端
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{statusLabel}</span>
                  </div>
                  <div className="h-[calc(100%-32px)]">
                    <TerminalPane
                      isInteractive={session.isTerminalReady}
                      onData={session.sendTerminalInput}
                      onResize={session.resizeTerminal}
                      output={session.output}
                    />
                  </div>
                </div>
              </>
            ) : (
              <button
                className="flex h-8 shrink-0 items-center justify-between border-t border-[var(--workbench-terminal-border)] bg-[var(--workbench-terminal)] px-3 text-left text-slate-400 transition-colors duration-[var(--workbench-transition-fast)] hover:text-white"
                onClick={toggleTerminal}
                type="button"
              >
                <span className="flex items-center gap-2 text-[11px]">
                  <WorkbenchIcon name="terminal" />
                  <span className="font-mono uppercase tracking-[0.16em]">
                    终端已收起
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">点击展开</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden bg-[var(--workbench-surface)]">
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

type IconButtonProps = {
  icon: WorkbenchIconName;
  label: string;
  onClick: () => void;
};

function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      className={ICON_BUTTON_CLASS}
      onClick={onClick}
      title={label}
      type="button"
    >
      <WorkbenchIcon name={icon} />
    </button>
  );
}

type ModeButtonProps = {
  icon: WorkbenchIconName;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function ModeButton({ icon, isActive, label, onClick }: ModeButtonProps) {
  return (
    <button
      aria-pressed={isActive}
      className={[
        "inline-flex h-8 items-center gap-2 border px-3 text-sm font-medium transition-colors duration-[var(--workbench-transition-fast)]",
        isActive
          ? "border-[var(--workbench-accent)] bg-[var(--workbench-accent)] text-white"
          : "border-[var(--workbench-line)] bg-[var(--workbench-surface)] text-[var(--workbench-muted)] hover:border-[var(--workbench-accent)] hover:text-[var(--workbench-text)]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <WorkbenchIcon name={icon} />
      {label}
    </button>
  );
}

type EditorTabProps = {
  active: boolean;
  path: string;
  onClose: (path: string) => void;
  onSelect: (path: string) => void;
};

function EditorTab({ active, path, onClose, onSelect }: EditorTabProps) {
  const fileName = path.split("/").filter(Boolean).pop() ?? path;

  return (
    <div
      className={[
        "group flex h-8 items-center gap-2 border-r px-3 text-xs transition-colors duration-[var(--workbench-transition-fast)]",
        active
          ? "border-[var(--workbench-line)] bg-[var(--workbench-surface)] text-[var(--workbench-text)]"
          : "border-transparent text-[var(--workbench-muted)] hover:bg-[var(--workbench-panel)] hover:text-[var(--workbench-text)]",
      ].join(" ")}
    >
      <button
        className="flex min-w-0 items-center gap-2"
        onClick={() => onSelect(path)}
        type="button"
      >
        <FileTypeIcon className="h-4 w-4 shrink-0" path={path} />
        <span className="truncate font-mono">{fileName}</span>
      </button>
      <button
        className="text-[var(--workbench-muted)] opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onClose(path)}
        type="button"
      >
        <WorkbenchIcon name="close" />
      </button>
    </div>
  );
}

type FileTreeItemProps = {
  activePath: string;
  depth: number;
  expandedPaths: Set<string>;
  node: FileTreeNode;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
};

function FileTreeItem({
  activePath,
  depth,
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
          "group relative flex h-7 w-full items-center gap-1.5 rounded-none text-left text-[12px] transition-colors duration-[var(--workbench-transition-fast)]",
          isActive
            ? "bg-[var(--workbench-accent-soft)] text-[var(--workbench-accent-strong)]"
            : "text-[var(--workbench-text)] hover:bg-[var(--workbench-surface)]",
        ].join(" ")}
        onClick={() => {
          if (isDirectory) {
            onToggle(node.path);
            return;
          }

          onSelect(node.path);
        }}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: "8px" }}
        type="button"
      >
        <span
          className={[
            "flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[var(--workbench-muted)] transition-transform",
            isExpanded ? "text-[var(--workbench-text)]" : "",
          ].join(" ")}
        >
          {isDirectory ? (
            <WorkbenchIcon name={isExpanded ? "chevron-down" : "chevron-right"} />
          ) : null}
        </span>

        <FileTypeIcon
          className="h-4 w-4 shrink-0"
          kind={node.kind}
          open={isExpanded}
          path={node.path}
        />

        <span className="truncate font-[450]">{node.name}</span>

        {isActive ? (
          <span className="absolute inset-y-1 left-0 w-[2px] bg-[var(--workbench-accent)]" />
        ) : null}
      </button>

      {isDirectory && isExpanded ? (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <FileTreeItem
              activePath={activePath}
              depth={depth + 1}
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

function WorkbenchIcon({ name }: { name: WorkbenchIconName }) {
  switch (name) {
    case "files":
      return (
        <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16">
          <path d="M2.5 3.5h4l1 1h6v8h-11z" fill="currentColor" opacity="0.25" />
          <path
            d="M2.5 3.5h4l1 1h6v8h-11z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    case "terminal":
      return (
        <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16">
          <path
            d="m3 4 3 3-3 3M7.5 10.5h4.5M2.5 2.5h11v11h-11z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
        </svg>
      );
    case "preview":
      return (
        <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16">
          <path
            d="M1.5 8s2.5-4 6.5-4 6.5 4 6.5 4-2.5 4-6.5 4-6.5-4-6.5-4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
      );
    case "folder":
    case "folder-open":
      return (
        <svg aria-hidden="true" className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 16 16">
          <path d="M2 4h4l1 1h7v6.5H2z" fill="currentColor" opacity="0.25" />
          <path
            d="M2 4h4l1 1h7v6.5H2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    case "chevron-right":
      return (
        <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 16 16">
          <path
            d="m6 4 4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "chevron-down":
      return (
        <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 16 16">
          <path
            d="m4 6 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "close":
      return (
        <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16">
          <path
            d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
          />
        </svg>
      );
    default:
      return (
        <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="5" fill="currentColor" opacity="0.45" />
        </svg>
      );
  }
}

function collectDirectoryPaths(nodes: FileTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.kind === "directory"
      ? [node.path, ...collectDirectoryPaths(node.children)]
      : [],
  );
}
