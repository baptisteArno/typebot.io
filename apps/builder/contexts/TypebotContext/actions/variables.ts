import { Typebot, Variable } from 'models'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'

export type VariablesActions = {
  createVariable: (variable: Variable) => void
  setVariables: (variables: Array<Variable>) => void
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) => void
  deleteVariable: (variableId: string) => void
}

export const variablesAction = (setTypebot: SetTypebot): VariablesActions => ({
  createVariable: (newVariable: Variable) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        if (!typebot) return
        typebot.variables.push(newVariable)
      })
    ),
  setVariables: (variables: Array<Variable>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        if (!typebot) return
        typebot.variables = variables
      })
    ),
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        if (!typebot) return
        typebot.variables = typebot.variables.map((v) =>
          v.id === variableId ? { ...v, ...updates } : v
        )
      })
    ),
  deleteVariable: (itemId: string) => {
    return setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        if (!typebot) return
        deleteVariableDraft(typebot, itemId)
      })
    )
  },
})

export const deleteVariableDraft = (
  typebot: WritableDraft<Typebot>,
  variableId: string
) => {
  if (!typebot) return
  const index = typebot.variables.findIndex((v) => v.id === variableId)
  typebot.variables.splice(index, 1)
}
