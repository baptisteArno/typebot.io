import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

// One entry per field the selected flow's entry screen declares (fetched from
// the Hub's whatsapp-flows/:flowId/variables endpoint, which mirrors core's
// `flowjson.EntryDataField`). `fieldName`/`fieldType` are copied in at
// selection time purely for display — the source of truth for what the flow
// actually needs is always re-fetched live, never trusted from a stale block.
export const triggerWhatsappFlowVariableMappingSchema = z.object({
  id: z.string(),
  fieldName: z.string(),
  fieldType: z.string().optional(),
  variableId: z.string().optional(),
})
export type TriggerWhatsappFlowVariableMapping = z.infer<
  typeof triggerWhatsappFlowVariableMappingSchema
>

export const triggerWhatsappFlowOptionsSchema = z.object({
  flowId: z.string().optional(),
  flowName: z.string().optional(),
  body: z.string().optional(),
  cta: z.string().optional(),
  variableMapping: z.array(triggerWhatsappFlowVariableMappingSchema).optional(),
})

export const triggerWhatsappFlowBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.TRIGGER_WHATSAPP_FLOW]),
    options: triggerWhatsappFlowOptionsSchema.optional(),
  })
)

export type TriggerWhatsappFlowBlock = z.infer<
  typeof triggerWhatsappFlowBlockSchema
>
