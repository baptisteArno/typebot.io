import { NextApiRequest, NextApiResponse } from 'next'
import { checkPermission } from '../autosignin/subauth'
import prisma from '@typebot.io/lib/prisma'

async function GetUser(workspaceId: string) {
  const workspace = await prisma.memberInWorkspace.findFirst({
    where: {
      workspaceId: workspaceId,
    },
  })
  const user = await prisma.user.findFirst({ where: { id: workspace?.userId } })
  return user?.email
}

async function TypeBot(key: string) {
  const Bots = await prisma.typebot.findFirst({
    where: {
      publicId: key,
    },
  })
  return Bots
}

async function GetById(key: string) {
  const Bots = await prisma.typebot.findFirst({
    where: {
      id: key,
    },
  })
  return Bots
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ...query } = req.query
  const publicId: string = query?.publicId ? query.publicId.toString() : ''
  const Id: string = query?.Id ? query.Id.toString() : ''
  try {
    const customkey: string = req.headers.customkey
      ? req.headers.customkey.toString()
      : ''

    if (!customkey || (await checkPermission(customkey)) === false) {
      return res.status(407).json({ botid: null })
    }
  } catch (err) {
    console.log(err)
    return res.status(407).json({ botid: null })
  }

  if (publicId) {
    const bots = await TypeBot(publicId)

    if (bots) {
      const user = await GetUser(bots?.workspaceId)
      res.status(200).json({ bots: bots.id, user: user })
    }
  } else if (Id) {
    const bots = await GetById(Id)

    if (bots) {
      const user = await GetUser(bots?.workspaceId)
      res.status(200).json({ bots: bots.id, user: user })
    }
  }
}

export default handler
