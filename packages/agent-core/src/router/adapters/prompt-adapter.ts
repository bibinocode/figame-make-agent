import type { AdapterResult, AgentInputEnvelope } from "../types";

const CREATE_PATTERNS = [
  /做一个/u,
  /做个/u,
  /创建/u,
  /生成/u,
  /搭建/u,
  /开发/u,
  /设计一个/u,
  /设计一套/u,
  /页面/u,
  /应用/u,
  /网站/u,
  /后台/u,
  /管理系统/u,
  /原型/u,
  /\bbuild\b/i,
  /\bcreate\b/i,
  /\bgenerate\b/i,
  /\bdesign\b/i,
  /\bmake\b/i,
];

const MODIFY_PATTERNS = [
  /修改/u,
  /改一下/u,
  /改成/u,
  /调整/u,
  /优化/u,
  /重构/u,
  /修复/u,
  /替换/u,
  /删除/u,
  /完善/u,
  /\brefactor\b/i,
  /\bfix\b/i,
  /\bupdate\b/i,
  /\bedit\b/i,
  /\bmodify\b/i,
];

const SMALL_TALK_PATTERNS = [
  /^你好[呀啊!！?？]*$/u,
  /^嗨[呀啊!！?？]*$/u,
  /^哈喽[呀啊!！?？]*$/u,
  /^在吗[?？]*$/u,
  /^早上好[!！]*$/u,
  /^晚上好[!！]*$/u,
  /^谢谢[你呢吗呀啊!！]*$/u,
  /^hello[!！,.?？ ]*$/i,
  /^hi[!！,.?？ ]*$/i,
];

function looksLikeCreateIntent(text: string) {
  return CREATE_PATTERNS.some((pattern) => pattern.test(text));
}

function looksLikeModifyIntent(text: string) {
  return MODIFY_PATTERNS.some((pattern) => pattern.test(text));
}

function isSmallTalk(text: string) {
  return SMALL_TALK_PATTERNS.some((pattern) => pattern.test(text.trim()));
}

function isGeneralQuestion(text: string) {
  return /[?？]$/.test(text) || /^(什么|怎么|如何|为什么|是否|能不能|请问)/u.test(text);
}

export function runPromptAdapter(
  envelope: AgentInputEnvelope,
): AdapterResult {
  const promptSource = envelope.sources.find((source) => source.kind === "prompt");

  if (!promptSource || !promptSource.text.trim()) {
    return {
      adapterId: "prompt-adapter",
      candidates: [],
      diagnostics: ["No prompt source was available for prompt routing."],
    };
  }

  const promptText = promptSource.text.trim();

  if (looksLikeModifyIntent(promptText)) {
    return {
      adapterId: "prompt-adapter",
      candidates: [],
      diagnostics: ["Prompt was withheld from create routing because it looks like a modify request."],
    };
  }

  if (isSmallTalk(promptText) || isGeneralQuestion(promptText)) {
    return {
      adapterId: "prompt-adapter",
      candidates: [],
      diagnostics: ["Prompt was treated as casual chat or general Q&A instead of an app creation request."],
    };
  }

  if (!looksLikeCreateIntent(promptText)) {
    return {
      adapterId: "prompt-adapter",
      candidates: [],
      diagnostics: ["Prompt did not meet create-from-prompt intent heuristics."],
    };
  }

  return {
    adapterId: "prompt-adapter",
    candidates: [
      {
        adapterId: "prompt-adapter",
        intent: "create_from_prompt",
        score: Math.min(0.92, 0.62 + promptText.length / 600),
        priority: 10,
        reason: "Detected a clear app creation request from prompt input.",
        evidence: [promptText.slice(0, 120)],
        suggestedFlowId: "create-from-prompt",
        suggestedProfile: "local",
        suggestedProvider: "ollama",
        requiredCapabilities: ["chat"],
      },
    ],
    diagnostics: [],
  };
}
