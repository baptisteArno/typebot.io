import { Typebot, Variable } from 'models'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'

export type VariablesActions = {
  createVariable: (variable: Variable) => void
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) => void
  deleteVariable: (variableId: string) => void
}

export const variablesAction = (
  typebot: Typebot,
  setTypebot: SetTypebot
): VariablesActions => ({
  createVariable: (newVariable: Variable) => {
    setTypebot(
      produce(typebot, (typebot) => {
        typebot.variables.byId[newVariable.id] = newVariable
        typebot.variables.allIds.push(newVariable.id)
      })
    )
  },
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) =>
    setTypebot(
      produce(typebot, (typebot) => {
        typebot.variables.byId[variableId] = {
          ...typebot.variables.byId[variableId],
          ...updates,
        }
      })
    ),
  deleteVariable: (itemId: string) => {
    setTypebot(
      produce(typebot, (typebot) => {
        deleteVariableDraft(typebot, itemId)
      })
    )
  },
})

export const deleteVariableDraft = (
  typebot: WritableDraft<Typebot>,
  variableId: string
) => {
  delete typebot.variables.byId[variableId]
  const index = typebot.variables.allIds.indexOf(variableId)
  if (index !== -1) typebot.variables.allIds.splice(index, 1)
}
