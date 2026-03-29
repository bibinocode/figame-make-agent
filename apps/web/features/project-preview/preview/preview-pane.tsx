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
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-white p-6">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
            Preview Error
          </p>
          <h3 className="text-xl font-semibold text-slate-950">预览暂时不可用</h3>
          <p className="text-sm leading-6 text-slate-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-white p-6">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Preview
          </p>
          <h3 className="text-xl font-semibold text-slate-950">
            正在准备浏览器运行时
          </h3>
          <p className="text-sm leading-6 text-slate-600">{statusLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      className="h-full min-h-0 w-full bg-white"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
      src={previewUrl}
      title="项目预览"
    />
  );
}
