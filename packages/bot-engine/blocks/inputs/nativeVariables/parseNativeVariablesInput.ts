import { NativeVariablesBlock, SessionState } from '@typebot.io/schemas'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { createId } from '@typebot.io/lib/createId'
import { getPrefilledInputValue } from '../../../getPrefilledValue'

export const parseNativeVariablesInput =
  (state: SessionState) => (block: NativeVariablesBlock) => {
    let updatedState = state
    const variables = updatedState.typebotsQueue[0].typebot.variables

    if (!block.options?.nativeType || !block.options?.variableId) {
      return deepParseVariables(variables, { removeEmptyStrings: true })({
        ...block,
        prefilledValue: getPrefilledInputValue(variables)(block),
      })
    }

    // Coletar o valor nativo automaticamente
    const nativeValue = getNativeValue(updatedState, block.options.nativeType)

    // Criar uma nova lista de variáveis com o valor nativo atualizado (sem alterar o estado)
    const updatedVariables = block.options?.variableId
      ? variables.map((v) =>
          v.id === block.options?.variableId ? { ...v, value: nativeValue } : v
        )
      : variables

    return deepParseVariables(updatedVariables, {
      removeEmptyStrings: true,
    })({
      ...block,
      prefilledValue: nativeValue,
    })
  }

// Função para obter valor nativo da sessão
const getNativeValue = (state: SessionState, nativeType: string): string => {
  switch (nativeType) {
    case 'helpdeskId':
      // Verifica se há contacto WhatsApp válido, senão retorna ID único para usuário web
      if (state.whatsApp?.contact?.phoneNumber) {
        return state.whatsApp.contact.phoneNumber
      }
      return 'web-user-' + createId()

    case 'cloudChatId':
      // Prioriza nome do contacto WhatsApp, depois block ID atual, senão anônimo
      if (state.whatsApp?.contact?.name) {
        return state.whatsApp.contact.name
      }
      if (state.currentBlockId) {
        return state.currentBlockId
      }
      return 'anonymous'

    case 'activeIntent':
      // Busca intent ativo baseado na última resposta válida
      const lastAnswer = state.typebotsQueue[0]?.answers?.slice(-1)[0]
      return lastAnswer?.key || 'no-intent'

    case 'channelType':
      // Determina canal baseado na presença de dados WhatsApp
      return state.whatsApp ? 'whatsapp' : 'web'

    case 'createdAt':
      // Retorna timestamp ISO atual
      return new Date().toISOString()

    case 'lastUserMessages':
      // Busca últimas 3 mensagens válidas ou array vazio
      const lastAnswers = state.typebotsQueue[0]?.answers?.slice(-3) || []
      const validLastAnswers = lastAnswers.filter((answer) => answer?.value)
      return JSON.stringify(validLastAnswers.map((a) => a.value))

    case 'messages':
      // Busca todas as mensagens válidas da sessão
      const allAnswers = state.typebotsQueue[0]?.answers || []
      const validAnswers = allAnswers.filter((answer) => answer?.value)
      return JSON.stringify(validAnswers.map((a) => a.value))

    default:
      return 'unknown'
  }
}
