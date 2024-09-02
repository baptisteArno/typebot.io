import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { isAdminWriteWorkspaceForbidden } from '../helpers/isAdminWriteWorkspaceForbidden'
import { TRPCError } from '@trpc/server'
import { isNotEmpty } from '@typebot.io/lib/utils'
import Stripe from 'stripe'
import { env } from '@typebot.io/env'
import { removeObjectsFromWorkspace } from '@typebot.io/lib/s3/removeObjectsRecursively'

export const deleteWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/workspaces/{workspaceId}',
      protect: true,
      summary: 'Delete workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          '[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)'
        ),
    })
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .mutation(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true },
    })

    if (!workspace || isAdminWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    await prisma.workspace.deleteMany({
      where: { id: workspaceId },
    })

    await removeObjectsFromWorkspace(workspaceId)

    if (isNotEmpty(workspace.stripeId) && env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      })

      const subscriptions = await stripe.subscriptions.list({
        customer: workspace.stripeId,
      })

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.cancel(subscription.id)
      }
    }

    return {
      message: 'Workspace deleted',
    }
  })
