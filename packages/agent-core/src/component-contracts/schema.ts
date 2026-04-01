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

function buildStableId(value: unknown, fallback: string) {
  const source = firstNonEmptyString(value, fallback) ?? fallback;
  return source
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/]/g, "-");
}

function normalizePriority(value: unknown) {
  if (typeof value !== "string") {
    return "CORE";
  }

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (normalized === "SUPPORTING" || normalized === "AUXILIARY") {
    return "SUPPORTING";
  }

  return "CORE";
}

function normalizeProp(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "prop";
    return {
      name,
      type: "string",
      required: true,
      source: "derived-from-planning",
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  candidate.name =
    firstNonEmptyString(
      candidate.name,
      candidate.id,
      candidate.key,
      candidate.label,
    ) ?? "prop";
  candidate.type =
    firstNonEmptyString(
      candidate.type,
      candidate.valueType,
      candidate.dataType,
      candidate.propType,
    ) ?? "string";
  candidate.required =
    typeof candidate.required === "boolean" ? candidate.required : true;
  candidate.source =
    firstNonEmptyString(
      candidate.source,
      candidate.from,
      candidate.origin,
      candidate.description,
    ) ?? "derived-from-planning";

  return candidate;
}

function normalizeEvent(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "event";
    return {
      name,
      payloadType: "void",
      trigger: `Triggered by ${name}`,
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
      candidate.event,
      candidate.label,
    ) ?? "event";

  candidate.name = name;
  candidate.payloadType =
    firstNonEmptyString(
      candidate.payloadType,
      candidate.type,
      candidate.eventPayload,
      candidate.valueType,
    ) ?? "void";
  candidate.trigger =
    firstNonEmptyString(
      candidate.trigger,
      candidate.when,
      candidate.description,
    ) ?? `Triggered by ${name}`;

  return candidate;
}

function normalizeComponentContract(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "Component";
    return {
      componentId: buildStableId(name, "component"),
      name,
      purpose: `${name} component purpose`,
      props: [normalizeProp("data")],
      events: [normalizeEvent("select")],
      dataDependencies: [buildStableId(name, "model")],
      behaviorBindings: [buildStableId(name, "behavior")],
      priority: "CORE",
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
      candidate.componentId,
      candidate.id,
      candidate.label,
    ) ?? "Component";

  candidate.name = name;
  candidate.componentId =
    firstNonEmptyString(candidate.componentId, candidate.id, candidate.key) ??
    buildStableId(name, "component");
  candidate.purpose =
    firstNonEmptyString(
      candidate.purpose,
      candidate.summary,
      candidate.description,
    ) ?? `${name} component purpose`;

  const props = toObjectArray(
    candidate.props,
    candidate.properties ?? candidate.inputs,
  ).map(normalizeProp);
  const events = toObjectArray(
    candidate.events,
    candidate.outputs ?? candidate.handlers,
  ).map(normalizeEvent);

  candidate.props = props.length > 0 ? props : [normalizeProp("data")];
  candidate.events = events.length > 0 ? events : [normalizeEvent("select")];
  candidate.dataDependencies = (() => {
    const ids = toStringArray(
      candidate.dataDependencies ??
        candidate.dataModels ??
        candidate.modelIds ??
        candidate.entities,
    );
    return ids.length > 0 ? ids : [buildStableId(name, "model")];
  })();
  candidate.behaviorBindings = (() => {
    const ids = toStringArray(
      candidate.behaviorBindings ??
        candidate.behaviors ??
        candidate.behaviorIds ??
        candidate.actions,
    );
    return ids.length > 0 ? ids : [buildStableId(name, "behavior")];
  })();
  candidate.priority = normalizePriority(
    candidate.priority ?? candidate.level ?? candidate.importance,
  );

  return candidate;
}

function normalizeComponentContractsObject(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  candidate.components = toObjectArray(
    candidate.components,
    candidate.componentContracts ??
      candidate.contracts ??
      candidate.inventory,
  ).map(normalizeComponentContract);

  return candidate;
}

export const WorkflowComponentPropSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  required: z.boolean(),
  source: z.string().min(1),
});

export const WorkflowComponentEventSchema = z.object({
  name: z.string().min(1),
  payloadType: z.string().min(1),
  trigger: z.string().min(1),
});

export const WorkflowComponentContractSchema = z.object({
  componentId: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  props: z.array(WorkflowComponentPropSchema).min(1),
  events: z.array(WorkflowComponentEventSchema).min(1),
  dataDependencies: z.array(z.string()).min(1),
  behaviorBindings: z.array(z.string()).min(1),
  priority: z.enum(["CORE", "SUPPORTING"]),
});

export const WorkflowComponentContractsSchema = z.preprocess(
  normalizeComponentContractsObject,
  z.object({
    components: z.array(WorkflowComponentContractSchema).min(1),
  }),
);

export const NullableWorkflowComponentContractsSchema =
  WorkflowComponentContractsSchema.nullable();

export type WorkflowComponentContracts = z.infer<
  typeof WorkflowComponentContractsSchema
>;
