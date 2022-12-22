import { Typebot, Variable } from 'models'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'

const groupPerType = (groups: Array<Variable>, item: Variable) => {
  const group = groups.find(gp => gp.type === item.type) || { ...item, type: "CHAT" };
  const index = groups.findIndex(group => group.type === item.type);
  if(index === -1){
    groups.push(group);
  } else {
    groups[index] = group;
  }
  return groups;
}

export type VariablesActions = {
  createVariable: (variable: Variable) => void;
  createVariableInGroup: (variable: Variable) => void;
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) => void;
  deleteVariable: (variableId: string) => void;
}

export const variablesAction = (setTypebot: SetTypebot): VariablesActions => ({
  createVariable: (newVariable: Variable) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.variables.push(newVariable)
      })
    ),
  createVariableInGroup: (variable: Variable) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.variables.reduce(groupPerType, [])
      })
    )
  },
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, 'id'>>
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.variables = typebot.variables.map((v) =>
          v.id === variableId ? { ...v, ...updates } : v
        )
      })
    ),
  deleteVariable: (itemId: string) => {
    return setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteVariableDraft(typebot, itemId)
      })
    )
  }
})

export const deleteVariableDraft = (
  typebot: WritableDraft<Typebot>,
  variableId: string
) => {
  const index = typebot.variables.findIndex((v) => v.id === variableId)
  typebot.variables.splice(index, 1)
}
