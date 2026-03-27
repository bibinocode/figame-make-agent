# sandpack-runtime

Sandpack preview transforms and runtime helpers live here.

## Responsibilities

- Convert `AssembledTemplate` into Sandpack `files`
- Convert preview config into Sandpack `options`
- Apply runtime file overrides without mutating source templates

## Usage

```ts
import { getTemplate } from "@figame/template-system";
import { createSandpackTemplate } from "@figame/sandpack-runtime";

const assembledTemplate = await getTemplate("react-ts", {
  templatesRoot: "E:/abi/ai/figame-make-agent/templates",
});

const sandpack = createSandpackTemplate(assembledTemplate);
```
