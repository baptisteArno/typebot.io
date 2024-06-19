import { Step } from 'models'
import { useReducer } from 'react'

export type EmptyFields = {
  errorMessage: string[]
  step: Step
}

export enum ActionsTypeEmptyFields {
  REMOVE = 'remove',
  ADD = 'add',
}

type ActionsType = ActionsTypeEmptyFields
type Action = { type: ActionsTypeEmptyFields; values: any }

function reducer(state: EmptyFields[], action: Action) {
  if (action.type === ActionsTypeEmptyFields.REMOVE) {
    return state.filter(
      (emptyFields) => !action.values.includes(emptyFields.step.id)
    )
  }
  if (action.type === ActionsTypeEmptyFields.ADD) {
    return [...state, ...action.values]
  }
  throw new Error('Unknown action: ' + action.type)
}

const useEmptyFields = () => {
  const initialState: EmptyFields[] = []
  const [state, dispatch] = useReducer(reducer, initialState)

  const set = (values: EmptyFields[] | string[], type: ActionsType) => {
    dispatch({ values, type })
  }

  return { emptyFields: state, setEmptyFields: set }
}

export default useEmptyFields
