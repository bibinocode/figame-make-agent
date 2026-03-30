"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type ChatComposerSubmitPayload = {
  html: string;
  text: string;
};

type ChatComposerProps = {
  disabled?: boolean;
  onChange: (html: string) => void;
  onSubmit: (payload: ChatComposerSubmitPayload) => void;
  value: string;
};

export function ChatComposer({
  disabled = false,
  onChange,
  onSubmit,
  value,
}: ChatComposerProps) {
  const editor = useEditor({
    content: value,
    editorProps: {
      attributes: {
        class:
          "max-h-[240px] min-h-[116px] overflow-y-auto px-4 py-4 pr-24 text-sm leading-7 text-[var(--workbench-text)] outline-none",
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submitCurrentMessage();
          return true;
        }

        return false;
      },
    },
    extensions: [
      StarterKit.configure({
        blockquote: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder:
          "输入创作需求、修改指令或 Figma 链接。Enter 发送，Shift + Enter 换行。",
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  const submitCurrentMessage = () => {
    if (!editor) {
      return;
    }

    const text = editor.getText().trim();

    if (!text || disabled) {
      return;
    }

    onSubmit({
      html: editor.getHTML(),
      text,
    });
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();

    if (currentHtml !== value) {
      editor.commands.setContent(value || "<p></p>", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  const canSubmit = !disabled && Boolean(editor?.getText().trim());

  return (
    <div className="relative border border-[var(--workbench-line)] bg-[var(--workbench-surface)]">
      <div className="figame-chat-composer">
        <EditorContent editor={editor} />
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2">
        <span className="hidden border border-[var(--workbench-line)] bg-[var(--workbench-panel)] px-2 py-1 text-[11px] text-[var(--workbench-muted)] lg:inline-flex">
          Enter 发送
        </span>
        <button
          className="pointer-events-auto inline-flex h-8 items-center border border-[var(--workbench-accent)] bg-[var(--workbench-accent)] px-3 text-sm font-medium text-white transition-colors duration-[var(--workbench-transition-fast)] hover:bg-[var(--workbench-accent-strong)] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          disabled={!canSubmit}
          onClick={submitCurrentMessage}
          type="button"
        >
          发送
        </button>
      </div>

      <style jsx global>{`
        .figame-chat-composer .tiptap p.is-editor-empty:first-child::before {
          color: var(--workbench-muted);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .figame-chat-composer .tiptap p {
          margin: 0;
        }

        .figame-chat-composer .tiptap p + p {
          margin-top: 0.75rem;
        }
      `}</style>
    </div>
  );
}
