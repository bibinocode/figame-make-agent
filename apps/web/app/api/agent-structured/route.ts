import { getModelByProfile } from "@figame/model-provider";
import { NextResponse } from "next/server";
import type { ModelConfig } from "@figame/model-provider";
import type { WorkbenchStructuredRequest } from "../../../features/project-preview/services/workbench-structured-contract";

const LOCAL_MODEL_CONFIG: ModelConfig = {
  defaultProfile: "local",
  profiles: {
    local: {
      provider: "ollama",
      model: process.env.OLLAMA_MODEL ?? "minimax-m2.7:cloud",
      temperature: 0.1,
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

function extractTextContent(content: unknown) {
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
    const body = (await request.json()) as WorkbenchStructuredRequest;
    const profile = body.profile ?? "local";
    const provider = body.provider ?? "ollama";
    const model = getModelByProfile(profile, LOCAL_MODEL_CONFIG, {
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
      model: process.env.OLLAMA_MODEL ?? "minimax-m2.7:cloud",
      provider,
      temperature: 0.1,
    });

    const response = await model.invoke(
      [body.systemPrompt.trim(), body.userPrompt.trim()].join("\n\n"),
    );

    return NextResponse.json({
      content: extractTextContent(response.content),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "结构化模型调用失败，请检查本地服务。";

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
