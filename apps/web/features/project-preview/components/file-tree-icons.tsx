"use client";

type FileIconName =
  | "css"
  | "eslint"
  | "folder"
  | "git"
  | "html"
  | "image"
  | "javascript"
  | "json"
  | "jsx"
  | "markdown"
  | "prettier"
  | "ts"
  | "yaml";

type FileTypeIconProps = {
  className?: string;
  kind?: "directory" | "file";
  open?: boolean;
  path: string;
};

const FILE_ICON_MAP: Record<string, FileIconName> = {
  ".css": "css",
  ".gif": "image",
  ".html": "html",
  ".ico": "image",
  ".jpeg": "image",
  ".jpg": "image",
  ".js": "javascript",
  ".json": "json",
  ".jsx": "jsx",
  ".md": "markdown",
  ".mjs": "javascript",
  ".png": "image",
  ".scss": "css",
  ".svg": "image",
  ".ts": "ts",
  ".tsx": "jsx",
  ".webp": "image",
  ".yaml": "yaml",
  ".yml": "yaml",
};

const SPECIAL_FILE_ICON_MAP: Array<{
  icon: FileIconName;
  match: (name: string) => boolean;
}> = [
  {
    icon: "eslint",
    match: (name) =>
      name.includes(".eslintrc") ||
      name === ".eslintignore" ||
      name.endsWith(".eslint"),
  },
  {
    icon: "git",
    match: (name) =>
      name === ".gitignore" ||
      name === ".gitattributes" ||
      name.includes(".git"),
  },
  {
    icon: "prettier",
    match: (name) =>
      name.includes(".prettierrc") ||
      name === ".prettierignore" ||
      name.includes(".prettier"),
  },
  {
    icon: "markdown",
    match: (name) => name === "readme.md",
  },
];

export function FileTypeIcon({
  className,
  kind = "file",
  open = false,
  path,
}: FileTypeIconProps) {
  const iconName =
    kind === "directory" ? "folder" : getFileIconName(path, open);

  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
      src={`/file-icons/${iconName}.svg`}
    />
  );
}

function getFileIconName(path: string, _open: boolean): FileIconName {
  const fileName =
    path.split("/").filter(Boolean).pop()?.toLowerCase() ?? path.toLowerCase();

  for (const item of SPECIAL_FILE_ICON_MAP) {
    if (item.match(fileName)) {
      return item.icon;
    }
  }

  const extension = fileName.slice(fileName.lastIndexOf("."));

  return FILE_ICON_MAP[extension] ?? "json";
}
