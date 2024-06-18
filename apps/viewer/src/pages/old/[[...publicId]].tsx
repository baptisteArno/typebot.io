import { IncomingMessage } from 'http'
import { ErrorPage } from '@/components/ErrorPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { isDefined, isNotDefined, omit } from '@sniper.io/lib'
import { SniperPageProps, SniperPageV2 } from '@/components/SniperPageV2'
import prisma from '@sniper.io/lib/prisma'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const pathname = context.resolvedUrl.split('?')[0]
  const { host, forwardedHost } = getHost(context.req)
  try {
    if (!host) return { props: {} }
    const publishedSniper = await getSniperFromPublicId(
      context.query.publicId?.toString()
    )
    const headCode = publishedSniper?.settings.metadata?.customHeadCode
    return {
      props: {
        publishedSniper,
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

const getSniperFromPublicId = async (
  publicId?: string
): Promise<SniperPageProps['publishedSniper'] | null> => {
  const publishedSniper = await prisma.publicSniper.findFirst({
    where: { sniper: { publicId: publicId ?? '' } },
    include: {
      sniper: { select: { name: true, isClosed: true, isArchived: true } },
    },
  })
  if (isNotDefined(publishedSniper)) return null
  return omit(
    publishedSniper,
    'createdAt',
    'updatedAt'
  ) as SniperPageProps['publishedSniper']
}

const getHost = (
  req?: IncomingMessage
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({ publishedSniper, ...props }: SniperPageProps) => {
  if (!publishedSniper || publishedSniper.sniper.isArchived)
    return <NotFoundPage />
  if (publishedSniper.sniper.isClosed)
    return <ErrorPage error={new Error('This bot is now closed')} />
  return <SniperPageV2 publishedSniper={publishedSniper} {...props} />
}

export default App
