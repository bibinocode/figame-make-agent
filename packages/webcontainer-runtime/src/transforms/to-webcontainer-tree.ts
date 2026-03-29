import type { AssembledTemplate } from "@figame/template-system";
import type { DirectoryNode, FileSystemTree } from "@webcontainer/api";

export function toWebContainerTree(
  template: AssembledTemplate,
): FileSystemTree {
  const root: FileSystemTree = {};

  for (const [path, file] of Object.entries(template.files)) {
    const segments = path.split("/").filter(Boolean);
    let cursor = root;

    for (const [index, segment] of segments.entries()) {
      const isFile = index === segments.length - 1;

      if (isFile) {
        cursor[segment] = {
          file: {
            contents: file.code,
          },
        };
        continue;
      }

      const current = cursor[segment];

      if (!current || !("directory" in current)) {
        cursor[segment] = {
          directory: {},
        };
      }

      cursor = (cursor[segment] as DirectoryNode).directory;
    }
  }

  return root;
}
