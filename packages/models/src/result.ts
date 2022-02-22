import { Result as ResultFromPrisma } from 'db'
import { Answer, VariableWithValue } from '.'

export type Result = Omit<
  ResultFromPrisma,
  'createdAt' | 'prefilledVariables'
> & { createdAt: string; prefilledVariables: VariableWithValue[] }

export type ResultWithAnswers = Result & { answers: Answer[] }

export type ResultValues = Pick<
  ResultWithAnswers,
  'answers' | 'createdAt' | 'prefilledVariables'
>
