import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { fetchWhatsappFlows } from './helpers/fetchWhatsappFlows'

const whatsappFlowSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const listWhatsappFlows = authenticatedProcedure
  .input(z.object({ workspaceId: z.string() }))
  .output(z.object({ flows: z.array(whatsappFlowSchema) }))
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    // Verify the caller is a member of the workspace before exposing its flows.
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const flows = await fetchWhatsappFlows(workspaceId)
    return { flows }
  })
