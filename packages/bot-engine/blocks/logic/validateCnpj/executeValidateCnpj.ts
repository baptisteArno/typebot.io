import { ValidateCnpjBlock, SessionState, Variable } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { byId } from '@typebot.io/lib'
import { createId } from '@paralleldrive/cuid2'
import { VALIDATION_RESULT_VARIABLES } from '../validation/constants'
import { validateCnpjNumber } from '../validation/utils'

export const executeValidateCnpj = (
  state: SessionState,
  block: ValidateCnpjBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot

  if (!block.options?.inputVariableId) {
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  const inputVariable = variables.find(byId(block.options.inputVariableId))
  if (!inputVariable || !inputVariable.value) {
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  const cnpjValue = inputVariable.value.toString()

  // Remove formatação se solicitado
  const cleanCnpj = block.options.removeFormatting
    ? cnpjValue.replace(/[^\d]/g, '')
    : cnpjValue

  // Verifica se é um CPF (11 dígitos) no bloco de CNPJ
  if (cleanCnpj.length === 11) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: `⚠️ This appears to be a CPF (11 digits). Use the "Validate CPF" block to validate CPFs.`,
        },
      ],
    }
  }

  // Validação do CNPJ
  const isValid = validateCnpjNumber(cleanCnpj)

  const variablesToUpdate: {
    id: string
    value: boolean | string
  }[] = []

  // Use a fixed variable name for validation result
  let resultVariable = variables.find(
    (v) => v.name === VALIDATION_RESULT_VARIABLES.CNPJ
  )

  // Se não encontrou a variável, criar uma nova
  if (!resultVariable) {
    resultVariable = {
      id: createId(),
      name: VALIDATION_RESULT_VARIABLES.CNPJ,
      value: isValid.toString(),
    } as Variable
  }

  // Atualizar variável de resultado com o resultado da validação
  variablesToUpdate.push({
    id: resultVariable.id,
    value: isValid.toString(),
  })

  // Atualizar variável de saída com CNPJ limpo (se configurada e remoção ativada)
  if (block.options.outputVariableId && block.options.removeFormatting) {
    variablesToUpdate.push({
      id: block.options.outputVariableId,
      value: cleanCnpj,
    })
  }

  let newSessionState = state

  // Se criamos uma nova variável, adicioná-la ao estado primeiro
  if (!variables.find((v) => v.name === VALIDATION_RESULT_VARIABLES.CNPJ)) {
    newSessionState = {
      ...state,
      typebotsQueue: [
        {
          ...state.typebotsQueue[0],
          typebot: {
            ...state.typebotsQueue[0].typebot,
            variables: [...variables, resultVariable!],
          },
        },
        ...state.typebotsQueue.slice(1),
      ],
    }
  }

  if (variablesToUpdate.length > 0) {
    const validVariables = variablesToUpdate
      .map((v) => {
        const variable =
          newSessionState.typebotsQueue[0].typebot.variables.find(byId(v.id))
        if (!variable) return null
        return {
          ...variable,
          value: v.value,
        }
      })
      .filter(
        (variable): variable is NonNullable<typeof variable> =>
          variable !== null
      )

    const updateResults = updateVariablesInSession({
      newVariables: validVariables,
      state: newSessionState,
      currentBlockId: block.id,
    })

    if (updateResults) {
      newSessionState = updateResults.updatedState
    }
  }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState,
  }
}
