import { z } from "zod";

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

export const WorkflowComponentContractsSchema = z.object({
  components: z.array(WorkflowComponentContractSchema).min(1),
});

export const NullableWorkflowComponentContractsSchema =
  WorkflowComponentContractsSchema.nullable();

export type WorkflowComponentContracts = z.infer<
  typeof WorkflowComponentContractsSchema
>;
