import { IncomingMessage } from 'http'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { env, getViewerUrl, isNotDefined } from 'utils'
import prisma from '@/lib/prisma'
import { TypebotPage, TypebotPageProps } from '@/components/TypebotPageV2'

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
): Promise<TypebotPageProps['typebot'] | null> => {
  const typebot = (await prisma.typebot.findUnique({
    where: { publicId: publicId ?? '' },
    select: {
      theme: true,
      name: true,
      settings: true,
      publicId: true,
    },
  })) as TypebotPageProps['typebot'] | null
  if (isNotDefined(typebot)) return null
  return typebot
}

const getHost = (
  req?: IncomingMessage
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({ typebot, url }: TypebotPageProps) => (
  <TypebotPage typebot={typebot} url={url} />
)

export default App
