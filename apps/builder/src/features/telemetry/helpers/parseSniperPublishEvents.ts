import { env } from '@sniper.io/env'
import prisma from '@sniper.io/lib/prisma'
import { parseGroups, Sniper } from '@sniper.io/schemas'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'

type Props = {
  existingSniper: Pick<Sniper, 'id' | 'workspaceId'>
  userId: string
  hasFileUploadBlocks: boolean
}

export const parseSniperPublishEvents = async ({
  existingSniper,
  userId,
  hasFileUploadBlocks,
}: Props) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return []
  const events = []
  const existingPublishedSniper = await prisma.publicSniper.findFirst({
    where: {
      sniperId: existingSniper.id,
    },
    select: {
      version: true,
      groups: true,
      settings: true,
    },
  })

  const isPublishingFileUploadBlockForTheFirstTime =
    hasFileUploadBlocks &&
    (!existingPublishedSniper ||
      !parseGroups(existingPublishedSniper.groups, {
        sniperVersion: existingPublishedSniper.version,
      }).some((group) =>
        group.blocks.some((block) => block.type === InputBlockType.FILE)
      ))

  if (isPublishingFileUploadBlockForTheFirstTime)
    events.push({
      name: 'File upload block published',
      workspaceId: existingSniper.workspaceId,
      sniperId: existingSniper.id,
      userId,
    } as const)

  return events
}
