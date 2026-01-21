import { ValidateCpfBlock, SessionState, Variable } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { byId } from '@typebot.io/lib'
import { createId } from '@paralleldrive/cuid2'
import { VALIDATION_RESULT_VARIABLES } from '../validation/constants'
import { validateCpfNumber } from '../validation/utils'

export const executeValidateCpf = (
  state: SessionState,
  block: ValidateCpfBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot

  if (!block.options?.inputVariableId) {
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  const inputVariable = variables.find(byId(block.options.inputVariableId))
  if (!inputVariable || !inputVariable.value) {
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  const cpfValue = inputVariable.value.toString()

  // Remove formatação se solicitado
  const cleanCpf = block.options.removeFormatting
    ? cpfValue.replace(/[^\d]/g, '')
    : cpfValue

  // Verifica se é um CNPJ (14 dígitos) no bloco de CPF
  if (cleanCpf.length === 14) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: `⚠️ This appears to be a CNPJ (14 digits). Use the "Validate CNPJ" block to validate CNPJs.`,
        },
      ],
    }
  }

  // Validação do CPF
  const isValid = validateCpfNumber(cleanCpf)

  const variablesToUpdate: { id: string; value: boolean | string }[] = []

  // Use a fixed variable name for validation result
  let resultVariable = variables.find(
    (v) => v.name === VALIDATION_RESULT_VARIABLES.CPF
  )

  // Se não encontrou a variável, criar uma nova
  if (!resultVariable) {
    resultVariable = {
      id: createId(),
      name: VALIDATION_RESULT_VARIABLES.CPF,
      value: isValid.toString(),
    } as Variable
  }

  // Atualizar variável de resultado com o resultado da validação
  variablesToUpdate.push({
    id: resultVariable.id,
    value: isValid.toString(),
  })

  // Atualizar variável de saída com CPF limpo (se configurada e remoção ativada)
  if (block.options.outputVariableId && block.options.removeFormatting) {
    variablesToUpdate.push({
      id: block.options.outputVariableId,
      value: cleanCpf,
    })
  }

  let newSessionState = state

  // Se criamos uma nova variável, adicioná-la ao estado primeiro
  if (!variables.find((v) => v.name === VALIDATION_RESULT_VARIABLES.CPF)) {
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
