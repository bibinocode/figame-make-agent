import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completeFromList,
  completionKeymap,
  type Completion,
  type CompletionSource,
} from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { cssLanguage } from "@codemirror/lang-css";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import type { EditorView, KeyBinding } from "@codemirror/view";

export type EditorAutocompleteItem = Completion;

const REACT_ITEMS: EditorAutocompleteItem[] = [
  { label: "className", type: "property", detail: "React JSX attribute" },
  { label: "useState", type: "function", detail: "React hook" },
  { label: "useEffect", type: "function", detail: "React hook" },
  { label: "useMemo", type: "function", detail: "React hook" },
  { label: "return", type: "keyword", detail: "JavaScript keyword" },
  { label: "interface", type: "keyword", detail: "TypeScript keyword" },
  { label: "type", type: "keyword", detail: "TypeScript keyword" },
  { label: "className={}", type: "snippet", detail: "JSX snippet" },
];

const CSS_ITEMS: EditorAutocompleteItem[] = [
  { label: "display", type: "property", detail: "CSS property" },
  { label: "grid-template-columns", type: "property", detail: "CSS property" },
  { label: "align-items", type: "property", detail: "CSS property" },
  { label: "justify-content", type: "property", detail: "CSS property" },
  { label: "border-radius", type: "property", detail: "CSS property" },
  { label: "background", type: "property", detail: "CSS property" },
];

const DEFAULT_ITEMS: EditorAutocompleteItem[] = [
  { label: "const", type: "keyword", detail: "JavaScript keyword" },
  { label: "function", type: "keyword", detail: "JavaScript keyword" },
  { label: "export", type: "keyword", detail: "JavaScript keyword" },
];

export function getEditorAutocompleteItems(
  filePath: string,
): EditorAutocompleteItem[] {
  if (/\.(tsx|jsx|ts|js)$/.test(filePath)) {
    return REACT_ITEMS;
  }

  if (filePath.endsWith(".css")) {
    return CSS_ITEMS;
  }

  return DEFAULT_ITEMS;
}

export function createEditorAutocompleteExtensions(filePath: string): Extension[] {
  const source: CompletionSource = completeFromList(
    getEditorAutocompleteItems(filePath),
  );

  return [
    autocompletion({
      override: [source],
      activateOnTyping: true,
      icons: false,
    }),
    closeBrackets(),
    bracketMatching(),
    indentOnInput(),
    languageDataExtension(filePath),
  ];
}

export function createBaseEditorKeymap(options?: {
  onTab?: (view: EditorView) => boolean;
  onEscape?: () => boolean;
  onRequestAi?: () => boolean;
}): KeyBinding[] {
  return [
    {
      key: "Tab",
      preventDefault: true,
      run: (view) => {
        if (options?.onTab?.(view)) {
          return true;
        }

        if (acceptCompletion(view)) {
          return true;
        }

        return indentWithTab.run?.(view) ?? false;
      },
    },
    {
      key: "Escape",
      run: () => options?.onEscape?.() ?? false,
    },
    {
      key: "Alt-/",
      run: () => options?.onRequestAi?.() ?? false,
    },
    ...completionKeymap,
    ...closeBracketsKeymap,
  ];
}

function languageDataExtension(filePath: string): Extension {
  if (filePath.endsWith(".css")) {
    return cssLanguage.data.of({});
  }

  return javascriptLanguage.data.of({});
}
