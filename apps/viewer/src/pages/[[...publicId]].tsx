import { IncomingMessage } from 'http'
import { ErrorPage } from '@/components/ErrorPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { isNotDefined } from '@sniper.io/lib'
import { SniperPageProps, SniperPageV2 } from '@/components/SniperPageV2'
import { SniperPageV3, SniperV3PageProps } from '@/components/SniperPageV3'
import { env } from '@sniper.io/env'
import prisma from '@sniper.io/lib/prisma'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'
import {
  defaultBackgroundColor,
  defaultBackgroundType,
} from '@sniper.io/schemas/features/sniper/theme/constants'

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

const log = (message: string) => {
  if (!env.DEBUG) return
  console.log(`[DEBUG] ${message}`)
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const incompatibleBrowser =
    incompatibleBrowsers.find((browser) =>
      browser.regex.test(context.req.headers['user-agent'] ?? '')
    )?.name ?? null
  const pathname = context.resolvedUrl.split('?')[0]
  const { host, forwardedHost } = getHost(context.req)
  log(`host: ${host}`)
  log(`forwardedHost: ${forwardedHost}`)
  try {
    if (!host) return { props: {} }
    const viewerUrls = env.NEXT_PUBLIC_VIEWER_URL
    log(`viewerUrls: ${viewerUrls}`)
    const isMatchingViewerUrl = env.NEXT_PUBLIC_E2E_TEST
      ? true
      : viewerUrls.some(
          (url) =>
            host.split(':')[0].includes(url.split('//')[1].split(':')[0]) ||
            (forwardedHost &&
              forwardedHost
                .split(':')[0]
                .includes(url.split('//')[1].split(':')[0]))
        )
    log(`isMatchingViewerUrl: ${isMatchingViewerUrl}`)
    const customDomain = `${forwardedHost ?? host}${
      pathname === '/' ? '' : pathname
    }`
    const publishedSniper = isMatchingViewerUrl
      ? await getSniperFromPublicId(context.query.publicId?.toString())
      : await getSniperFromCustomDomain(customDomain)

    return {
      props: {
        publishedSniper,
        incompatibleBrowser,
        url: `https://${forwardedHost ?? host}${pathname}`,
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

const getSniperFromPublicId = async (publicId?: string) => {
  const publishedSniper = (await prisma.publicSniper.findFirst({
    where: { sniper: { publicId: publicId ?? '' } },
    select: {
      variables: true,
      settings: true,
      theme: true,
      version: true,
      groups: true,
      edges: true,
      sniperId: true,
      id: true,
      sniper: {
        select: {
          name: true,
          isClosed: true,
          isArchived: true,
          publicId: true,
        },
      },
    },
  })) as SniperPageProps['publishedSniper'] | null
  if (isNotDefined(publishedSniper)) return null
  return publishedSniper.version
    ? ({
        name: publishedSniper.sniper.name,
        publicId: publishedSniper.sniper.publicId ?? null,
        background: publishedSniper.theme.general?.background ?? {
          type: defaultBackgroundType,
          content: defaultBackgroundColor,
        },
        isHideQueryParamsEnabled:
          publishedSniper.settings.general?.isHideQueryParamsEnabled ??
          defaultSettings.general.isHideQueryParamsEnabled,
        metadata: publishedSniper.settings.metadata ?? {},
        font: publishedSniper.theme.general?.font ?? null,
      } satisfies Pick<
        SniperV3PageProps,
        | 'name'
        | 'publicId'
        | 'background'
        | 'isHideQueryParamsEnabled'
        | 'metadata'
        | 'font'
      >)
    : publishedSniper
}

const getSniperFromCustomDomain = async (customDomain: string) => {
  const publishedSniper = (await prisma.publicSniper.findFirst({
    where: { sniper: { customDomain } },
    select: {
      variables: true,
      settings: true,
      theme: true,
      version: true,
      groups: true,
      edges: true,
      sniperId: true,
      id: true,
      sniper: {
        select: {
          name: true,
          isClosed: true,
          isArchived: true,
          publicId: true,
        },
      },
    },
  })) as SniperPageProps['publishedSniper'] | null
  if (isNotDefined(publishedSniper)) return null
  return publishedSniper.version
    ? ({
        name: publishedSniper.sniper.name,
        publicId: publishedSniper.sniper.publicId ?? null,
        background: publishedSniper.theme.general?.background ?? {
          type: defaultBackgroundType,
          content: defaultBackgroundColor,
        },
        isHideQueryParamsEnabled:
          publishedSniper.settings.general?.isHideQueryParamsEnabled ??
          defaultSettings.general.isHideQueryParamsEnabled,
        metadata: publishedSniper.settings.metadata ?? {},
        font: publishedSniper.theme.general?.font ?? null,
      } satisfies Pick<
        SniperV3PageProps,
        | 'name'
        | 'publicId'
        | 'background'
        | 'isHideQueryParamsEnabled'
        | 'metadata'
        | 'font'
      >)
    : publishedSniper
}

const getHost = (
  req?: IncomingMessage
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({
  publishedSniper,
  incompatibleBrowser,
  ...props
}: {
  isIE: boolean
  customHeadCode: string | null
  url: string
  publishedSniper:
    | SniperPageProps['publishedSniper']
    | Pick<
        SniperV3PageProps,
        | 'name'
        | 'publicId'
        | 'background'
        | 'isHideQueryParamsEnabled'
        | 'metadata'
        | 'font'
      >
  incompatibleBrowser: string | null
}) => {
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
  if (
    !publishedSniper ||
    ('sniper' in publishedSniper && publishedSniper.sniper.isArchived)
  )
    return <NotFoundPage />
  if ('sniper' in publishedSniper && publishedSniper.sniper.isClosed)
    return <ErrorPage error={new Error('This bot is now closed')} />
  return 'sniper' in publishedSniper ? (
    <SniperPageV2 publishedSniper={publishedSniper} {...props} />
  ) : (
    <SniperPageV3
      url={props.url}
      name={publishedSniper.name}
      publicId={publishedSniper.publicId}
      isHideQueryParamsEnabled={
        publishedSniper.isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled
      }
      background={
        publishedSniper.background ?? {
          type: defaultBackgroundType,
          content: defaultBackgroundColor,
        }
      }
      metadata={publishedSniper.metadata ?? {}}
      font={publishedSniper.font}
    />
  )
}

export default App
