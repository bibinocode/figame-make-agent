type PreviewPaneProps = {
  errorMessage: string | null;
  previewUrl: string | null;
  statusLabel: string;
};

export function PreviewPane({
  errorMessage,
  previewUrl,
  statusLabel,
}: PreviewPaneProps) {
  if (errorMessage) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[var(--workbench-surface)] p-6">
        <div className="max-w-md space-y-3 border border-rose-200 bg-rose-50 px-6 py-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-rose-500">
            Preview Error
          </p>
          <h3 className="text-xl font-semibold text-[var(--workbench-text)]">
            预览暂时不可用
          </h3>
          <p className="text-sm leading-6 text-[var(--workbench-muted)]">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[var(--workbench-surface)] p-6">
        <div className="max-w-md space-y-3 border border-[var(--workbench-line)] bg-[var(--workbench-panel)] px-6 py-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--workbench-muted)]">
            Preview
          </p>
          <h3 className="text-xl font-semibold text-[var(--workbench-text)]">
            正在准备运行环境
          </h3>
          <p className="text-sm leading-6 text-[var(--workbench-muted)]">
            {statusLabel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      className="h-full min-h-0 w-full bg-[var(--workbench-surface)]"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
      src={previewUrl}
      title="项目预览"
    />
  );
}
