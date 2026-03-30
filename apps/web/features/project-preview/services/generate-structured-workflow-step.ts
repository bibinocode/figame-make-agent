import type { WorkbenchStructuredResponse } from "./workbench-structured-contract";
import type { WorkbenchStructuredRequest } from "./workbench-structured-contract";

export async function generateStructuredWorkflowStep(
  payload: WorkbenchStructuredRequest,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 90000);
  let response: Response;

  try {
    response = await fetch("/api/agent-structured", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("结构化步骤执行超时，请检查本地模型是否可用。");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "结构化步骤生成失败。");
  }

  const data = (await response.json()) as WorkbenchStructuredResponse;
  return data.content;
}
