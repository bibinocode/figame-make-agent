export const JSON_SAFETY_PROMPT = `
【JSON 输出安全规则 - 必须严格遵守】
0. 只输出 JSON 本身，前后禁止添加解释、Markdown 代码块或注释。
1. 输出必须是严格合法的 JSON，能够被 JSON.parse() 正确解析。
2. 所有字符串值必须使用双引号包裹，禁止使用单引号。
3. 对象和数组的最后一个元素后禁止保留多余逗号。
4. 所有括号必须正确配对：{ } 和 [ ] 必须成对出现。
5. 字符串中的特殊字符必须正确转义，例如换行 \\n、双引号 \\"、反斜杠 \\\\。
6. 禁止在 JSON 中书写注释。
7. number 不要加引号，boolean 使用 true / false 小写形式。
8. 输出完成前，请再次检查 JSON 结构完整性。
`;

export function appendJsonSafety(prompt: string) {
  return `${prompt.trim()}\n\n${JSON_SAFETY_PROMPT.trim()}`;
}
