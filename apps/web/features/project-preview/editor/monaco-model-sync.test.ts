import { describe, expect, it, vi } from "vitest";
import {
  syncMonacoModels,
  toMonacoModelUri,
  toProjectFilePath,
} from "./monaco-model-sync";

function createMonacoStub() {
  const models = new Map<
    string,
    {
      dispose: ReturnType<typeof vi.fn>;
      getValue: () => string;
      setValue: ReturnType<typeof vi.fn>;
      uri: { toString: () => string };
    }
  >();

  return {
    Uri: {
      parse(value: string) {
        return {
          toString() {
            return value;
          },
        };
      },
    },
    editor: {
      createModel(
        value: string,
        _language: string,
        uri: { toString: () => string },
      ) {
        const key = uri.toString();
        let currentValue = value;
        const model = {
          dispose: vi.fn(() => {
            models.delete(key);
          }),
          getValue: () => currentValue,
          setValue: vi.fn((nextValue: string) => {
            currentValue = nextValue;
          }),
          uri,
        };

        models.set(key, model);
        return model;
      },
      getModel(uri: { toString: () => string }) {
        return models.get(uri.toString()) ?? null;
      },
      getModels() {
        return [...models.values()];
      },
    },
  };
}

describe("monaco-model-sync", () => {
  it("creates Monaco models for every project file and keeps them updated", () => {
    const monaco = createMonacoStub();

    syncMonacoModels(monaco, {
      "/src/App.tsx": "export function App() { return null; }",
      "/src/main.tsx": "import { App } from './App';",
    });

    expect(
      monaco.editor
        .getModels()
        .map((model) => model.uri.toString())
        .sort(),
    ).toEqual(["file:///src/App.tsx", "file:///src/main.tsx"]);

    syncMonacoModels(monaco, {
      "/src/App.tsx": "export function App() { return <div />; }",
    });

    expect(
      monaco.editor.getModel(monaco.Uri.parse("file:///src/App.tsx"))?.setValue,
    ).toHaveBeenCalledWith("export function App() { return <div />; }");
    expect(monaco.editor.getModels()).toHaveLength(1);
    expect(monaco.editor.getModels()[0]?.uri.toString()).toBe("file:///src/App.tsx");
  });

  it("converts between project paths and Monaco file URIs", () => {
    expect(toMonacoModelUri("/src/App.tsx")).toBe("file:///src/App.tsx");
    expect(toProjectFilePath("file:///src/App.tsx")).toBe("/src/App.tsx");
    expect(toProjectFilePath("inmemory://model/1")).toBeNull();
  });
});
