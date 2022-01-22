import { Typebot, Variable } from 'models'
import { Updater } from 'use-immer'
import { WritableDraft } from 'immer/dist/types/types-external'

export type VariablesActions = {
  createVariable: (variable: Variable) => void
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) => void
  deleteVariable: (variableId: string) => void
}

export const variablesAction = (
  setTypebot: Updater<Typebot>
): VariablesActions => ({
  createVariable: (newVariable: Variable) => {
    setTypebot((typebot) => {
      typebot.variables.byId[newVariable.id] = newVariable
      typebot.variables.allIds.push(newVariable.id)
    })
  },
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) =>
    setTypebot((typebot) => {
      typebot.variables.byId[variableId] = {
        ...typebot.variables.byId[variableId],
        ...updates,
      }
    }),
  deleteVariable: (itemId: string) => {
    setTypebot((typebot) => {
      deleteVariableDraft(typebot, itemId)
    })
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
