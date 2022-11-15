import { Result as ResultFromPrisma } from 'db'
import { Answer } from './answer'
import { InputBlockType } from './blocks'
import { VariableWithValue } from './typebot/variable'

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
  blocks?: {
    id: string
    groupId: string
  }[]
  blockType?: InputBlockType
  variableIds?: string[]
}
