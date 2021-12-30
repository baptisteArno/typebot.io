import { Answer as AnswerFromPrisma } from 'db'

export type Answer = Omit<AnswerFromPrisma, 'resultId'>
