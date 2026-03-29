"use client";

import type { AssembledTemplate } from "@figame/template-system";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

export type WebcontainerSessionStatus =
  | "idle"
  | "unsupported"
  | "booting"
  | "mounting"
  | "installing"
  | "starting"
  | "ready"
  | "stopped"
  | "error";

type UseWebcontainerSessionOptions = {
  template: AssembledTemplate;
};

type UseWebcontainerSessionResult = {
  errorMessage: string | null;
  isTerminalReady: boolean;
  output: string;
  previewUrl: string | null;
  reinstallDependencies: () => Promise<void>;
  resizeTerminal: (cols: number, rows: number) => void;
  sendTerminalInput: (value: string) => void;
  startDevServer: () => Promise<void>;
  status: WebcontainerSessionStatus;
  stopDevServer: () => void;
  writeFile: (path: string, code: string) => Promise<void>;
};

export function useWebcontainerSession({
  template,
}: UseWebcontainerSessionOptions): UseWebcontainerSessionResult {
  const containerRef = useRef<WebContainer | null>(null);
  const devServerProcessRef = useRef<WebContainerProcess | null>(null);
  const shellProcessRef = useRef<WebContainerProcess | null>(null);
  const shellWriterRef = useRef<WritableStreamDefaultWriter<string> | null>(null);
  const terminalSizeRef = useRef({ cols: 120, rows: 32 });
  const dependenciesInstalledRef = useRef(false);

  const [status, setStatus] = useState<WebcontainerSessionStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState(false);

  const appendOutput = useEffectEvent((chunk: string) => {
    setOutput((current) => `${current}${chunk}`);
  });

  const markError = useEffectEvent((message: string) => {
    setErrorMessage(message);
    setStatus("error");
    appendOutput(`\r\n[error] ${message}\r\n`);
  });

  const pipeProcessOutput = useCallback(
    (process: WebContainerProcess) => {
      return process.output.pipeTo(
        new WritableStream({
          write(chunk) {
            appendOutput(chunk);
          },
        }),
      );
    },
    [appendOutput],
  );

  const stopDevServer = useCallback(() => {
    devServerProcessRef.current?.kill();
    devServerProcessRef.current = null;
    setPreviewUrl(null);
    setStatus("stopped");
    appendOutput("\r\n[system] 开发服务已停止\r\n");
  }, [appendOutput]);

  const startShell = useCallback(async () => {
    if (!containerRef.current || shellProcessRef.current) {
      return;
    }

    const shellProcess = await containerRef.current.spawn("jsh", {
      terminal: terminalSizeRef.current,
    });

    shellProcessRef.current = shellProcess;
    shellWriterRef.current = shellProcess.input.getWriter();
    setIsTerminalReady(true);
    void pipeProcessOutput(shellProcess);
  }, [pipeProcessOutput]);

  const startDevServer = useCallback(async () => {
    if (!containerRef.current || !dependenciesInstalledRef.current) {
      return;
    }

    devServerProcessRef.current?.kill();
    setPreviewUrl(null);
    setStatus("starting");
    appendOutput("\r\n$ npm run dev\r\n");

    const devServerProcess = await containerRef.current.spawn(
      "npm",
      ["run", "dev"],
      {
        terminal: terminalSizeRef.current,
      },
    );

    devServerProcessRef.current = devServerProcess;
    void pipeProcessOutput(devServerProcess);
  }, [appendOutput, pipeProcessOutput]);

  const installDependencies = useCallback(async () => {
    if (!containerRef.current) {
      return;
    }

    stopDevServer();
    setStatus("installing");
    appendOutput("\r\n$ npm install\r\n");

    const installProcess = await containerRef.current.spawn(
      "npm",
      ["install"],
      {
        terminal: terminalSizeRef.current,
      },
    );

    const exitCode = await Promise.all([
      installProcess.exit,
      pipeProcessOutput(installProcess),
    ]).then(([value]) => value);

    if (exitCode !== 0) {
      throw new Error(`npm install 失败，退出码 ${exitCode}`);
    }

    dependenciesInstalledRef.current = true;
  }, [appendOutput, pipeProcessOutput, stopDevServer]);

  const reinstallDependencies = useCallback(async () => {
    try {
      setErrorMessage(null);
      await installDependencies();
      await startDevServer();
    } catch (error) {
      markError(
        error instanceof Error ? error.message : "重新安装依赖时发生未知错误",
      );
    }
  }, [installDependencies, markError, startDevServer]);

  const writeFile = useCallback(async (path: string, code: string) => {
    if (!containerRef.current) {
      return;
    }

    await containerRef.current.fs.writeFile(path, code);
  }, []);

  const sendTerminalInput = useCallback((value: string) => {
    void shellWriterRef.current?.write(value);
  }, []);

  const resizeTerminal = useCallback((cols: number, rows: number) => {
    terminalSizeRef.current = { cols, rows };
    shellProcessRef.current?.resize({ cols, rows });
    devServerProcessRef.current?.resize({ cols, rows });
  }, []);

  useEffect(() => {
    let disposed = false;
    let teardown: (() => void) | undefined;

    async function boot() {
      if (typeof window === "undefined") {
        return;
      }

      if (!window.crossOriginIsolated) {
        setStatus("unsupported");
        setErrorMessage(
          "当前页面没有开启跨源隔离，WebContainer 无法启动。请确认 Next.js 已返回 COOP/COEP 响应头。",
        );
        return;
      }

      try {
        setErrorMessage(null);
        setOutput("");
        setPreviewUrl(null);
        setStatus("booting");
        dependenciesInstalledRef.current = false;

        const [{ WebContainer }, { toWebContainerTree }] = await Promise.all([
          import("@webcontainer/api"),
          import("@figame/webcontainer-runtime"),
        ]);

        if (disposed) {
          return;
        }

        const instance = await WebContainer.boot({
          coep: "require-corp",
          forwardPreviewErrors: "exceptions-only",
          workdirName: "figame-workspace",
        });

        if (disposed) {
          instance.teardown();
          return;
        }

        containerRef.current = instance;

        const unsubscribers = [
          instance.on("server-ready", (_port, url) => {
            setPreviewUrl(url);
            setStatus("ready");
            appendOutput(`\r\n[system] 预览服务已就绪：${url}\r\n`);
          }),
          instance.on("error", ({ message }) => {
            markError(message);
          }),
        ];

        teardown = () => {
          for (const unsubscribe of unsubscribers) {
            unsubscribe();
          }

          instance.teardown();
        };

        setStatus("mounting");
        appendOutput("[system] 挂载模板文件...\r\n");
        await instance.mount(toWebContainerTree(template));

        await installDependencies();
        await startDevServer();
        await startShell();
      } catch (error) {
        markError(error instanceof Error ? error.message : "WebContainer 启动失败");
      }
    }

    void boot();

    return () => {
      disposed = true;
      shellWriterRef.current?.releaseLock();
      shellWriterRef.current = null;
      shellProcessRef.current?.kill();
      shellProcessRef.current = null;
      devServerProcessRef.current?.kill();
      devServerProcessRef.current = null;
      containerRef.current = null;
      setIsTerminalReady(false);
      teardown?.();
    };
  }, [appendOutput, installDependencies, markError, startDevServer, startShell, template]);

  return {
    errorMessage,
    isTerminalReady,
    output,
    previewUrl,
    reinstallDependencies,
    resizeTerminal,
    sendTerminalInput,
    startDevServer,
    status,
    stopDevServer,
    writeFile,
  };
}
