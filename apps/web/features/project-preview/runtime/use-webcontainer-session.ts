"use client";

import type { AssembledTemplate } from "@figame/template-system";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { acquireWebContainerLease } from "./webcontainer-instance";
import {
  type WebcontainerCommand,
  getWebcontainerBootstrapCommand,
  getWebcontainerDevCommand,
  getWebcontainerInstallCommand,
  getWebcontainerNpmrcContents,
  getWebcontainerNpmrcPath,
} from "./webcontainer-package-manager";

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

const STOPPED_MESSAGE = "\r\n[system] 开发服务已停止\r\n";
const PREVIEW_READY_PREFIX = "\r\n[system] 预览服务已就绪：";
const MOUNTING_MESSAGE = "[system] 正在挂载模板文件...\r\n";
const UNSUPPORTED_MESSAGE =
  "当前页面没有开启跨源隔离，WebContainer 无法启动。请确认 Next.js 已返回 COOP/COEP 响应头。";
const REINSTALL_ERROR_MESSAGE = "重新安装依赖时发生未知错误。";
const BOOT_ERROR_MESSAGE = "WebContainer 启动失败。";

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

  const appendOutput = useCallback((chunk: string) => {
    setOutput((current) => `${current}${chunk}`);
  }, []);

  const markError = useCallback(
    (message: string) => {
      setErrorMessage(message);
      setStatus("error");
      appendOutput(`\r\n[error] ${message}\r\n`);
    },
    [appendOutput],
  );

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

  const runCommand = useCallback(
    async (command: WebcontainerCommand) => {
      if (!containerRef.current) {
        return null;
      }

      appendOutput(`\r\n${command.label}\r\n`);

      return containerRef.current.spawn(command.command, command.args, {
        terminal: terminalSizeRef.current,
      });
    },
    [appendOutput],
  );

  const runCommandAndWait = useCallback(
    async (command: WebcontainerCommand) => {
      const process = await runCommand(command);

      if (!process) {
        return;
      }

      const exitCode = await Promise.all([
        process.exit,
        pipeProcessOutput(process),
      ]).then(([value]) => value);

      if (exitCode !== 0) {
        throw new Error(`${command.label} 失败，退出码 ${exitCode}`);
      }
    },
    [pipeProcessOutput, runCommand],
  );

  const stopDevServer = useCallback(() => {
    if (!devServerProcessRef.current) {
      return;
    }

    devServerProcessRef.current.kill();
    devServerProcessRef.current = null;
    setPreviewUrl(null);
    setStatus("stopped");
    appendOutput(STOPPED_MESSAGE);
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

    if (devServerProcessRef.current) {
      devServerProcessRef.current.kill();
    }

    devServerProcessRef.current = null;
    setPreviewUrl(null);
    setStatus("starting");

    const devServerProcess = await runCommand(getWebcontainerDevCommand());

    if (!devServerProcess) {
      return;
    }

    devServerProcessRef.current = devServerProcess;
    void pipeProcessOutput(devServerProcess);
  }, [pipeProcessOutput, runCommand]);

  const installDependencies = useCallback(async () => {
    if (!containerRef.current) {
      return;
    }

    stopDevServer();
    setStatus("installing");

    await containerRef.current.fs.writeFile(
      getWebcontainerNpmrcPath(),
      getWebcontainerNpmrcContents(),
    );

    const bootstrapCommand = getWebcontainerBootstrapCommand();

    if (bootstrapCommand) {
      await runCommandAndWait(bootstrapCommand);
    }

    await runCommandAndWait(getWebcontainerInstallCommand());

    dependenciesInstalledRef.current = true;
  }, [runCommandAndWait, stopDevServer]);

  const reinstallDependencies = useCallback(async () => {
    try {
      setErrorMessage(null);
      await installDependencies();
      await startDevServer();
    } catch (error) {
      markError(
        error instanceof Error ? error.message : REINSTALL_ERROR_MESSAGE,
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
    let cleanupListeners: (() => void) | undefined;
    let releaseLease: (() => Promise<void>) | undefined;

    async function boot() {
      if (typeof window === "undefined") {
        return;
      }

      if (!window.crossOriginIsolated) {
        setStatus("unsupported");
        setErrorMessage(UNSUPPORTED_MESSAGE);
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

        const lease = await acquireWebContainerLease(() =>
          WebContainer.boot({
            coep: "require-corp",
            forwardPreviewErrors: "exceptions-only",
            workdirName: "figame-workspace",
          }),
        );
        const instance = lease.instance;
        releaseLease = lease.release;

        if (disposed) {
          await lease.release();
          return;
        }

        containerRef.current = instance;

        const unsubscribers = [
          instance.on("server-ready", (_port, url) => {
            setPreviewUrl(url);
            setStatus("ready");
            appendOutput(`${PREVIEW_READY_PREFIX}${url}\r\n`);
          }),
          instance.on("error", ({ message }) => {
            markError(message);
          }),
        ];

        cleanupListeners = () => {
          for (const unsubscribe of unsubscribers) {
            unsubscribe();
          }
        };

        setStatus("mounting");
        appendOutput(MOUNTING_MESSAGE);
        await instance.mount(toWebContainerTree(template));
        await startShell();
        await installDependencies();
        await startDevServer();
      } catch (error) {
        markError(error instanceof Error ? error.message : BOOT_ERROR_MESSAGE);
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
      cleanupListeners?.();
      void releaseLease?.();
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
