import { z } from "zod";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
            item.label,
            item.key,
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

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function buildStableId(value: unknown, fallback: string) {
  const source = firstNonEmptyString(value, fallback) ?? fallback;
  return source
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/]/g, "-");
}

function normalizeField(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "field";
    return {
      name,
      type: "string",
      required: true,
      summary: `${name} summary`,
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const name =
    firstNonEmptyString(
      candidate.name,
      candidate.id,
      candidate.key,
      candidate.label,
      candidate.title,
    ) ?? "field";

  candidate.name = name;
  candidate.required =
    typeof candidate.required === "boolean" ? candidate.required : true;
  candidate.summary =
    firstNonEmptyString(
      candidate.summary,
      candidate.description,
      candidate.purpose,
      candidate.note,
    ) ?? `${name} summary`;
  candidate.type =
    firstNonEmptyString(
      candidate.type,
      candidate.valueType,
      candidate.dataType,
      candidate.fieldType,
    ) ?? "string";

  return candidate;
}

function normalizePage(value: unknown) {
  if (typeof value === "string") {
    const title = value.trim() || "Page";
    return {
      id: buildStableId(title, "page"),
      title,
      purpose: `${title} page purpose`,
      coreBehaviors: [],
      relatedDataModels: [],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const title =
    firstNonEmptyString(
      candidate.title,
      candidate.name,
      candidate.pageTitle,
      candidate.label,
    ) ?? "Page";

  candidate.title = title;
  candidate.id =
    firstNonEmptyString(
      candidate.id,
      candidate.pageId,
      candidate.routeId,
      candidate.key,
    ) ?? buildStableId(title, "page");
  candidate.purpose =
    firstNonEmptyString(
      candidate.purpose,
      candidate.description,
      candidate.summary,
      candidate.goal,
      candidate.overview,
    ) ?? `${title} page purpose`;
  candidate.coreBehaviors = toStringArray(
    candidate.coreBehaviors ??
      candidate.behaviors ??
      candidate.behaviorIds ??
      candidate.primaryBehaviors ??
      candidate.coreActions,
  );
  candidate.relatedDataModels = toStringArray(
    candidate.relatedDataModels ??
      candidate.dataModels ??
      candidate.modelIds ??
      candidate.relatedModels ??
      candidate.entities,
  );

  return candidate;
}

function normalizeBehavior(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "Behavior";
    return {
      id: buildStableId(name, "behavior"),
      name,
      summary: `${name} summary`,
      trigger: "When the user interacts with the related page",
      pages: [],
      dataModels: [],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const name =
    firstNonEmptyString(
      candidate.name,
      candidate.title,
      candidate.id,
      candidate.action,
      candidate.label,
    ) ?? "Behavior";

  candidate.name = name;
  candidate.id =
    firstNonEmptyString(
      candidate.id,
      candidate.behaviorId,
      candidate.actionId,
      candidate.key,
    ) ?? buildStableId(name, "behavior");
  candidate.summary =
    firstNonEmptyString(
      candidate.summary,
      candidate.description,
      candidate.purpose,
      candidate.goal,
    ) ?? `${name} summary`;
  candidate.trigger =
    firstNonEmptyString(
      candidate.trigger,
      candidate.when,
      candidate.activation,
      candidate.userTrigger,
    ) ?? "When the user interacts with the related page";
  candidate.pages = toStringArray(
    candidate.pages ??
      candidate.pageIds ??
      candidate.relatedPages ??
      candidate.usedInPages,
  );
  candidate.dataModels = toStringArray(
    candidate.dataModels ??
      candidate.relatedDataModels ??
      candidate.modelIds ??
      candidate.entities ??
      candidate.models,
  );

  return candidate;
}

function normalizeDataModel(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "DataModel";
    return {
      id: buildStableId(name, "model"),
      name,
      summary: `${name} summary`,
      fields: [normalizeField("id")],
      usedByPages: [],
      usedByBehaviors: [],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const name =
    firstNonEmptyString(
      candidate.name,
      candidate.title,
      candidate.id,
      candidate.entity,
      candidate.model,
      candidate.label,
    ) ?? "DataModel";

  candidate.name = name;
  candidate.id =
    firstNonEmptyString(
      candidate.id,
      candidate.dataModelId,
      candidate.modelId,
      candidate.entityId,
      candidate.key,
    ) ?? buildStableId(name, "model");
  candidate.summary =
    firstNonEmptyString(
      candidate.summary,
      candidate.description,
      candidate.purpose,
      candidate.overview,
    ) ?? `${name} summary`;
  candidate.usedByPages = toStringArray(
    candidate.usedByPages ?? candidate.pages ?? candidate.pageIds,
  );
  candidate.usedByBehaviors = toStringArray(
    candidate.usedByBehaviors ??
      candidate.behaviors ??
      candidate.behaviorIds ??
      candidate.actions,
  );

  const fields = toObjectArray(
    candidate.fields,
    candidate.properties ?? candidate.attributes ?? candidate.columns,
  ).map(normalizeField);
  candidate.fields = fields.length > 0 ? fields : [normalizeField("id")];

  return candidate;
}

function normalizeCapabilitiesObject(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const pages = toObjectArray(
    candidate.pages,
    candidate.pageBlueprints ?? candidate.pagePlans ?? candidate.screens,
  ).map(normalizePage);
  const behaviors = toObjectArray(
    candidate.behaviors,
    candidate.actions ?? candidate.flows ?? candidate.interactions,
  ).map(normalizeBehavior);
  const dataModels = toObjectArray(
    candidate.dataModels,
    candidate.models ?? candidate.entities ?? candidate.dataEntities,
  ).map(normalizeDataModel);
  candidate.pages = pages;
  candidate.behaviors = behaviors;
  candidate.dataModels = dataModels;

  const pageIds = pages
    .map((page) => (isRecord(page) ? firstNonEmptyString(page.id) : null))
    .filter((item): item is string => Boolean(item));
  const behaviorIds = behaviors
    .map((behavior) =>
      isRecord(behavior) ? firstNonEmptyString(behavior.id) : null,
    )
    .filter((item): item is string => Boolean(item));
  const dataModelIds = dataModels
    .map((model) => (isRecord(model) ? firstNonEmptyString(model.id) : null))
    .filter((item): item is string => Boolean(item));

  candidate.pages = pages.map((page) => {
    if (!isRecord(page)) {
      return page;
    }

    const record = { ...page };
    const coreBehaviors = toStringArray(record.coreBehaviors);
    const relatedDataModels = toStringArray(record.relatedDataModels);

    record.coreBehaviors =
      coreBehaviors.length > 0
        ? coreBehaviors
        : behaviorIds.slice(0, Math.max(1, Math.min(behaviorIds.length, 2)));
    record.relatedDataModels =
      relatedDataModels.length > 0
        ? relatedDataModels
        : dataModelIds.slice(0, Math.max(1, Math.min(dataModelIds.length, 2)));

    return record;
  });

  candidate.behaviors = behaviors.map((behavior) => {
    if (!isRecord(behavior)) {
      return behavior;
    }

    const record = { ...behavior };
    const pages = toStringArray(record.pages);
    const dataModels = toStringArray(record.dataModels);

    record.pages =
      pages.length > 0
        ? pages
        : pageIds.slice(0, Math.max(1, Math.min(pageIds.length, 1)));
    record.dataModels =
      dataModels.length > 0
        ? dataModels
        : dataModelIds.slice(
            0,
            Math.max(1, Math.min(dataModelIds.length, 2)),
          );

    return record;
  });

  candidate.dataModels = dataModels.map((model) => {
    if (!isRecord(model)) {
      return model;
    }

    const record = { ...model };
    const usedByPages = toStringArray(record.usedByPages);
    const usedByBehaviors = toStringArray(record.usedByBehaviors);

    record.usedByPages =
      usedByPages.length > 0
        ? usedByPages
        : pageIds.slice(0, Math.max(1, Math.min(pageIds.length, 2)));
    record.usedByBehaviors =
      usedByBehaviors.length > 0
        ? usedByBehaviors
        : behaviorIds.slice(
            0,
            Math.max(1, Math.min(behaviorIds.length, 2)),
          );

    return record;
  });

  return candidate;
}

export const WorkflowCapabilityPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  purpose: z.string().min(1),
  coreBehaviors: z.array(z.string()).min(1),
  relatedDataModels: z.array(z.string()).min(1),
});

export const WorkflowCapabilityBehaviorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  trigger: z.string().min(1),
  pages: z.array(z.string()).min(1),
  dataModels: z.array(z.string()).min(1),
});

export const WorkflowCapabilityDataFieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  required: z.boolean(),
  summary: z.string().min(1),
});

export const WorkflowCapabilityDataModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  fields: z.array(WorkflowCapabilityDataFieldSchema).min(1),
  usedByPages: z.array(z.string()).min(1),
  usedByBehaviors: z.array(z.string()).min(1),
});

export const WorkflowCapabilitiesSchema = z.preprocess(
  normalizeCapabilitiesObject,
  z.object({
    pages: z.array(WorkflowCapabilityPageSchema).min(1),
    behaviors: z.array(WorkflowCapabilityBehaviorSchema).min(1),
    dataModels: z.array(WorkflowCapabilityDataModelSchema).min(1),
  }),
);

export const NullableWorkflowCapabilitiesSchema =
  WorkflowCapabilitiesSchema.nullable();

export type WorkflowCapabilities = z.infer<typeof WorkflowCapabilitiesSchema>;
