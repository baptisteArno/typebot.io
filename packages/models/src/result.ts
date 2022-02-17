import { Result as ResultFromPrisma } from 'db'
import { VariableWithValue } from '.'

export type Result = Omit<
  ResultFromPrisma,
  'createdAt' | 'prefilledVariables'
> & { createdAt: string; prefilledVariables: VariableWithValue[] }
