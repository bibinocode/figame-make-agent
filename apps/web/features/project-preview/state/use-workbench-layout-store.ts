"use client";

import { create } from "zustand";

const FILE_PANE_MIN_WIDTH = 180;
const FILE_PANE_MAX_WIDTH = 420;
const TERMINAL_MIN_HEIGHT = 160;
const TERMINAL_MAX_HEIGHT = 420;

type WorkbenchLayoutState = {
  filePaneWidth: number;
  isFilePaneCollapsed: boolean;
  isTerminalCollapsed: boolean;
  setFilePaneWidth: (value: number) => void;
  setTerminalPaneHeight: (value: number) => void;
  terminalPaneHeight: number;
  toggleFilePane: () => void;
  toggleTerminal: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const useWorkbenchLayoutStore = create<WorkbenchLayoutState>((set) => ({
  filePaneWidth: 248,
  terminalPaneHeight: 240,
  isFilePaneCollapsed: false,
  isTerminalCollapsed: false,
  setFilePaneWidth(value) {
    set({
      filePaneWidth: clamp(value, FILE_PANE_MIN_WIDTH, FILE_PANE_MAX_WIDTH),
      isFilePaneCollapsed: false,
    });
  },
  setTerminalPaneHeight(value) {
    set({
      isTerminalCollapsed: false,
      terminalPaneHeight: clamp(
        value,
        TERMINAL_MIN_HEIGHT,
        TERMINAL_MAX_HEIGHT,
      ),
    });
  },
  toggleFilePane() {
    set((current) => ({
      isFilePaneCollapsed: !current.isFilePaneCollapsed,
    }));
  },
  toggleTerminal() {
    set((current) => ({
      isTerminalCollapsed: !current.isTerminalCollapsed,
    }));
  },
}));
