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
  try {
    if (!context.req.headers.host) return { props: {} }
    const viewerUrls = (process.env.NEXT_PUBLIC_VIEWER_URL ?? '').split(',')
    typebot = viewerUrls.some((url) =>
      context.req.headers.host?.includes(url.split('//')[1])
    )
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : await getTypebotFromCustomDomain(
          `${context.req.headers.host}${pathname === '/' ? '' : pathname}`
        )
    return {
      props: {
        typebot,
        isIE,
        url: `https://${context.req.headers.host}${pathname}`,
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      isIE,
      url: `https://${context.req.headers.host}${pathname}`,
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

const App = ({ typebot, ...props }: TypebotPageProps) =>
  isDefined(typebot) ? (
    <TypebotPage typebot={typebot} {...props} />
  ) : (
    <NotFoundPage />
  )

export default App
