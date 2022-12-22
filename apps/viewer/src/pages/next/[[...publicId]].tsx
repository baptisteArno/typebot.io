import { IncomingMessage } from 'http'
import { NotFoundPage } from '@/components/NotFoundPage'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { env, getViewerUrl, isNotDefined } from 'utils'
import prisma from '@/lib/prisma'
import { TypebotPageV2, TypebotPageV2Props } from '@/components/TypebotPageV2'
import { ErrorPage } from '@/components/ErrorPage'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { host, forwardedHost } = getHost(context.req)
  const pathname = context.resolvedUrl.split('?')[0]
  try {
    if (!host) return { props: {} }
    const viewerUrls = (getViewerUrl({ returnAll: true }) ?? '').split(',')
    const isMatchingViewerUrl =
      env('E2E_TEST') === 'true'
        ? true
        : viewerUrls.some(
            (url) =>
              host.split(':')[0].includes(url.split('//')[1].split(':')[0]) ||
              (forwardedHost &&
                forwardedHost
                  .split(':')[0]
                  .includes(url.split('//')[1].split(':')[0]))
          )
    const typebot = isMatchingViewerUrl
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : null
    if (!typebot)
      console.log(
        isMatchingViewerUrl
          ? `Couldn't find publicId: ${context.query.publicId?.toString()}`
          : `Couldn't find customDomain`
      )
    return {
      props: {
        typebot,
        url: `https://${forwardedHost ?? host}${pathname}`,
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {},
    url: `https://${forwardedHost ?? host}${pathname}`,
  }
}

const getTypebotFromPublicId = async (
  publicId?: string
): Promise<TypebotPageV2Props['typebot'] | null> => {
  if (!publicId) return null
  const typebot = (await prisma.typebot.findUnique({
    where: { publicId },
    select: {
      id: true,
      theme: true,
      name: true,
      settings: true,
      isArchived: true,
      isClosed: true,
    },
  })) as TypebotPageV2Props['typebot'] | null
  if (isNotDefined(typebot)) return null
  return typebot
}

const getHost = (
  req?: IncomingMessage
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({ typebot, url }: TypebotPageV2Props) => {
  if (!typebot || typebot.isArchived) return <NotFoundPage />
  if (typebot.isClosed)
    return <ErrorPage error={new Error('This bot is now closed')} />
  return <TypebotPageV2 typebot={typebot} url={url} />
}

export default App
