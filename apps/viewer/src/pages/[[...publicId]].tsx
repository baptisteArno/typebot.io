import { IncomingMessage } from 'http'
import { ErrorPage } from '@/components/ErrorPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import {
  env,
  getViewerUrl,
  isDefined,
  isNotDefined,
  omit,
} from '@typebot.io/lib'
import prisma from '../lib/prisma'
import { TypebotPageProps, TypebotPageV2 } from '@/components/TypebotPageV2'
import { TypebotPageV3 } from '@/components/TypebotPageV3'

// Browsers that doesn't support ES modules and/or web components
const incompatibleBrowsers = [
  {
    name: 'UC Browser',
    regex: /ucbrowser/i,
  },
  {
    name: 'Internet Explorer',
    regex: /msie|trident/i,
  },
  {
    name: 'Opera Mini',
    regex: /opera mini/i,
  },
]

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const incompatibleBrowser =
    incompatibleBrowsers.find((browser) =>
      browser.regex.test(context.req.headers['user-agent'] ?? '')
    )?.name ?? null
  const pathname = context.resolvedUrl.split('?')[0]
  const { host, forwardedHost } = getHost(context.req)
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
    const customDomain = `${forwardedHost ?? host}${
      pathname === '/' ? '' : pathname
    }`
    const publishedTypebot = isMatchingViewerUrl
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : await getTypebotFromCustomDomain(customDomain)
    const headCode = publishedTypebot?.settings.metadata.customHeadCode
    return {
      props: {
        publishedTypebot,
        incompatibleBrowser,
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
      incompatibleBrowser,
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

const getTypebotFromCustomDomain = async (
  customDomain: string
): Promise<TypebotPageProps['publishedTypebot'] | null> => {
  const publishedTypebot = await prisma.publicTypebot.findFirst({
    where: { typebot: { customDomain } },
    include: {
      typebot: {
        select: {
          name: true,
          isClosed: true,
          isArchived: true,
          publicId: true,
        },
      },
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

const App = ({
  publishedTypebot,
  incompatibleBrowser,
  ...props
}: TypebotPageProps & { incompatibleBrowser: string | null }) => {
  if (incompatibleBrowser)
    return (
      <ErrorPage
        error={
          new Error(
            `Your web browser: ${incompatibleBrowser}, is not supported.`
          )
        }
      />
    )
  if (!publishedTypebot || publishedTypebot.typebot.isArchived)
    return <NotFoundPage />
  if (publishedTypebot.typebot.isClosed)
    return <ErrorPage error={new Error('This bot is now closed')} />
  return publishedTypebot.version === '3' ? (
    <TypebotPageV3
      url={props.url}
      typebot={{
        name: publishedTypebot.typebot.name,
        publicId: publishedTypebot.typebot.publicId,
        settings: publishedTypebot.settings,
        theme: publishedTypebot.theme,
      }}
    />
  ) : (
    <TypebotPageV2 publishedTypebot={publishedTypebot} {...props} />
  )
}

export default App
