import type { z } from "zod";

function stripCodeFence(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractJsonLikePayload(value: string) {
  const normalized = stripCodeFence(value);
  const objectStart = normalized.indexOf("{");
  const arrayStart = normalized.indexOf("[");
  const startCandidates = [objectStart, arrayStart].filter((index) => index >= 0);
  const start = startCandidates.length > 0 ? Math.min(...startCandidates) : 0;
  const objectEnd = normalized.lastIndexOf("}");
  const arrayEnd = normalized.lastIndexOf("]");
  const end = Math.max(objectEnd, arrayEnd);

  if (end >= start) {
    return normalized.slice(start, end + 1);
  }

  return normalized;
}

function tryParseStringifiedJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    !(
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    )
  ) {
    return value;
  }

  return JSON.parse(trimmed);
}

export function parseStructuredOutput<TSchema extends z.ZodTypeAny>(
  rawText: string,
  schema: TSchema,
) {
  const candidate = extractJsonLikePayload(rawText);
  const parsed = tryParseStringifiedJson(JSON.parse(candidate));
  const validationResult = schema.safeParse(parsed);

  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0]?.message ?? "结构化输出校验失败。");
  }

  return validationResult.data;
}
