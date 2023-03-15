import { executePrismaCommand } from './executeCommand'

if (process.env.DATABASE_URL?.startsWith('postgresql://'))
  executePrismaCommand('prisma migrate dev --create-only')
