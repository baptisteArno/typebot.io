import { NotFoundPage } from 'layouts/NotFoundPage'
import { PublicTypebot } from 'models'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { TypebotPage, TypebotPageProps } from '../layouts/TypebotPage'
import prisma from '../libs/prisma'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let typebot: PublicTypebot | null
  const isIE = /MSIE|Trident/.test(context.req.headers['user-agent'] ?? '')
  const pathname = context.resolvedUrl.split('?')[0]
  try {
    if (!context.req.headers.host) return { props: {} }
    typebot = context.req.headers.host.includes(
      (process.env.NEXT_PUBLIC_VIEWER_HOST ?? '').split('//')[1]
    )
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : await getTypebotFromCustomDomain(
          `${context.req.headers.host}${pathname}`
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
  return (typebot as unknown as PublicTypebot) ?? null
}

const getTypebotFromCustomDomain = async (customDomain: string) => {
  const typebot = await prisma.publicTypebot.findUnique({
    where: { customDomain },
  })
  return (typebot as unknown as PublicTypebot) ?? null
}

const App = ({ typebot, ...props }: TypebotPageProps) =>
  typebot ? <TypebotPage typebot={typebot} {...props} /> : <NotFoundPage />

export default App
