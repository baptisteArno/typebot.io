import { Result as ResultFromPrisma } from 'db'
import { Answer, InputStepType, VariableWithValue } from '.'

export type Result = Omit<
  ResultFromPrisma,
  'createdAt' | 'prefilledVariables'
> & { createdAt: string; prefilledVariables: VariableWithValue[] }

export type ResultWithAnswers = Result & { answers: Answer[] }

export type ResultValues = Pick<
  ResultWithAnswers,
  'answers' | 'createdAt' | 'prefilledVariables'
>

export type ResultHeaderCell = {
  label: string
  stepId?: string
  stepType?: InputStepType
  isLong?: boolean
  variableId?: string
}
