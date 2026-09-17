import { WebhookBlock } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'

/**
 * The Webhook listener block. It does not call anything itself: emitting a
 * client-side action flagged `expectsDedicatedReply` is what makes executeGroup
 * park the session on this block (stamping `currentBlockId`) and stops
 * saveStateToDatabase from closing it. The flow stays there until an inbound
 * call to the block's callback URL resumes it.
 */
export const executeWebhookBlock = (
  block: WebhookBlock
): ExecuteLogicResponse => ({
  outgoingEdgeId: block.outgoingEdgeId,
  clientSideActions: [
    {
      type: 'listenForWebhook',
      expectsDedicatedReply: true,
    },
  ],
})
