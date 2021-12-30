import { Result as ResultFromPrisma } from 'db'

export type Result = Omit<ResultFromPrisma, 'createdAt'> & { createdAt: string }
