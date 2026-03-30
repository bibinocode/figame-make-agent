"use client";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";

type TerminalPaneProps = {
  isInteractive: boolean;
  output: string;
  onData: (value: string) => void;
  onResize: (cols: number, rows: number) => void;
};

export function TerminalPane({
  isInteractive,
  output,
  onData,
  onResize,
}: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const outputLengthRef = useRef(0);
  const onDataRef = useRef(onData);
  const onResizeRef = useRef(onResize);
  const isInteractiveRef = useRef(isInteractive);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    isInteractiveRef.current = isInteractive;
  }, [isInteractive]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const terminal = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily:
        "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
      fontSize: 13,
      theme: {
        background: "#0f172a",
        foreground: "#e2e8f0",
      },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    terminalRef.current = terminal;

    const fitTerminal = () => {
      fitAddon.fit();
      onResizeRef.current(terminal.cols, terminal.rows);
    };

    fitTerminal();

    const resizeObserver = new ResizeObserver(() => {
      fitTerminal();
    });

    resizeObserver.observe(containerRef.current);

    const disposeData = terminal.onData((value) => {
      if (isInteractiveRef.current) {
        onDataRef.current(value);
      }
    });

    return () => {
      resizeObserver.disconnect();
      disposeData.dispose();
      terminal.dispose();
      terminalRef.current = null;
      outputLengthRef.current = 0;
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    const nextChunk = output.slice(outputLengthRef.current);

    if (nextChunk) {
      terminalRef.current.write(nextChunk);
      outputLengthRef.current = output.length;
    }
  }, [output]);

  return <div className="h-full w-full bg-[#0f172a]" ref={containerRef} />;
}
