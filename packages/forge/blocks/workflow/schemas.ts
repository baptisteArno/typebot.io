import { parseBlockCredentials, parseBlockSchema } from '@typebot.io/forge'
import { workflowBlock } from '.'

export const workflowBlockSchema = parseBlockSchema(workflowBlock)
export const workflowCredentialsSchema = parseBlockCredentials(workflowBlock)
