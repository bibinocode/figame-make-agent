import type { PromptGenerationDesignContext } from "@figame/agent-core";

export const WORKBENCH_UI_SKILL_PRESET = {
  colors: {
    accent: "#2563eb",
    accentStrong: "#1d4ed8",
    accentSoft: "#dbeafe",
    canvas: "#edf3fb",
    chrome: "#0f172a",
    line: "#d7e0ec",
    muted: "#5b6b7f",
    panel: "#f7fbff",
    panelMuted: "#f1f5f9",
    success: "#059669",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    terminal: "#0b1220",
    terminalBorder: "#1e293b",
    text: "#0f172a",
  },
  generatedAt: "2026-03-30",
  motion: {
    fast: "160ms",
    normal: "220ms",
    slow: "280ms",
  },
  query:
    "AI coding workbench IDE agent workflow developer tool light mode professional",
  rules: [
    "使用清晰的信息层级，不依赖大圆角和装饰性卡片。",
    "正文使用 IBM Plex Sans，代码与路径使用 JetBrains Mono。",
    "所有交互反馈保持 150-300ms，优先使用 opacity 和 transform。",
    "面板边界清晰，滚动区域与固定工具栏分离。",
    "工作流反馈采用单卡片渐进展开，不提前展示未执行节点。",
  ],
  source: "ui-ux-pro-max",
  style: {
    keywords: [
      "developer tool",
      "workbench",
      "light mode",
      "information dense",
    ],
    name: "Developer Workbench Light",
  },
  typography: {
    body: "IBM Plex Sans",
    mono: "JetBrains Mono",
  },
} as const;

export const DEFAULT_PROMPT_GENERATION_DESIGN_CONTEXT: PromptGenerationDesignContext =
  {
    colors: {
      accent: WORKBENCH_UI_SKILL_PRESET.colors.accent,
      accentSoft: WORKBENCH_UI_SKILL_PRESET.colors.accentSoft,
      background: WORKBENCH_UI_SKILL_PRESET.colors.surfaceAlt,
      panel: WORKBENCH_UI_SKILL_PRESET.colors.surface,
      text: WORKBENCH_UI_SKILL_PRESET.colors.text,
    },
    motion: {
      fast: WORKBENCH_UI_SKILL_PRESET.motion.fast,
      normal: WORKBENCH_UI_SKILL_PRESET.motion.normal,
      slow: WORKBENCH_UI_SKILL_PRESET.motion.slow,
    },
    query: WORKBENCH_UI_SKILL_PRESET.query,
    rules: [...WORKBENCH_UI_SKILL_PRESET.rules],
    source: WORKBENCH_UI_SKILL_PRESET.source,
    styleKeywords: [...WORKBENCH_UI_SKILL_PRESET.style.keywords],
    styleName: WORKBENCH_UI_SKILL_PRESET.style.name,
    typography: {
      body: WORKBENCH_UI_SKILL_PRESET.typography.body,
      mono: WORKBENCH_UI_SKILL_PRESET.typography.mono,
    },
  };

export type WorkbenchUiSkillPreset = typeof WORKBENCH_UI_SKILL_PRESET;
