// apps/viewer/pages/api/auth/login.ts (Custom Login for AVC quick redirection)

import { NextApiRequest, NextApiResponse } from 'next'
import { createHash, randomBytes } from 'crypto'
import prisma from '@typebot.io/lib/prisma'
import { env } from '@typebot.io/env'
import { getIp } from '@typebot.io/lib/getIp'
import { Ratelimit } from '@upstash/ratelimit'
import * as Sentry from '@sentry/nextjs'
import Redis from 'ioredis'

let emailSignInRateLimiter: Ratelimit | undefined

if (env.REDIS_URL) {
  const redis = new Redis(env.REDIS_URL)
  const rateLimitCompatibleRedis = {
    sadd: <TData>(key: string, ...members: TData[]) =>
      redis.sadd(key, ...members.map((m) => String(m))),
    eval: async <TArgs extends unknown[], TData = unknown>(
      script: string,
      keys: string[],
      args: TArgs
    ) =>
      redis.eval(
        script,
        keys.length,
        ...keys,
        ...(args ?? []).map((a) => String(a))
      ) as Promise<TData>,
  }
  emailSignInRateLimiter = new Ratelimit({
    redis: rateLimitCompatibleRedis,
    limiter: Ratelimit.slidingWindow(1, '60 s'),
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (emailSignInRateLimiter) {
      const ip = getIp(req)
      if (ip) {
        const { success } = await emailSignInRateLimiter.limit(ip)
        if (!success) {
          return res.status(429).json({
            error: 'Too many requests. Please try again later.',
          })
        }
      }
    }

    await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    })

    const token = randomBytes(32).toString('hex')
    const secret = createHash('sha256')
      .update(`${token}${env.ENCRYPTION_SECRET}`)
      .digest('hex')

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: secret,
        expires,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL
    const redirectURL = `${baseUrl}/api/auth/callback/email?email=${encodeURIComponent(
      email
    )}&token=${encodeURIComponent(token)}`

    return res.status(200).json({
      success: true,
      message: 'Magic URL has been created.',
      auth: {
        redirectURL,
        expires,
      },
    })
  } catch (error) {
    console.error('Error in custom email login:', error)
    Sentry.captureException(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler
