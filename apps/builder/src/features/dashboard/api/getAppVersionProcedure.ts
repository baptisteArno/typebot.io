import { publicProcedure } from '@/helpers/server/trpc'

export const getAppVersionProcedure = publicProcedure.query(async () => {
  return { commitSha: process.env.VERCEL_GIT_COMMIT_SHA }
})
