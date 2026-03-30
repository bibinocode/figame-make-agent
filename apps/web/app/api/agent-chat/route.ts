import { getModelByProfile } from "@figame/model-provider";
import { NextResponse } from "next/server";
import type { ModelConfig } from "@figame/model-provider";
import type { WorkbenchAgentChatRequest } from "../../../features/project-preview/services/workbench-chat-contract";

const LOCAL_MODEL_CONFIG: ModelConfig = {
  defaultProfile: "local",
  profiles: {
    local: {
      provider: "ollama",
      model: process.env.OLLAMA_MODEL ?? "minimax-m2.7:cloud",
      temperature: 0.2,
      maxTokens: 4096,
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    },
  },
  providers: {
    ollama: {
      apiKey: process.env.OLLAMA_API_KEY ?? "ollama-local",
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    },
  },
};

function buildSystemPrompt(body: WorkbenchAgentChatRequest) {
  const sourceSummary =
    body.routeContext.sourceKinds.length > 0
      ? body.routeContext.sourceKinds.join("、")
      : "普通对话";

  return [
    "你是 Figame 的 AI 创作助手，请使用简体中文回复。",
    "你的回复要自然、直接、专业，优先帮助用户推进页面设计、产品结构和实现思路。",
    "如果用户提供了 Figma 链接，请优先围绕设计稿理解、页面结构和实现建议进行回复。",
    "如果用户只是普通提问，也正常聊天，不要硬套生成模板。",
    `当前路由意图：${body.routeContext.intent ?? "unknown"}。`,
    `当前执行流：${body.routeContext.activeFlowId ?? "unknown"}。`,
    `当前输入源：${sourceSummary}。`,
    body.activeFilePath ? `当前编辑文件：${body.activeFilePath}。` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildConversationPrompt(body: WorkbenchAgentChatRequest) {
  const history = body.history
    .map((item) =>
      item.role === "assistant"
        ? `助手：${item.content}`
        : `用户：${item.content}`,
    )
    .join("\n\n");

  return [
    buildSystemPrompt(body),
    history ? `历史对话：\n${history}` : "",
    `用户：${body.messageText}`,
    "助手：",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function extractChunkText(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          "type" in item &&
          item.type === "text" &&
          "text" in item &&
          typeof item.text === "string"
        ) {
          return item.text;
        }

        return "";
      })
      .join("");
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WorkbenchAgentChatRequest;
    const profile = body.routeContext.profile ?? "local";
    const provider = body.routeContext.provider ?? "ollama";

    const model = getModelByProfile(profile, LOCAL_MODEL_CONFIG, {
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
      model: process.env.OLLAMA_MODEL ?? "minimax-m2.7:cloud",
      provider,
      temperature: 0.2,
    });

    const encoder = new TextEncoder();
    const stream = await model.stream(buildConversationPrompt(body));

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = extractChunkText(chunk.content);

              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "模型桥接失败，请检查 Ollama 服务。";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
