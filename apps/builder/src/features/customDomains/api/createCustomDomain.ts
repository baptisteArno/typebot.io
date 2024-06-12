import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { customDomainSchema } from '@typebot.io/schemas/features/customDomains'
import ky, { HTTPError } from 'ky'
import { env } from '@typebot.io/env'
import { isWriteWorkspaceForbidden } from '@/features/workspace/helpers/isWriteWorkspaceForbidden'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'

export const createCustomDomain = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/custom-domains',
      protect: true,
      summary: 'Create custom domain',
      tags: ['Custom domains'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      name: z.string(),
    })
  )
  .output(
    z.object({
      customDomain: customDomainSchema.pick({
        name: true,
        createdAt: true,
      }),
    })
  )
  .mutation(async ({ input: { workspaceId, name }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      select: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    })

    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    const existingCustomDomain = await prisma.customDomain.findFirst({
      where: { name },
    })

    if (existingCustomDomain)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Custom domain already registered',
      })

    try {
      await createDomainOnVercel(name)
    } catch (err) {
      if (err instanceof HTTPError && err.response.status !== 409) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create custom domain on Vercel',
          cause: await err.response.text(),
        })
      }
    }

    const customDomain = await prisma.customDomain.create({
      data: {
        name,
        workspaceId,
      },
    })

    await trackEvents([
      {
        name: 'Custom domain added',
        userId: user.id,
        workspaceId,
        data: {
          domain: name,
        },
      },
    ])

    return { customDomain }
  })

const createDomainOnVercel = (name: string) =>
  ky.post(
    `https://api.vercel.com/v10/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains?teamId=${env.VERCEL_TEAM_ID}`,
    {
      headers: {
        authorization: `Bearer ${env.VERCEL_TOKEN}`,
      },
      json: { name },
    }
  )
