import { Result as ResultFromPrisma } from 'db'

export type Result = Omit<ResultFromPrisma, 'answers'> & {
  answers: Answer[]
}

export type Answer = {
  blockId: string
  stepId: string
  content: string
}
