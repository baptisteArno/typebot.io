import { Answer as AnswerFromPrisma } from 'db'

export type Answer = Omit<
  AnswerFromPrisma,
  'resultId' | 'createdAt' | 'storageUsed'
> & { storageUsed?: number }

export type Stats = {
  totalViews: number
  totalStarts: number
  totalCompleted: number
}
