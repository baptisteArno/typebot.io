import prisma from '@/lib/prisma'
import { isDefined } from '@typebot.io/lib'
import {
  SessionState,
  VariableWithUnknowValue,
  VariableWithValue,
  Variable,
} from '@typebot.io/schemas'
import { safeStringify } from './safeStringify'

export const updateVariables =
  (state: SessionState) =>
  async (newVariables: VariableWithUnknowValue[]): Promise<SessionState> => ({
    ...state,
    typebot: {
      ...state.typebot,
      variables: updateTypebotVariables(state)(newVariables),
    },
    result: {
      ...state.result,
      variables: await updateResultVariables(state)(newVariables),
    },
  })

const updateResultVariables =
  ({ result }: Pick<SessionState, 'result' | 'typebot'>) =>
  async (
    newVariables: VariableWithUnknowValue[]
  ): Promise<VariableWithValue[]> => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: Array.isArray(variable.value)
        ? variable.value.map(safeStringify)
        : safeStringify(variable.value),
    }))

    const updatedVariables = [
      ...result.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ].filter((variable) => isDefined(variable.value)) as VariableWithValue[]

    if (result.id)
      await prisma.result.update({
        where: {
          id: result.id,
        },
        data: {
          variables: updatedVariables,
        },
      })

    return updatedVariables
  }

const updateTypebotVariables =
  ({ typebot }: Pick<SessionState, 'result' | 'typebot'>) =>
  (newVariables: VariableWithUnknowValue[]): Variable[] => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: Array.isArray(variable.value)
        ? variable.value.map(safeStringify)
        : safeStringify(variable.value),
    }))

    return [
      ...typebot.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ]
  }
