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
            item.componentId,
            item.pageId,
            item.sectionId,
            item.routeId,
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

function normalizeRoute(value: unknown) {
  if (typeof value === "string") {
    const title = value.trim() || "Route";
    const pageId = buildStableId(title, "page");
    return {
      routeId: buildStableId(title, "route"),
      title,
      path: `/${pageId}`,
      pageId,
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
      candidate.label,
      candidate.pageTitle,
    ) ?? "Route";

  candidate.title = title;
  candidate.pageId =
    firstNonEmptyString(
      candidate.pageId,
      candidate.page,
      candidate.pageRef,
      candidate.targetPageId,
    ) ?? buildStableId(title, "page");
  candidate.routeId =
    firstNonEmptyString(
      candidate.routeId,
      candidate.id,
      candidate.key,
      candidate.navigationId,
    ) ?? buildStableId(title, "route");
  candidate.path =
    firstNonEmptyString(
      candidate.path,
      candidate.url,
      candidate.route,
      candidate.href,
    ) ?? `/${candidate.pageId}`;

  return candidate;
}

function normalizeSection(value: unknown) {
  if (typeof value === "string") {
    const title = value.trim() || "Section";
    return {
      sectionId: buildStableId(title, "section"),
      title,
      purpose: `${title} section purpose`,
      componentIds: [buildStableId(title, "component")],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const title =
    firstNonEmptyString(candidate.title, candidate.name, candidate.label) ??
    "Section";

  candidate.title = title;
  candidate.sectionId =
    firstNonEmptyString(candidate.sectionId, candidate.id, candidate.key) ??
    buildStableId(title, "section");
  candidate.purpose =
    firstNonEmptyString(
      candidate.purpose,
      candidate.description,
      candidate.summary,
    ) ?? `${title} section purpose`;
  const componentIds = toStringArray(
    candidate.componentIds ??
      candidate.components ??
      candidate.items ??
      candidate.componentRefs,
  );
  candidate.componentIds =
    componentIds.length > 0
      ? componentIds
      : [buildStableId(title, "component")];

  return candidate;
}

function normalizePage(value: unknown) {
  if (typeof value === "string") {
    const title = value.trim() || "Page";
    const pageId = buildStableId(title, "page");
    const componentId = buildStableId(title, "component");
    return {
      pageId,
      title,
      layout: "single-column",
      sections: [
        {
          sectionId: buildStableId(title, "section"),
          title: `${title} main section`,
          purpose: `${title} page main content`,
          componentIds: [componentId],
        },
      ],
      primaryComponentIds: [componentId],
      behaviorIds: [buildStableId(title, "behavior")],
      dataModelIds: [buildStableId(title, "model")],
    };
  }

  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };
  const title =
    firstNonEmptyString(candidate.title, candidate.name, candidate.label) ??
    "Page";

  candidate.title = title;
  candidate.pageId =
    firstNonEmptyString(candidate.pageId, candidate.id, candidate.key) ??
    buildStableId(title, "page");
  candidate.layout =
    firstNonEmptyString(
      candidate.layout,
      candidate.layoutType,
      candidate.template,
      candidate.structure,
    ) ?? "single-column";
  const sections = toObjectArray(
    candidate.sections,
    candidate.areas ?? candidate.regions ?? candidate.blocks,
  ).map(normalizeSection);
  const primaryComponentIds = toStringArray(
    candidate.primaryComponentIds ??
      candidate.componentIds ??
      candidate.components ??
      candidate.mainComponents,
  );

  if (sections.length > 0) {
    candidate.sections = sections;
  } else {
    const fallbackComponentId =
      primaryComponentIds[0] ?? buildStableId(title, "component");
    candidate.sections = [
      normalizeSection({
        title: `${title} main section`,
        componentIds: [fallbackComponentId],
      }),
    ];
  }

  const derivedComponentIds =
    primaryComponentIds.length > 0
      ? primaryComponentIds
      : toStringArray(
          (candidate.sections as Array<Record<string, unknown>>).flatMap(
            (section) => section.componentIds ?? [],
          ),
        );

  candidate.primaryComponentIds =
    derivedComponentIds.length > 0
      ? derivedComponentIds
      : [buildStableId(title, "component")];
  candidate.behaviorIds = (() => {
    const ids = toStringArray(
      candidate.behaviorIds ?? candidate.behaviors ?? candidate.actions,
    );
    return ids.length > 0 ? ids : [buildStableId(title, "behavior")];
  })();
  candidate.dataModelIds = (() => {
    const ids = toStringArray(
      candidate.dataModelIds ??
        candidate.dataModels ??
        candidate.modelIds ??
        candidate.entities,
    );
    return ids.length > 0 ? ids : [buildStableId(title, "model")];
  })();

  return candidate;
}

function normalizeComponentInventoryItem(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim() || "Component";
    return {
      componentId: buildStableId(name, "component"),
      name,
      kind: "business-component",
      summary: `${name} component summary`,
      pageIds: [buildStableId(name, "page")],
      behaviorIds: [buildStableId(name, "behavior")],
      dataModelIds: [buildStableId(name, "model")],
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
  candidate.kind =
    firstNonEmptyString(candidate.kind, candidate.type, candidate.category) ??
    "business-component";
  candidate.summary =
    firstNonEmptyString(
      candidate.summary,
      candidate.description,
      candidate.purpose,
    ) ?? `${name} component summary`;
  candidate.pageIds = (() => {
    const ids = toStringArray(
      candidate.pageIds ?? candidate.pages ?? candidate.pageRefs,
    );
    return ids.length > 0 ? ids : [buildStableId(name, "page")];
  })();
  candidate.behaviorIds = (() => {
    const ids = toStringArray(
      candidate.behaviorIds ?? candidate.behaviors ?? candidate.actions,
    );
    return ids.length > 0 ? ids : [buildStableId(name, "behavior")];
  })();
  candidate.dataModelIds = (() => {
    const ids = toStringArray(
      candidate.dataModelIds ??
        candidate.dataModels ??
        candidate.modelIds ??
        candidate.entities,
    );
    return ids.length > 0 ? ids : [buildStableId(name, "model")];
  })();

  return candidate;
}

function normalizeThemeStrategy(value: unknown) {
  if (typeof value === "string") {
    const tone = value.trim() || "clean";
    return {
      styleTone: [tone],
      visualGuidelines: [`Use ${tone} visual direction consistently`],
      designConstraints: ["Keep the MVP UI focused and scannable"],
    };
  }

  if (Array.isArray(value)) {
    const tone = toStringArray(value);
    return {
      styleTone: tone.length > 0 ? tone : ["clean"],
      visualGuidelines: ["Keep the visual language consistent"],
      designConstraints: ["Keep the MVP UI focused and scannable"],
    };
  }

  if (!isRecord(value)) {
    return {
      styleTone: ["clean"],
      visualGuidelines: ["Keep the visual language consistent"],
      designConstraints: ["Keep the MVP UI focused and scannable"],
    };
  }

  const candidate = { ...value };
  const styleTone = toStringArray(
    candidate.styleTone ?? candidate.style ?? candidate.tone,
  );
  const visualGuidelines = toStringArray(
    candidate.visualGuidelines ?? candidate.guidelines ?? candidate.visuals,
  );
  const designConstraints = toStringArray(
    candidate.designConstraints ?? candidate.constraints ?? candidate.rules,
  );

  return {
    styleTone: styleTone.length > 0 ? styleTone : ["clean"],
    visualGuidelines:
      visualGuidelines.length > 0
        ? visualGuidelines
        : ["Keep the visual language consistent"],
    designConstraints:
      designConstraints.length > 0
        ? designConstraints
        : ["Keep the MVP UI focused and scannable"],
  };
}

function normalizeUiObject(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  const candidate = { ...value };

  const routes = toObjectArray(
    candidate.routes,
    candidate.navigation ?? candidate.router ?? candidate.routeTable,
  ).map(normalizeRoute);
  const pages = toObjectArray(
    candidate.pages,
    candidate.screens ?? candidate.views ?? candidate.pageLayouts,
  ).map(normalizePage);
  const componentInventory = toObjectArray(
    candidate.componentInventory,
    candidate.components ?? candidate.inventory ?? candidate.componentList,
  ).map(normalizeComponentInventoryItem);
  candidate.routes = routes;
  candidate.pages = pages;
  candidate.componentInventory = componentInventory;
  candidate.themeStrategy = normalizeThemeStrategy(
    candidate.themeStrategy ?? candidate.theme ?? candidate.themePlan,
  );

  const pageIds = pages
    .map((page) => (isRecord(page) ? firstNonEmptyString(page.pageId) : null))
    .filter((item): item is string => Boolean(item));
  const componentIds = componentInventory
    .map((component) =>
      isRecord(component) ? firstNonEmptyString(component.componentId) : null,
    )
    .filter((item): item is string => Boolean(item));

  candidate.routes = routes.map((route) => {
    if (!isRecord(route)) {
      return route;
    }

    const record = { ...route };
    record.pageId =
      firstNonEmptyString(record.pageId) ??
      pageIds[0] ??
      buildStableId(record.title, "page");
    return record;
  });

  candidate.pages = pages.map((page) => {
    if (!isRecord(page)) {
      return page;
    }

    const record = { ...page };
    const primaryComponentIds = toStringArray(record.primaryComponentIds);
    record.primaryComponentIds =
      primaryComponentIds.length > 0
        ? primaryComponentIds
        : componentIds.slice(0, Math.max(1, Math.min(componentIds.length, 2)));

    return record;
  });

  candidate.componentInventory = componentInventory.map((component) => {
    if (!isRecord(component)) {
      return component;
    }

    const record = { ...component };
    const pageIdsForComponent = toStringArray(record.pageIds);
    record.pageIds =
      pageIdsForComponent.length > 0
        ? pageIdsForComponent
        : pageIds.slice(0, Math.max(1, Math.min(pageIds.length, 1)));

    return record;
  });

  return candidate;
}

export const WorkflowUiRouteSchema = z.object({
  routeId: z.string().min(1),
  title: z.string().min(1),
  path: z.string().min(1),
  pageId: z.string().min(1),
});

export const WorkflowUiSectionSchema = z.object({
  sectionId: z.string().min(1),
  title: z.string().min(1),
  purpose: z.string().min(1),
  componentIds: z.array(z.string()).min(1),
});

export const WorkflowUiPageSchema = z.object({
  pageId: z.string().min(1),
  title: z.string().min(1),
  layout: z.string().min(1),
  sections: z.array(WorkflowUiSectionSchema).min(1),
  primaryComponentIds: z.array(z.string()).min(1),
  behaviorIds: z.array(z.string()).min(1),
  dataModelIds: z.array(z.string()).min(1),
});

export const WorkflowUiComponentInventorySchema = z.object({
  componentId: z.string().min(1),
  name: z.string().min(1),
  kind: z.string().min(1),
  summary: z.string().min(1),
  pageIds: z.array(z.string()).min(1),
  behaviorIds: z.array(z.string()).min(1),
  dataModelIds: z.array(z.string()).min(1),
});

export const WorkflowUiThemeStrategySchema = z.object({
  styleTone: z.array(z.string()).min(1),
  visualGuidelines: z.array(z.string()).min(1),
  designConstraints: z.array(z.string()).min(1),
});

export const WorkflowUiSchema = z.preprocess(
  normalizeUiObject,
  z.object({
    routes: z.array(WorkflowUiRouteSchema).min(1),
    pages: z.array(WorkflowUiPageSchema).min(1),
    componentInventory: z.array(WorkflowUiComponentInventorySchema).min(1),
    themeStrategy: WorkflowUiThemeStrategySchema,
  }),
);

export const NullableWorkflowUiSchema = WorkflowUiSchema.nullable();

export type WorkflowUi = z.infer<typeof WorkflowUiSchema>;
