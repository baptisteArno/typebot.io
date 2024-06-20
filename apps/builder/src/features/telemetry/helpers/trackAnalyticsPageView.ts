import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@sniper.io/lib/prisma'
import { trackEvents } from '@sniper.io/telemetry/trackEvents'
import { User } from '@sniper.io/schemas'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'

export const trackAnalyticsPageView = async (
  context: GetServerSidePropsContext
) => {
  const sniperId = context.params?.sniperId as string | undefined
  if (!sniperId) return
  const sniper = await prisma.sniper.findUnique({
    where: { id: sniperId },
    select: { workspaceId: true },
  })
  if (!sniper) return
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions({})
  )
  await trackEvents([
    {
      name: 'Analytics visited',
      sniperId,
      userId: (session?.user as User).id,
      workspaceId: sniper.workspaceId,
    },
  ])
}
