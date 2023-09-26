import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { generatePresignedPostPolicy } from '@typebot.io/lib/s3/generatePresignedPostPolicy'
import { env } from '@typebot.io/env'
import { InputBlockType, publicTypebotSchema } from '@typebot.io/schemas'
import prisma from '@typebot.io/lib/prisma'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'

export const generateUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/generate-upload-url',
      summary: 'Generate upload URL',
      description: 'Used to upload anything from the client to S3 bucket',
    },
  })
  .input(
    z.object({
      filePathProps: z
        .object({
          typebotId: z.string(),
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
    if ('typebotId' in filePathProps) {
      const publicTypebot = await prisma.publicTypebot.findFirst({
        where: {
          typebotId: filePathProps.typebotId,
        },
        select: {
          groups: true,
          typebot: {
            select: {
              workspaceId: true,
            },
          },
        },
      })

      const workspaceId = publicTypebot?.typebot.workspaceId

      if (!workspaceId)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Can't find workspaceId",
        })

      const filePath = `public/workspaces/${workspaceId}/typebots/${filePathProps.typebotId}/results/${filePathProps.resultId}/${filePathProps.fileName}`

      const fileUploadBlock = publicTypebotSchema._def.schema.shape.groups
        .parse(publicTypebot.groups)
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
          fileUploadBlock.options.sizeLimit ??
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

    const typebotId = session.state.typebotsQueue[0].typebot.id

    const publicTypebot = await prisma.publicTypebot.findFirst({
      where: {
        typebotId,
      },
      select: {
        groups: true,
        typebot: {
          select: {
            workspaceId: true,
          },
        },
      },
    })

    const workspaceId = publicTypebot?.typebot.workspaceId

    if (!workspaceId)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find workspaceId",
      })

    const resultId = session.state.typebotsQueue[0].resultId

    const filePath = `public/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${filePathProps.fileName}`

    const fileUploadBlock = publicTypebotSchema._def.schema.shape.groups
      .parse(publicTypebot.groups)
      .flatMap((group) => group.blocks)
      .find((block) => block.id === session.state.currentBlock?.blockId)

    if (fileUploadBlock?.type !== InputBlockType.FILE)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find file upload block",
      })

    const presignedPostPolicy = await generatePresignedPostPolicy({
      fileType,
      filePath,
      maxFileSize:
        fileUploadBlock.options.sizeLimit ??
        env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
    })

    return {
      presignedUrl: presignedPostPolicy.postURL,
      formData: presignedPostPolicy.formData,
      fileUrl: env.S3_PUBLIC_CUSTOM_DOMAIN
        ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
        : `${presignedPostPolicy.postURL}/${presignedPostPolicy.formData.key}`,
    }
  })
