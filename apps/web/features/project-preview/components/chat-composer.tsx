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
          "min-h-[120px] px-4 py-4 text-sm leading-7 text-slate-900 outline-none",
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          const text = editor?.getText().trim() ?? "";

          if (!text || disabled) {
            return true;
          }

          onSubmit({
            html: editor?.getHTML() ?? "",
            text,
          });

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
        placeholder: "直接描述你的创作需求，或者粘贴 Figma 链接开始创作...",
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

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
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
            AI 输入区
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Enter 发送，Shift + Enter 换行
          </p>
        </div>
        <button
          className="h-10 rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!canSubmit}
          onClick={() => {
            if (!editor) {
              return;
            }

            const text = editor.getText().trim();

            if (!text) {
              return;
            }

            onSubmit({
              html: editor.getHTML(),
              text,
            });
          }}
          type="button"
        >
          发送
        </button>
      </div>

      <div className="figame-chat-composer">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .figame-chat-composer .tiptap p.is-editor-empty:first-child::before {
          color: #94a3b8;
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
