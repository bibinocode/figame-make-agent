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

function inferCategoryFromProductName(name: string) {
  if (/作品集|portfolio/i.test(name)) {
    return "个人作品集";
  }

  if (/博客|blog/i.test(name)) {
    return "个人博客";
  }

  if (/后台|管理/i.test(name)) {
    return "后台管理";
  }

  return "产品类别待确认";
}

function normalizeIntentObject(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };
  const goals =
    typeof candidate.goals === "object" && candidate.goals !== null
      ? { ...(candidate.goals as Record<string, unknown>) }
      : {};
  const productValue = candidate.product;
  const topLevelTargetUsers = toStringArray(candidate.targetUsers);
  const topLevelGoals = toStringArray(candidate.goals);

  if (Array.isArray(candidate.goals) || typeof candidate.goals === "string") {
    candidate.goals = {
      primary: topLevelGoals,
      secondary: null,
    };
  } else {
    candidate.goals = {
      primary: toStringArray(goals.primary),
      secondary: toStringArray(goals.secondary),
    };
  }

  if (typeof productValue === "string") {
    const productName = productValue.trim() || "产品名称待确认";
    candidate.product = {
      name: productName,
      description:
        typeof candidate.description === "string" &&
        candidate.description.trim()
          ? candidate.description.trim()
          : ((
              candidate.goals as {
                primary: string[];
                secondary: string[] | null;
              }
            ).primary[0] ?? `${productName}相关产品`),
      targetUsers:
        topLevelTargetUsers.length > 0
          ? topLevelTargetUsers
          : ["目标用户待确认"],
      primaryScenario:
        typeof candidate.primaryScenario === "string" &&
        candidate.primaryScenario.trim()
          ? candidate.primaryScenario.trim()
          : "核心使用场景待补充",
    };
  } else if (typeof productValue === "object" && productValue !== null) {
    const productRecord = { ...(productValue as Record<string, unknown>) };
    const productName =
      typeof productRecord.name === "string" && productRecord.name.trim()
        ? productRecord.name.trim()
        : "产品名称待确认";

    candidate.product = {
      name: productName,
      description:
        typeof productRecord.description === "string" &&
        productRecord.description.trim()
          ? productRecord.description.trim()
          : ((
              candidate.goals as {
                primary: string[];
                secondary: string[] | null;
              }
            ).primary[0] ?? `${productName}相关产品`),
      targetUsers: (() => {
        const users = toStringArray(productRecord.targetUsers);
        if (users.length > 0) {
          return users;
        }

        if (topLevelTargetUsers.length > 0) {
          return topLevelTargetUsers;
        }

        return ["目标用户待确认"];
      })(),
      primaryScenario:
        typeof productRecord.primaryScenario === "string" &&
        productRecord.primaryScenario.trim()
          ? productRecord.primaryScenario.trim()
          : "核心使用场景待补充",
    };
  }

  candidate.nonGoals = toStringArray(candidate.nonGoals);

  const assumptions = toStringArray(candidate.assumptions);
  candidate.assumptions = assumptions.length > 0 ? assumptions : null;

  if (typeof candidate.category !== "string" || !candidate.category.trim()) {
    const productName =
      typeof candidate.product === "object" &&
      candidate.product !== null &&
      typeof (candidate.product as Record<string, unknown>).name === "string"
        ? ((candidate.product as Record<string, unknown>).name as string)
        : "产品";

    candidate.category = inferCategoryFromProductName(productName);
  } else {
    candidate.category = candidate.category.trim();
  }

  return candidate;
}

export const WorkflowIntentProductSchema = z.object({
  name: z.string().min(1).describe("产品名称"),
  description: z.string().min(1).describe("产品描述"),
  targetUsers: z.array(z.string()).min(1).describe("目标用户"),
  primaryScenario: z.string().min(1).describe("主要使用场景"),
});

export const WorkflowIntentGoalsSchema = z.object({
  primary: z.array(z.string()).min(1).describe("核心目标"),
  secondary: z.array(z.string()).nullable().describe("次要目标"),
});

const WorkflowIntentBaseSchema = z.object({
  product: WorkflowIntentProductSchema,
  goals: WorkflowIntentGoalsSchema,
  nonGoals: z.array(z.string()).describe("当前阶段不做的事情"),
  assumptions: z.array(z.string()).nullable().describe("保守假设"),
  category: z.string().describe("产品类别"),
});

export const WorkflowIntentSchema = z.preprocess(
  normalizeIntentObject,
  WorkflowIntentBaseSchema,
);

export const NullableWorkflowIntentSchema = WorkflowIntentSchema.nullable();

export type WorkflowIntent = z.infer<typeof WorkflowIntentSchema>;
