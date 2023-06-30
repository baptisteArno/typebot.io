import { executePrismaCommand } from './executeCommand'

executePrismaCommand('prisma db push --skip-generate --accept-data-loss')
