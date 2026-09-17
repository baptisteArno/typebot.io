import { SessionState, TriggerWhatsappFlowBlock } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { byId } from '@typebot.io/lib'

/**
 * Fires a WhatsApp Flow at the current contact and lets the conversation
 * continue normally — the Flow is filled out asynchronously in WhatsApp's own
 * native UI; its completion comes back through the platform's own flow-
 * response ledger, entirely outside this typebot session. Unlike Assign Chat,
 * this is not a handoff: the bot keeps talking.
 *
 * Every mapped variable is resolved to its CURRENT literal value here, before
 * the action ever leaves the engine — the receiving side (the Hub) is handed
 * plain data, never a `{{Variable}}` placeholder to interpret itself.
 */
export const executeTriggerWhatsappFlow = (
  state: SessionState,
  block: TriggerWhatsappFlowBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot

  if (!block.options?.flowId) return { outgoingEdgeId: block.outgoingEdgeId }

  const data = (block.options.variableMapping ?? []).reduce<
    Record<string, unknown>
  >((acc, mapping) => {
    if (!mapping.fieldName || !mapping.variableId) return acc
    const variable = variables.find(byId(mapping.variableId))
    if (!variable) return acc
    acc[mapping.fieldName] = variable.value
    return acc
  }, {})

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'triggerWhatsappFlow',
        triggerWhatsappFlow: {
          flowId: block.options.flowId,
          body: block.options.body
            ? parseVariables(variables)(block.options.body)
            : undefined,
          cta: block.options.cta
            ? parseVariables(variables)(block.options.cta)
            : undefined,
          data,
        },
      },
    ],
  }
}
