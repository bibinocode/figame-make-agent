import type { FileSystemTree } from "@webcontainer/api";
import type { AssembledTemplate } from "@figame/template-system";

export type WebContainerMountTree = FileSystemTree;

export type WebContainerProject = {
  template: AssembledTemplate;
  files: WebContainerMountTree;
};
