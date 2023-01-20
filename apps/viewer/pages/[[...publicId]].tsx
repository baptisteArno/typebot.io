import { IncomingMessage } from 'http'
import { NotFoundPage } from 'layouts/NotFoundPage'
import { PublicTypebot } from 'models'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import sanitizeHtml from 'sanitize-html'
import { isDefined, isNotDefined, omit } from 'utils'
import { TypebotPage, TypebotPageProps } from '../layouts/TypebotPage'
//import prisma from '../libs/prisma'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let typebot: Omit<PublicTypebot, 'createdAt' | 'updatedAt'> | null
  const isIE = /MSIE|Trident/.test(context.req.headers['user-agent'] ?? '')
  const pathname = context.resolvedUrl.split('?')[0]
  const { host, forwardedHost } = getHost(context.req)
  try {
    if (!host) return { props: {} }
    const viewerUrls = (process.env.NEXT_PUBLIC_VIEWER_URL ?? '').split(',')
    const isMatchingViewerUrl = viewerUrls.some(
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
    // typebot = isMatchingViewerUrl
    //   ? await getTypebotFromPublicId(context.query.publicId?.toString())
    //   : await getTypebotFromCustomDomain(customDomain)
    // if (!typebot)
      // console.log(
      //   isMatchingViewerUrl
      //     ? `Couldn't find publicId: ${context.query.publicId?.toString()}`
      //     : `Couldn't find customDomain: ${customDomain}`
      //)
    // const headCode = typebot?.settings.metadata.customHeadCode
    // return {
    //   props: {
    //     typebot,
    //     isIE,
    //     url: `https://${forwardedHost ?? host}${pathname}`,
    //     customHeadCode:
    //       isDefined(headCode) && headCode !== ''
    //         ? sanitizeHtml(headCode, { allowedTags: ['script', 'meta'] })
    //         : null,
    //   },
    // }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      isIE,
      url: `https://${forwardedHost ?? host}${pathname}`,
    },
  }
}

const getTypebotFromPublicId = async (publicId?: string) => {
  if (!publicId) return null
  // const typebot = await prisma.publicTypebot.findUnique({
  //   where: { publicId },
  // })
  // if (isNotDefined(typebot)) return null
  // return omit(typebot as unknown as PublicTypebot, 'createdAt', 'updatedAt')
  return null
}

const getTypebotFromCustomDomain = async (customDomain: string) => {
  // const typebot = await prisma.publicTypebot.findFirst({
  //   where: { customDomain },
  // })
  // if (isNotDefined(typebot)) return null
  // return omit(typebot as unknown as PublicTypebot, 'createdAt', 'updatedAt')
  return null
}

const getHost = (
  req?: IncomingMessage
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({ typebot, ...props }: TypebotPageProps) =>
  isDefined(typebot) ? (
    <TypebotPage typebot={typebot} {...props} />
  ) : (
    <NotFoundPage />
  )

export default App
