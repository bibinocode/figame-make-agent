"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  type SandpackPredefinedTemplate,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import type { SandpackTemplateResult } from "@figame/sandpack-runtime";

type SandpackPreviewPanelProps = {
  mode: "code" | "preview";
  sandpackTemplate: SandpackTemplateResult;
};

export function SandpackPreviewPanel({
  mode,
  sandpackTemplate,
}: SandpackPreviewPanelProps) {
  return (
    <div className="project-preview-sandpack h-full min-h-[520px] overflow-hidden rounded-[24px] border border-black/8 bg-[#f8f5ef]">
      <SandpackProvider
        template={sandpackTemplate.template as SandpackPredefinedTemplate}
        files={sandpackTemplate.files}
        options={sandpackTemplate.options}
      >
        <SandpackLayout className="h-full min-h-[520px] !border-0 !bg-transparent">
          {mode === "code" ? (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ height: "520px" }}
            />
          ) : (
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: "520px" }}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
