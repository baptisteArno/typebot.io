import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { generatePresignedPostPolicy } from '@typebot.io/lib/s3/generatePresignedPostPolicy'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import { parseGroups } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { getBlockById } from '@typebot.io/schemas/helpers'

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

    if ('typebotId' in filePathProps) {
      const publicTypebot = await prisma.publicTypebot.findFirst({
        where: {
          typebotId: filePathProps.typebotId,
        },
        select: {
          version: true,
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

      const fileUploadBlock = parseGroups(publicTypebot.groups, {
        typebotVersion: publicTypebot.version,
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

    const typebotId = session.state.typebotsQueue[0].typebot.id

    const publicTypebot = await prisma.publicTypebot.findFirst({
      where: {
        typebotId,
      },
      select: {
        version: true,
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

    if (session.state.currentBlockId === undefined)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find currentBlockId in session state",
      })

    const { block: fileUploadBlock } = getBlockById(
      session.state.currentBlockId,
      parseGroups(publicTypebot.groups, {
        typebotVersion: publicTypebot.version,
      })
    )

    if (fileUploadBlock?.type !== InputBlockType.FILE)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find file upload block",
      })

    const resultId = session.state.typebotsQueue[0].resultId

    const filePath = `${
      fileUploadBlock.options?.visibility === 'Private' ? 'private' : 'public'
    }/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${
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
          ? `${env.NEXTAUTH_URL}/api/typebots/${typebotId}/results/${resultId}/${filePathProps.fileName}`
          : env.S3_PUBLIC_CUSTOM_DOMAIN
          ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
          : `${presignedPostPolicy.postURL}/${presignedPostPolicy.formData.key}`,
    }
  })
