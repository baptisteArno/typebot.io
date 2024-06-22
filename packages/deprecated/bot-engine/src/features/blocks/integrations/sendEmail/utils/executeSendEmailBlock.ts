import { parseVariables } from '@/features/variables'
import { IntegrationState } from '@/types'
import { parseLog } from '@/utils/helpers'
import { SendEmailBlock } from '@sniper.io/schemas'
import { sendRequest, byId } from '@sniper.io/lib'

export const executeSendEmailBlock = (
  block: SendEmailBlock,
  {
    variables,
    apiHost,
    isPreview,
    onNewLog,
    resultId,
    sniperId,
    resultValues,
  }: IntegrationState
) => {
  if (isPreview) {
    onNewLog({
      status: 'info',
      description: 'Emails are not sent in preview mode',
      details: null,
    })
    return block.outgoingEdgeId
  }
  const { options } = block
  sendRequest({
    url: `${apiHost}/api/snipers/${sniperId}/integrations/email?resultId=${resultId}`,
    method: 'POST',
    body: {
      credentialsId: options?.credentialsId,
      recipients: options?.recipients?.map(parseVariables(variables)),
      subject: parseVariables(variables)(options?.subject ?? ''),
      body: parseVariables(variables)(options?.body ?? ''),
      cc: (options?.cc ?? []).map(parseVariables(variables)),
      bcc: (options?.bcc ?? []).map(parseVariables(variables)),
      replyTo: options?.replyTo
        ? parseVariables(variables)(options.replyTo)
        : undefined,
      fileUrls: variables.find(byId(options?.attachmentsVariableId))?.value,
      isCustomBody: options?.isCustomBody,
      isBodyCode: options?.isBodyCode,
      resultValues,
    },
  }).then(({ error }) => {
    onNewLog(
      parseLog(error, 'Succesfully sent an email', 'Failed to send an email')
    )
  })

  return block.outgoingEdgeId
}
