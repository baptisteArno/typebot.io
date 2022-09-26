import { setUser } from '@sentry/nextjs'
import { User, Prisma } from 'db'
import prisma from 'libs/prisma'
import { InputBlockType, Typebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { forbidden } from 'utils/api'
import { canWriteTypebot } from './dbRules'
import { deleteFiles } from './storage'

export const mockedUser: User = {
  id: 'userId',
  name: 'John Doe',
  email: 'user@email.com',
  company: null,
  createdAt: new Date(),
  emailVerified: null,
  graphNavigation: 'TRACKPAD',
  image: 'https://avatars.githubusercontent.com/u/16015833?v=4',
  lastActivityAt: new Date(),
  onboardingCategories: [],
  updatedAt: new Date(),
}

export const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  const session = await getSession({ req })
  if (!session?.user || !('id' in session.user)) return
  const user = session.user as User
  setUser({ id: user.id, email: user.email ?? undefined })
  return session?.user as User
}

export const archiveResults =
  (res: NextApiResponse) =>
  async ({
    typebotId,
    user,
    resultsFilter,
  }: {
    typebotId: string
    user: User
    resultsFilter?: Prisma.ResultWhereInput
  }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebot(typebotId, user),
      select: { groups: true },
    })
    if (!typebot) return forbidden(res)
    const fileUploadBlockIds = (typebot as Typebot).groups
      .flatMap((g) => g.blocks)
      .filter((b) => b.type === InputBlockType.FILE)
      .map((b) => b.id)
    if (fileUploadBlockIds.length > 0) {
      const filesToDelete = await prisma.answer.findMany({
        where: { result: resultsFilter, blockId: { in: fileUploadBlockIds } },
      })
      if (filesToDelete.length > 0)
        await deleteFiles({
          urls: filesToDelete.flatMap((a) => a.content.split(', ')),
        })
    }
    await prisma.log.deleteMany({
      where: {
        result: resultsFilter,
      },
    })
    await prisma.answer.deleteMany({
      where: {
        result: resultsFilter,
      },
    })
    await prisma.result.updateMany({
      where: resultsFilter,
      data: {
        isArchived: true,
        variables: [],
      },
    })
  }
