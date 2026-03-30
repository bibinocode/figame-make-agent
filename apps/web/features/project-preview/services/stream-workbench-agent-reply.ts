import type { WorkbenchAgentChatRequest } from "./workbench-chat-contract";

type StreamWorkbenchAgentReplyOptions = {
  onChunk: (value: string) => void;
};

export async function streamWorkbenchAgentReply(
  payload: WorkbenchAgentChatRequest,
  options: StreamWorkbenchAgentReplyOptions,
) {
  const response = await fetch("/api/agent-chat", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "模型服务调用失败。");
  }

  if (!response.body) {
    const text = await response.text();
    options.onChunk(text);
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    if (!chunk) {
      continue;
    }

    accumulated += chunk;
    options.onChunk(accumulated);
  }

  const remainder = decoder.decode();

  if (remainder) {
    accumulated += remainder;
    options.onChunk(accumulated);
  }

  return accumulated;
}
