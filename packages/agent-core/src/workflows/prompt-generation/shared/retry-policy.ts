export const DEFAULT_PROMPT_GENERATION_MAX_ATTEMPTS = 3;

export function buildPromptGenerationRetryInstruction(
  attempt: number,
  errorMessage: string,
) {
  if (attempt === 1) {
    return `上一次输出无法解析为合法 JSON。错误原因：${errorMessage}。请只返回修正后的纯 JSON。`;
  }

  return `这是最后一次修正机会。上一次仍然失败，原因是：${errorMessage}。禁止解释、禁止 Markdown，只输出严格合法 JSON。`;
}
