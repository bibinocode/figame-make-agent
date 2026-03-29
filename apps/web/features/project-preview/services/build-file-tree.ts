export type FileTreeNode = {
  id: string;
  name: string;
  path: string;
  kind: "directory" | "file";
  children: FileTreeNode[];
};

export function buildFileTree(filePaths: string[]): FileTreeNode[] {
  const root: FileTreeNode = {
    id: "root",
    name: "root",
    path: "/",
    kind: "directory",
    children: [],
  };

  for (const filePath of filePaths) {
    const segments = filePath.split("/").filter(Boolean);
    let cursor = root;

    for (const [index, segment] of segments.entries()) {
      const isFile = index === segments.length - 1;
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      let nextNode = cursor.children.find((child) => child.path === path);

      if (!nextNode) {
        nextNode = {
          id: path,
          name: segment,
          path,
          kind: isFile ? "file" : "directory",
          children: [],
        };
        cursor.children.push(nextNode);
      }

      cursor = nextNode;
    }
  }

  return sortNodes(root.children);
}

function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return [...nodes]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((node) => ({
      ...node,
      children: sortNodes(node.children),
    }));
}
