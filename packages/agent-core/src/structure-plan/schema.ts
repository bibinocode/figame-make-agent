import { z } from "zod";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") {
          const trimmed = item.trim();
          return trimmed ? [trimmed] : [];
        }

        if (isRecord(item)) {
          const candidate = firstNonEmptyString(
            item.id,
            item.name,
            item.title,
            item.path,
            item.label,
          );
          return candidate ? [candidate] : [];
        }

        return [];
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function toObjectArray(value: unknown, aliasValue?: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(aliasValue)) {
    return aliasValue;
  }

  if (isRecord(value)) {
    return [value];
  }

  if (isRecord(aliasValue)) {
    return [aliasValue];
  }

  return [];
}

function normalizeStructureFile(value: unknown) {
  if (typeof value === "string") {
    const path = value.trim() || "src/generated.ts";
    return {
      path,
      kind: "source",
      description: `${path} generated file`,
      sourceCorrelation: ["planning-artifact"],
      generatedBy: ["structure-plan"],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const path =
    firstNonEmptyString(
      candidate.path,
      candidate.filePath,
      candidate.output,
      candidate.target,
    ) ?? "src/generated.ts";

  candidate.path = path;
  candidate.kind =
    firstNonEmptyString(candidate.kind, candidate.type, candidate.category) ??
    "source";
  candidate.description =
    firstNonEmptyString(
      candidate.description,
      candidate.summary,
      candidate.purpose,
    ) ?? `${path} generated file`;
  candidate.sourceCorrelation = (() => {
    const items = toStringArray(
      candidate.sourceCorrelation ??
        candidate.source ??
        candidate.sourceRefs ??
        candidate.correlations,
    );
    return items.length > 0 ? items : ["planning-artifact"];
  })();
  candidate.generatedBy = (() => {
    const items = toStringArray(
      candidate.generatedBy ??
        candidate.by ??
        candidate.origin ??
        candidate.generatedFrom,
    );
    return items.length > 0 ? items : ["structure-plan"];
  })();

  return candidate;
}

function normalizeStructureRoute(value: unknown) {
  if (typeof value === "string") {
    const normalizedPath = value.trim() || "/";
    return {
      path: normalizedPath,
      pageId: normalizedPath === "/" ? "home-page" : normalizedPath.slice(1),
      componentIds: ["page-shell"],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const path =
    firstNonEmptyString(
      candidate.path,
      candidate.routePath,
      candidate.url,
      candidate.href,
    ) ?? "/";

  candidate.path = path;
  candidate.pageId =
    firstNonEmptyString(
      candidate.pageId,
      candidate.page,
      candidate.pageRef,
      candidate.targetPageId,
    ) ?? (path === "/" ? "home-page" : path.replace(/^\//, "") || "page");
  candidate.componentIds = (() => {
    const ids = toStringArray(
      candidate.componentIds ??
        candidate.components ??
        candidate.componentRefs,
    );
    return ids.length > 0 ? ids : ["page-shell"];
  })();

  return candidate;
}

function normalizeStructureObject(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  candidate.files = toObjectArray(
    candidate.files,
    candidate.filePlan ?? candidate.fileManifest ?? candidate.outputs,
  ).map(normalizeStructureFile);
  candidate.routingTable = toObjectArray(
    candidate.routingTable,
    candidate.routes ?? candidate.routeTable ?? candidate.navigation,
  ).map(normalizeStructureRoute);
  candidate.foundationStrategy = (() => {
    const items = toStringArray(
      candidate.foundationStrategy ??
        candidate.foundation ??
        candidate.baseFiles ??
        candidate.setupStrategy,
    );
    return items.length > 0 ? items : ["Create the minimum shared foundation files"];
  })();

  return candidate;
}

export const WorkflowStructureFileSchema = z.object({
  path: z.string().min(1),
  kind: z.string().min(1),
  description: z.string().min(1),
  sourceCorrelation: z.array(z.string()).min(1),
  generatedBy: z.array(z.string()).min(1),
});

export const WorkflowStructureRouteSchema = z.object({
  path: z.string().min(1),
  pageId: z.string().min(1),
  componentIds: z.array(z.string()).min(1),
});

export const WorkflowStructureSchema = z.preprocess(
  normalizeStructureObject,
  z.object({
    files: z.array(WorkflowStructureFileSchema).min(1),
    routingTable: z.array(WorkflowStructureRouteSchema).min(1),
    foundationStrategy: z.array(z.string()).min(1),
  }),
);

export const NullableWorkflowStructureSchema =
  WorkflowStructureSchema.nullable();

export type WorkflowStructurePlan = z.infer<typeof WorkflowStructureSchema>;
