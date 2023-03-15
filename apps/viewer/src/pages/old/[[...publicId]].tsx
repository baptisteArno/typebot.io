import { IncomingMessage } from 'http'
import { ErrorPage } from '@/components/ErrorPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { isDefined, isNotDefined, omit } from '@typebot.io/lib'
import prisma from '../../lib/prisma'
import { TypebotPageProps, TypebotPageV2 } from '@/components/TypebotPageV2'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const pathname = context.resolvedUrl.split('?')[0]
  const { host, forwardedHost } = getHost(context.req)
  try {
    if (!host) return { props: {} }
    const publishedTypebot = await getTypebotFromPublicId(
      context.query.publicId?.toString()
    )
    const headCode = publishedTypebot?.settings.metadata.customHeadCode
    return {
      props: {
        publishedTypebot,
        url: `https://${forwardedHost ?? host}${pathname}`,
        customHeadCode:
          isDefined(headCode) && headCode !== '' ? headCode : null,
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      url: `https://${forwardedHost ?? host}${pathname}`,
    },
  }
}

const getTypebotFromPublicId = async (
  publicId?: string
): Promise<TypebotPageProps['publishedTypebot'] | null> => {
  const publishedTypebot = await prisma.publicTypebot.findFirst({
    where: { typebot: { publicId: publicId ?? '' } },
    include: {
      typebot: { select: { name: true, isClosed: true, isArchived: true } },
    },
  })
  if (isNotDefined(publishedTypebot)) return null
  return omit(
    publishedTypebot,
    'createdAt',
    'updatedAt'
  ) as TypebotPageProps['publishedTypebot']
}

const getHost = (
  req?: IncomingMessage
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({ publishedTypebot, ...props }: TypebotPageProps) => {
  if (!publishedTypebot || publishedTypebot.typebot.isArchived)
    return <NotFoundPage />
  if (publishedTypebot.typebot.isClosed)
    return <ErrorPage error={new Error('This bot is now closed')} />
  return <TypebotPageV2 publishedTypebot={publishedTypebot} {...props} />
}

export default App
