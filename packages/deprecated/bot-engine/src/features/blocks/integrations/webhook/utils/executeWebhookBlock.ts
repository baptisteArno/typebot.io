import { parseVariables } from '@/features/variables'
import { IntegrationState } from '@/types'
import {
  HttpRequestBlock,
  ZapierBlock,
  MakeComBlock,
  PabblyConnectBlock,
  VariableWithUnknowValue,
} from '@sniper.io/schemas'
import { stringify } from 'qs'
import { sendRequest, byId } from '@sniper.io/lib'

export const executeWebhook = async (
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock,
  {
    blockId,
    variables,
    updateVariableValue,
    updateVariables,
    sniperId,
    apiHost,
    resultValues,
    onNewLog,
    resultId,
    parentSniperIds,
  }: IntegrationState
) => {
  const params = stringify({ resultId })
  const { data, error } = await sendRequest({
    url: `${apiHost}/api/snipers/${sniperId}/blocks/${blockId}/executeWebhook?${params}`,
    method: 'POST',
    body: {
      variables,
      resultValues,
      parentSniperIds,
    },
  })
  const statusCode = (
    data as Record<string, string> | undefined
  )?.statusCode.toString()
  const isError = statusCode
    ? statusCode?.startsWith('4') || statusCode?.startsWith('5')
    : true
  onNewLog({
    status: error ? 'error' : isError ? 'warning' : 'success',
    description: isError
      ? 'Webhook returned an error'
      : 'Webhook successfuly executed',
    details: JSON.stringify(error ?? data, null, 2).substring(0, 1000),
  })
  const newVariables = block.options?.responseVariableMapping?.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
    const existingVariable = variables.find(byId(varMapping.variableId))
    if (!existingVariable) return newVariables
    const func = Function(
      'data',
      `return data.${parseVariables(variables)(varMapping?.bodyPath)}`
    )
    try {
      const value: unknown = func(data)
      updateVariableValue(existingVariable?.id, value)
      return [...newVariables, { ...existingVariable, value }]
    } catch (err) {
      return newVariables
    }
  }, [])
  if (newVariables) updateVariables(newVariables)
  return block.outgoingEdgeId
}
