import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { fetchWhatsappFlowVariables } from './helpers/fetchWhatsappFlowVariables'

const whatsappFlowVariableSchema = z.object({
  name: z.string(),
  type: z.string(),
  example: z.unknown().optional(),
})

export const getWhatsappFlowVariables = authenticatedProcedure
  .input(z.object({ workspaceId: z.string(), flowId: z.string() }))
  .output(z.object({ fields: z.array(whatsappFlowVariableSchema) }))
  .query(async ({ input: { workspaceId, flowId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const fields = await fetchWhatsappFlowVariables(workspaceId, flowId)
    return { fields }
  })
