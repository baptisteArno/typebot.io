import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@typebot.io/lib/prisma'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'
import { User } from '@typebot.io/schemas'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'

export const trackAnalyticsPageView = async (
  context: GetServerSidePropsContext
) => {
  const typebotId = context.params?.typebotId as string | undefined
  if (!typebotId) return
  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: { workspaceId: true },
  })
  if (!typebot) return
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions({})
  )
  await trackEvents([
    {
      name: 'Analytics visited',
      typebotId,
      userId: (session?.user as User).id,
      workspaceId: typebot.workspaceId,
    },
  ])
}
