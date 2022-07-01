import { Result as ResultFromPrisma } from 'db'
import { Answer, VariableWithValue } from '.'
import { InputBlockType } from './typebot/blocks/shared'

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
  id: string
  label: string
  blockId?: string
  blockType?: InputBlockType
  isLong?: boolean
  variableId?: string
}
