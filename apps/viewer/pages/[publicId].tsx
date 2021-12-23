import { PublicTypebot } from 'bot-engine'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { TypebotPage, TypebotPageProps } from '../layouts/TypebotPage'
import prisma from '../libs/prisma'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let typebot: PublicTypebot | undefined
  const isIE = /MSIE|Trident/.test(context.req.headers['user-agent'] ?? '')
  const pathname = context.resolvedUrl.split('?')[0]
  try {
    if (!context.req.headers.host) return { props: {} }
    typebot = await getTypebotFromPublicId(context.query.publicId.toString())
    if (!typebot) return { props: {} }
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

const getTypebotFromPublicId = async (
  publicId: string
): Promise<PublicTypebot | undefined> => {
  const typebot = await prisma.publicTypebot.findUnique({
    where: { publicId },
  })
  return (typebot as unknown as PublicTypebot | undefined) ?? undefined
}

const App = (props: TypebotPageProps) => <TypebotPage {...props} />
export default App
