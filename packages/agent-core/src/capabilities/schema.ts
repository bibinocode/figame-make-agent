import { z } from "zod";

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function normalizeField(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (
    (typeof candidate.name !== "string" || !candidate.name.trim()) &&
    typeof candidate.id === "string"
  ) {
    candidate.name = candidate.id;
  }

  if (typeof candidate.required !== "boolean") {
    candidate.required = true;
  }

  if (
    (typeof candidate.summary !== "string" || !candidate.summary.trim()) &&
    typeof candidate.description === "string"
  ) {
    candidate.summary = candidate.description;
  }

  if (
    typeof candidate.summary !== "string" ||
    !candidate.summary.trim()
  ) {
    candidate.summary = `${candidate.name ?? "字段"}说明`;
  }

  if (typeof candidate.type !== "string" || !candidate.type.trim()) {
    candidate.type = "string";
  }

  return candidate;
}

function normalizePage(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (
    (typeof candidate.title !== "string" || !candidate.title.trim()) &&
    typeof candidate.name === "string"
  ) {
    candidate.title = candidate.name;
  }

  if (
    (typeof candidate.purpose !== "string" || !candidate.purpose.trim()) &&
    typeof candidate.description === "string"
  ) {
    candidate.purpose = candidate.description;
  }

  candidate.coreBehaviors = toStringArray(candidate.coreBehaviors);
  candidate.relatedDataModels = toStringArray(candidate.relatedDataModels);

  return candidate;
}

function normalizeBehavior(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (
    (typeof candidate.name !== "string" || !candidate.name.trim()) &&
    typeof candidate.id === "string"
  ) {
    candidate.name = candidate.id;
  }

  if (
    (typeof candidate.summary !== "string" || !candidate.summary.trim()) &&
    typeof candidate.description === "string"
  ) {
    candidate.summary = candidate.description;
  }

  if (
    typeof candidate.summary !== "string" ||
    !candidate.summary.trim()
  ) {
    candidate.summary = `${candidate.name ?? "行为"}说明`;
  }

  if (
    typeof candidate.trigger !== "string" ||
    !candidate.trigger.trim()
  ) {
    candidate.trigger = "用户进入相关页面后触发";
  }

  candidate.pages = toStringArray(candidate.pages);
  candidate.dataModels = toStringArray(candidate.dataModels);

  return candidate;
}

function normalizeDataModel(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (
    (typeof candidate.name !== "string" || !candidate.name.trim()) &&
    typeof candidate.id === "string"
  ) {
    candidate.name = candidate.id;
  }

  if (
    (typeof candidate.summary !== "string" || !candidate.summary.trim()) &&
    typeof candidate.description === "string"
  ) {
    candidate.summary = candidate.description;
  }

  if (
    typeof candidate.summary !== "string" ||
    !candidate.summary.trim()
  ) {
    candidate.summary = `${candidate.name ?? "数据模型"}说明`;
  }

  candidate.usedByPages = toStringArray(candidate.usedByPages);
  candidate.usedByBehaviors = toStringArray(candidate.usedByBehaviors);

  if (Array.isArray(candidate.fields)) {
    candidate.fields = candidate.fields.map(normalizeField);
  }

  return candidate;
}

function normalizeCapabilitiesObject(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (Array.isArray(candidate.pages)) {
    candidate.pages = candidate.pages.map(normalizePage);
  }

  if (Array.isArray(candidate.behaviors)) {
    candidate.behaviors = candidate.behaviors.map(normalizeBehavior);
  }

  if (Array.isArray(candidate.dataModels)) {
    candidate.dataModels = candidate.dataModels.map(normalizeDataModel);
  }

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
