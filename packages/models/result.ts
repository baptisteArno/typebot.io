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
  blocks?: {
    id: string
    groupId: string
  }[]
  blockType?: InputBlockType
  variableIds?: string[]
}
