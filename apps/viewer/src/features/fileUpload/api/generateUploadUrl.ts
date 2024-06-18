import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { generatePresignedPostPolicy } from '@sniper.io/lib/s3/generatePresignedPostPolicy'
import { env } from '@sniper.io/env'
import prisma from '@sniper.io/lib/prisma'
import { getSession } from '@sniper.io/bot-engine/queries/getSession'
import { parseGroups } from '@sniper.io/schemas'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { getBlockById } from '@sniper.io/schemas/helpers'

export const generateUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/generate-upload-url',
      summary: 'Generate upload URL',
      description: 'Used to upload anything from the client to S3 bucket',
    },
  })
  .input(
    z.object({
      filePathProps: z
        .object({
          sniperId: z.string(),
          blockId: z.string(),
          resultId: z.string(),
          fileName: z.string(),
        })
        .or(
          z.object({
            sessionId: z.string(),
            fileName: z.string(),
          })
        ),
      fileType: z.string().optional(),
    })
  )
  .output(
    z.object({
      presignedUrl: z.string(),
      formData: z.record(z.string(), z.any()),
      fileUrl: z.string(),
    })
  )
  .mutation(async ({ input: { filePathProps, fileType } }) => {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    // TODO: Remove (deprecated)
    if ('sniperId' in filePathProps) {
      const publicSniper = await prisma.publicSniper.findFirst({
        where: {
          sniperId: filePathProps.sniperId,
        },
        select: {
          version: true,
          groups: true,
          sniper: {
            select: {
              workspaceId: true,
            },
          },
        },
      })

      const workspaceId = publicSniper?.sniper.workspaceId

      if (!workspaceId)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Can't find workspaceId",
        })

      const filePath = `public/workspaces/${workspaceId}/snipers/${filePathProps.sniperId}/results/${filePathProps.resultId}/${filePathProps.fileName}`

      const fileUploadBlock = parseGroups(publicSniper.groups, {
        sniperVersion: publicSniper.version,
      })
        .flatMap((group) => group.blocks)
        .find((block) => block.id === filePathProps.blockId)

      if (fileUploadBlock?.type !== InputBlockType.FILE)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Can't find file upload block",
        })

      const presignedPostPolicy = await generatePresignedPostPolicy({
        fileType,
        filePath,
        maxFileSize:
          fileUploadBlock.options?.sizeLimit ??
          env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
      })

      return {
        presignedUrl: presignedPostPolicy.postURL,
        formData: presignedPostPolicy.formData,
        fileUrl: env.S3_PUBLIC_CUSTOM_DOMAIN
          ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
          : `${presignedPostPolicy.postURL}/${presignedPostPolicy.formData.key}`,
      }
    }

    const session = await getSession(filePathProps.sessionId)

    if (!session)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find session",
      })

    const sniperId = session.state.snipersQueue[0].sniper.id

    const publicSniper = await prisma.publicSniper.findFirst({
      where: {
        sniperId,
      },
      select: {
        version: true,
        groups: true,
        sniper: {
          select: {
            workspaceId: true,
          },
        },
      },
    })

    const workspaceId = publicSniper?.sniper.workspaceId

    if (!workspaceId)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find workspaceId",
      })

    if (session.state.currentBlockId === undefined)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find currentBlockId in session state",
      })

    const { block: fileUploadBlock } = getBlockById(
      session.state.currentBlockId,
      parseGroups(publicSniper.groups, {
        sniperVersion: publicSniper.version,
      })
    )

    if (fileUploadBlock?.type !== InputBlockType.FILE)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find file upload block",
      })

    const resultId = session.state.snipersQueue[0].resultId

    const filePath = `${
      fileUploadBlock.options?.visibility === 'Private' ? 'private' : 'public'
    }/workspaces/${workspaceId}/snipers/${sniperId}/results/${resultId}/${
      filePathProps.fileName
    }`

    const presignedPostPolicy = await generatePresignedPostPolicy({
      fileType,
      filePath,
      maxFileSize:
        fileUploadBlock.options && 'sizeLimit' in fileUploadBlock.options
          ? (fileUploadBlock.options.sizeLimit as number)
          : env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
    })

    return {
      presignedUrl: presignedPostPolicy.postURL,
      formData: presignedPostPolicy.formData,
      fileUrl:
        fileUploadBlock.options?.visibility === 'Private'
          ? `${env.NEXTAUTH_URL}/api/snipers/${sniperId}/results/${resultId}/${filePathProps.fileName}`
          : env.S3_PUBLIC_CUSTOM_DOMAIN
          ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
          : `${presignedPostPolicy.postURL}/${presignedPostPolicy.formData.key}`,
    }
  })
