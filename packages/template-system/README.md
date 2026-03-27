# template-system

Template scanning, manifests, and template assembly live here.

## Responsibilities

- Scan local templates under `templates/*`
- Read and validate `template.manifest.json`
- Assemble shared files declared in `extends`
- Normalize file paths into Sandpack-friendly virtual paths
- Return a stable `AssembledTemplate` object for downstream runtimes

## Manifest

Each template owns its preview behavior in `template.manifest.json`.

```json
{
  "id": "react-ts",
  "label": "React TypeScript",
  "runtime": "sandpack",
  "extends": ["shared"],
  "entry": {
    "main": "/src/App.tsx"
  },
  "preview": {
    "template": "react-ts",
    "visibleFiles": ["/src/App.tsx", "/src/main.tsx"],
    "activeFile": "/src/App.tsx",
    "externalResources": []
  }
}
```

## Usage

```ts
import { getTemplate } from "@figame/template-system";

const template = await getTemplate("react-ts", {
  templatesRoot: "E:/abi/ai/figame-make-agent/templates",
});
```
