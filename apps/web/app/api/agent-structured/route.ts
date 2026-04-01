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

function isServiceUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /service temporarily unavailable/i.test(error.message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function invokeWithRetry(
  prompt: string,
  profile: string,
  provider: string,
  retries = 3,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const model = getModelByProfile(profile as "local", LOCAL_MODEL_CONFIG, {
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
        model: process.env.OLLAMA_MODEL ?? "minimax-m2.7:cloud",
        provider: provider as "ollama",
        temperature: 0.1,
      });

      return await model.invoke(prompt);
    } catch (error) {
      lastError = error;

      if (!isServiceUnavailableError(error) || attempt === retries) {
        throw error;
      }

      await sleep(400 * attempt);
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WorkbenchStructuredRequest;
    const profile = body.profile ?? "local";
    const provider = body.provider ?? "ollama";
    const prompt = [body.systemPrompt.trim(), body.userPrompt.trim()]
      .join("\n\n");
    const response = await invokeWithRetry(prompt, profile, provider);

    return NextResponse.json({
      content: extractTextContent(response.content),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "结构化模型调用失败，请检查本地服务。";
    const friendlyMessage = isServiceUnavailableError(error)
      ? `结构化模型暂时不可用，请稍后重试。当前模型：${process.env.OLLAMA_MODEL ?? "minimax-m2.7:cloud"}`
      : message;

    return NextResponse.json(
      {
        error: friendlyMessage,
      },
      {
        status: 500,
      },
    );
  }
}
