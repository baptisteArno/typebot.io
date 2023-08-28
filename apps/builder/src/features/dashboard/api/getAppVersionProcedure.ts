import { publicProcedure } from '@/helpers/server/trpc'
import { env } from '@typebot.io/env'

export const getAppVersionProcedure = publicProcedure.query(async () => {
  return { commitSha: env.VERCEL_GIT_COMMIT_SHA }
})
