import { executePrismaCommand } from './executeCommand'

if (process.env.DATABASE_URL?.startsWith('mysql'))
  executePrismaCommand('prisma migrate deploy')
