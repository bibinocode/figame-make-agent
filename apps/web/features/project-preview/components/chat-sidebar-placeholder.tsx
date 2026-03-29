export function ChatSidebarPlaceholder() {
  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-slate-200 bg-[#fbfaf6] xl:flex xl:flex-col">
      <header className="border-b border-slate-200 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Agent Chat
        </p>
        <h2 className="mt-2 text-base font-semibold text-slate-950">
          智能体对话区
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          这里先保留后续智能体入口。当前阶段优先把编辑器、运行时和预览链路打通。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 py-4">
        <MessageBubble
          role="assistant"
          title="系统"
          content="WebContainer 运行时会在浏览器里安装依赖、启动 dev server，并把输出同步到终端。"
        />
        <MessageBubble
          role="user"
          title="你"
          content="接下来把这里升级成真正的智能体面板，支持 MCP、Skill 和代码操作。"
        />
        <MessageBubble
          role="assistant"
          title="助手"
          content="明白。当前先把代码模式和纯预览模式做扎实，后面再接入真实会话。"
        />
      </div>

      <div className="border-t border-slate-200 px-4 py-4">
        <div className="rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-400">
          在这里输入你的需求，例如：把首页改成一个游戏化的工作台。
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Mock Session</span>
          <button
            type="button"
            disabled
            className="h-9 rounded-md border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white opacity-85"
          >
            发送
          </button>
        </div>
      </div>
    </aside>
  );
}

type MessageBubbleProps = {
  role: "assistant" | "user";
  title: string;
  content: string;
};

function MessageBubble({ role, title, content }: MessageBubbleProps) {
  return (
    <article
      className={[
        "max-w-[92%] border px-3 py-3 text-sm leading-6",
        role === "assistant"
          ? "border-slate-200 bg-white text-slate-700"
          : "self-end border-emerald-300 bg-emerald-50 text-slate-900",
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-2">{content}</p>
    </article>
  );
}
