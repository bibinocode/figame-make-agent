export function ChatSidebarPlaceholder() {
  return (
    <aside className="flex min-h-[640px] w-full max-w-[380px] flex-col rounded-[28px] border border-black/8 bg-[#101828] px-5 py-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <header className="border-b border-white/10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
          Agent Chat
        </p>
        <h2 className="mt-2 text-xl font-semibold">对话工作区</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          这里后面会接入真实智能体。当前先保留完整版位，确保首页主布局稳定。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 py-5">
        <MessageBubble
          role="assistant"
          title="系统"
          content="模板已经加载完成。接下来可以根据你的指令修改页面、组件或业务逻辑。"
        />
        <MessageBubble
          role="user"
          title="你"
          content="先把左侧工作区挂起来，右侧保留聊天结构，后面再接真实对话。"
        />
        <MessageBubble
          role="assistant"
          title="助手"
          content="好的，当前先提供稳定布局和 Sandpack 预览入口。"
        />
      </div>

      <div className="mt-auto rounded-[22px] border border-white/10 bg-white/5 p-3">
        <div className="min-h-[92px] rounded-[16px] border border-dashed border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-400">
          在这里输入你的需求，例如：帮我把首页改成游戏启动页。
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Coming Soon
          </span>
          <button
            type="button"
            disabled
            className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 opacity-80"
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
        "rounded-[22px] px-4 py-4",
        role === "assistant"
          ? "bg-white/8 text-slate-100"
          : "self-end bg-amber-300 text-slate-950",
      ].join(" ")}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6">{content}</p>
    </article>
  );
}
