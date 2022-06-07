import { Result as ResultFromPrisma } from 'db'
import { Answer, VariableWithValue } from '.'
import { InputStepType } from './typebot/steps/shared'

export type Result = Omit<ResultFromPrisma, 'createdAt' | 'variables'> & {
  createdAt: string
  variables: VariableWithValue[]
}

export type ResultWithAnswers = Result & { answers: Answer[] }

export type ResultValues = Pick<
  ResultWithAnswers,
  'answers' | 'createdAt' | 'variables'
>

export type ResultHeaderCell = {
  label: string
  stepId?: string
  stepType?: InputStepType
  isLong?: boolean
  variableId?: string
}
