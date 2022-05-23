import { IncomingMessage } from 'http'
import { NotFoundPage } from 'layouts/NotFoundPage'
import { PublicTypebot } from 'models'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { isDefined, isNotDefined, omit } from 'utils'
import { TypebotPage, TypebotPageProps } from '../layouts/TypebotPage'
import prisma from '../libs/prisma'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let typebot: Omit<PublicTypebot, 'createdAt' | 'updatedAt'> | null
  const isIE = /MSIE|Trident/.test(context.req.headers['user-agent'] ?? '')
  const pathname = context.resolvedUrl.split('?')[0]
  const host = getHost(context.req)
  try {
    if (!host) return { props: {} }
    const viewerUrls = (process.env.NEXT_PUBLIC_VIEWER_URL ?? '').split(',')
    const isMatchingViewerUrl = viewerUrls.some((url) =>
      host.split(':')[0].includes(url.split('//')[1].split(':')[0])
    )
    const customDomain = `${host}${pathname === '/' ? '' : pathname}`
    typebot = isMatchingViewerUrl
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : await getTypebotFromCustomDomain(customDomain)
    if (!typebot)
      console.log(
        isMatchingViewerUrl
          ? `Couldn't find publicId: ${context.query.publicId?.toString()}`
          : `Couldn't find customDomain: ${customDomain}`
      )
    return {
      props: {
        typebot,
        isIE,
        url: `https://${host}${pathname}`,
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      isIE,
      url: `https://${host}${pathname}`,
    },
  }
}

const getTypebotFromPublicId = async (publicId?: string) => {
  if (!publicId) return null
  const typebot = await prisma.publicTypebot.findUnique({
    where: { publicId },
  })
  if (isNotDefined(typebot)) return null
  return omit(typebot as unknown as PublicTypebot, 'createdAt', 'updatedAt')
}

const getTypebotFromCustomDomain = async (customDomain: string) => {
  const typebot = await prisma.publicTypebot.findFirst({
    where: { customDomain },
  })
  if (isNotDefined(typebot)) return null
  return omit(typebot as unknown as PublicTypebot, 'createdAt', 'updatedAt')
}

const getHost = (req?: IncomingMessage): string | undefined => {
  let host = req?.headers ? req.headers.host : window.location.host
  if (!host) return
  if (
    req &&
    req.headers['x-forwarded-host'] &&
    typeof req.headers['x-forwarded-host'] === 'string'
  ) {
    host = req.headers['x-forwarded-host']
  }

  return host
}

const App = ({ typebot, ...props }: TypebotPageProps) =>
  isDefined(typebot) ? (
    <TypebotPage typebot={typebot} {...props} />
  ) : (
    <NotFoundPage />
  )

export default App
