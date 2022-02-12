import { Answer as AnswerFromPrisma } from 'db'

export type Answer = Omit<AnswerFromPrisma, 'resultId' | 'createdAt'>

export type Stats = {
  totalViews: number
  totalStarts: number
  totalCompleted: number
}
