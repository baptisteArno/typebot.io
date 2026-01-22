import { NativeVariablesBlock, SessionState } from '@typebot.io/schemas'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'

export const parseNativeVariablesInput =
  (state: SessionState) => (block: NativeVariablesBlock) => {
    const variables = state.typebotsQueue[0].typebot.variables

    // Se não houver nativeType ou variableId, retorna o bloco sem modificações
    if (!block.options?.nativeType || !block.options?.variableId) {
      return deepParseVariables(variables, { removeEmptyStrings: true })({
        ...block,
        prefilledValue: undefined,
      })
    }

    // Busca a variável nativa escolhida pelo tipo
    const targetVariable = variables.find(
      (v) => v.id === block.options?.variableId
    )

    // Verifica se a variável está setada (is set)
    const isSet =
      targetVariable?.value != null &&
      targetVariable?.value !== '' &&
      targetVariable?.value !== undefined

    // Se estiver setada, usa um collect com o mesmo nome da variável e passa o valor
    if (isSet && targetVariable) {
      return deepParseVariables(variables, { removeEmptyStrings: true })({
        ...block,
        prefilledValue: targetVariable.value as string,
      })
    }

    // Se não estiver setada, não faz nada
    return deepParseVariables(variables, { removeEmptyStrings: true })({
      ...block,
      prefilledValue: undefined,
    })
  }
