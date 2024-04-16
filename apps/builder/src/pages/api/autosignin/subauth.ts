import prisma from '@typebot.io/lib/prisma'
import type { AuthOptions } from 'next-auth/'
import { randomBytes } from 'crypto'
import { createHash } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

async function getApiKey(key: string) {
  try {
    const apiKey = await prisma.apiToken.findFirst({
      where: {
        ownerId: key,
      },
    })
    return apiKey
  } catch (err) {
    return null
  }
}

export async function checkPermission(key: string) {
  try {
    const authorized = await prisma.embed.findFirst({
      where: {
        hash: key,
      },
    })
    if (authorized == null) {
      return false
    }
  } catch (err) {
    return false
  }
  return true
}

async function getBot(key: string) {
  const botsResult = await prisma.typebot.findMany({
    where: {
      workspaceId: key,
      isArchived: false,
    },
  })
  return botsResult
}

async function getWorkspaceId(key: string) {
  try {
    const workspaceIdResult = await prisma.memberInWorkspace.findMany({
      where: {
        userId: key,
      },
    })

    const botsList = []
    if (workspaceIdResult !== null) {
      for (const item of workspaceIdResult) {
        const workspaceId = item.workspaceId
        botsList.push(await getBot(workspaceId))
      }
      return botsList
    }
    return null
  } catch (err) {
    return null
  }
}

async function NextAuthApiAutomaticHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  options: AuthOptions
) {
  try {
    const customkey = req.headers.customkey?.toString()
    if (!customkey || (await checkPermission(customkey)) === false) {
      return res.status(407).json({ url: null })
    }
  } catch (err) {
    return res.status(407).json({ url: null })
  }
  const { ...query } = req.query
  const email: string = query?.email ? query.email.toString() : ''
  const callbackUrl: string = query?.callbackUrl
    ? query.callbackUrl.toString()
    : ''
  const originalUrl: string = query?.url ? query.url.toString() : ''
  const identifier = email
  const adapter = options.adapter
  //const emailprovider = options.providers.find(each => each.id === 'email')
  //const emailcallbacks = options.callbacks
  const secret = options.secret
  const user = await options.adapter?.getUserByEmail(email)
  //eslint-disable-next-line
  const botsList = user ? await getWorkspaceId(user?.id) : null
  const token = randomBytes(32).toString('hex')

  //eslint-disable-next-line
  const apikey = user ? await getApiKey(user?.id) : null
  const ONE_DAY_IN_SECONDS = 86400
  const expires = new Date(Date.now() + (3600 ?? ONE_DAY_IN_SECONDS) * 1000)

  const params = new URLSearchParams({ callbackUrl, token, email: email })
  const _url = `${originalUrl}/api/auth/callback/email?${params}`
  if (adapter && secret && identifier) {
    await adapter?.createVerificationToken?.({
      identifier,
      token: hashToken(token, secret),
      expires,
    })
  }

  const retval = res.json({
    url: _url,
    botlist: botsList,
    user: user,
    apikey: apikey?.token,
  })
  return retval
}

export default NextAuthApiAutomaticHandler

export function hashToken(token: string, secret: string) {
  return createHash('sha256').update(`${token}${secret}`).digest('hex')
}
