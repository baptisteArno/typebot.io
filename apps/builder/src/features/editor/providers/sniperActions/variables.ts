import { Sniper, Variable } from '@sniper.io/schemas'
import { SetSniper } from '../SniperProvider'
import { Draft, produce } from 'immer'

export type VariablesActions = {
  createVariable: (variable: Variable) => void
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) => void
  deleteVariable: (variableId: string) => void
}

export const variablesAction = (setSniper: SetSniper): VariablesActions => ({
  createVariable: (newVariable: Variable) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        sniper.variables.unshift(newVariable)
      })
    ),
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        sniper.variables = sniper.variables.map((v) =>
          v.id === variableId ? { ...v, ...updates } : v
        )
      })
    ),
  deleteVariable: (itemId: string) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        deleteVariableDraft(sniper, itemId)
      })
    ),
})

export const deleteVariableDraft = (
  sniper: Draft<Sniper>,
  variableId: string
) => {
  const index = sniper.variables.findIndex((v) => v.id === variableId)
  sniper.variables.splice(index, 1)
}
