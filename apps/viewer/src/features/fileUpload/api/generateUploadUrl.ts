import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { generatePresignedPostPolicy } from '@typebot.io/lib/s3/generatePresignedPostPolicy'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import {
  FileInputBlock,
  parseGroups,
  TextInputBlock,
} from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { getBlockById } from '@typebot.io/schemas/helpers'
import { PublicTypebot } from '@typebot.io/prisma'

export const generateUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v2/generate-upload-url',
      summary: 'Generate upload URL',
      description: 'Used to upload anything from the client to S3 bucket',
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
      fileName: z.string(),
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
  .mutation(async ({ input: { fileName, sessionId, fileType } }) => {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    const session = await getSession(sessionId)

    if (!session)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find session",
      })

    const typebotId = session.state.typebotsQueue[0].typebot.id

    const isPreview = session.state.typebotsQueue[0].resultId

    const typebot = session.state.typebotsQueue[0].resultId
      ? await getAndParsePublicTypebot(
          session.state.typebotsQueue[0].typebot.id
        )
      : session.state.typebotsQueue[0].typebot

    if (!typebot?.version)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find typebot",
      })

    if (session.state.currentBlockId === undefined)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find currentBlockId in session state",
      })

    const { block } = getBlockById(
      session.state.currentBlockId,
      parseGroups(typebot.groups, {
        typebotVersion: typebot.version,
      })
    )

    if (
      block?.type !== InputBlockType.FILE &&
      (block.type !== InputBlockType.TEXT ||
        !block.options?.attachments?.isEnabled) &&
      (block.type !== InputBlockType.TEXT ||
        !block.options?.audioClip?.isEnabled)
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Current block does not expect file upload',
      })

    const { visibility, maxFileSize } = parseFileUploadParams(block)

    const resultId = session.state.typebotsQueue[0].resultId

    const filePath =
      'workspaceId' in typebot && typebot.workspaceId
        ? `${visibility === 'Private' ? 'private' : 'public'}/workspaces/${
            typebot.workspaceId
          }/typebots/${typebotId}/results/${resultId}/${fileName}`
        : `public/tmp/${typebotId}/${fileName}`

    const presignedPostPolicy = await generatePresignedPostPolicy({
      fileType,
      filePath,
      maxFileSize,
    })

    return {
      presignedUrl: presignedPostPolicy.postURL,
      formData: presignedPostPolicy.formData,
      fileUrl:
        visibility === 'Private' && !isPreview
          ? `${env.NEXTAUTH_URL}/api/typebots/${typebotId}/results/${resultId}/${fileName}`
          : env.S3_PUBLIC_CUSTOM_DOMAIN
          ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
          : `${presignedPostPolicy.postURL}/${presignedPostPolicy.formData.key}`,
    }
  })

const getAndParsePublicTypebot = async (typebotId: string) => {
  const publicTypebot = (await prisma.publicTypebot.findFirst({
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
  })) as (PublicTypebot & { typebot: { workspaceId: string } }) | null

  return {
    ...publicTypebot,
    workspaceId: publicTypebot?.typebot.workspaceId,
  }
}

const parseFileUploadParams = (
  block: FileInputBlock | TextInputBlock
): { visibility: 'Public' | 'Private'; maxFileSize: number | undefined } => {
  if (block.type === InputBlockType.FILE) {
    return {
      visibility:
        block.options?.visibility === 'Private' ? 'Private' : 'Public',
      maxFileSize:
        block.options && 'sizeLimit' in block.options
          ? (block.options.sizeLimit as number)
          : env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
    }
  }

  return {
    visibility:
      block.options?.attachments?.visibility === 'Private'
        ? 'Private'
        : 'Public',
    maxFileSize: env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
  }
}
