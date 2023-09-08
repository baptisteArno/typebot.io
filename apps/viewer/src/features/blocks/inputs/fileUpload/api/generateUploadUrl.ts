import { publicProcedure } from '@/helpers/server/trpc'
import prisma from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { generatePresignedUrl } from '@typebot.io/lib/s3/generatePresignedUrl'
import { env } from '@typebot.io/env'

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
      filePathProps: z.object({
        typebotId: z.string(),
        blockId: z.string(),
        resultId: z.string(),
        fileName: z.string(),
      }),
      fileType: z.string().optional(),
    })
  )
  .output(
    z.object({
      presignedUrl: z.string(),
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

    const publicTypebot = await prisma.publicTypebot.findFirst({
      where: {
        typebotId: filePathProps.typebotId,
      },
      select: {
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

    const presignedUrl = await generatePresignedUrl({
      fileType,
      filePath,
    })

    return {
      presignedUrl,
      fileUrl: env.S3_PUBLIC_CUSTOM_DOMAIN
        ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
        : presignedUrl.split('?')[0],
    }
  })
