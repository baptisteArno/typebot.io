import { executePrismaCommand } from './executeCommand'

executePrismaCommand('prisma generate', { force: true })
