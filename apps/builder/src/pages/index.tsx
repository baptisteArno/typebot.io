import { getLocaleProps } from '@/locales'
import { GetServerSidePropsContext } from 'next'
import { getSession } from 'next-auth/react'

export default function Page() {
  return null
}

export const getServerSideProps = getLocaleProps(
  async (context: GetServerSidePropsContext) => {
    const session = await getSession(context)
    if (!session?.user) {
      return {
        redirect: {
          permanent: false,
          destination:
            context.locale !== context.defaultLocale
              ? `/${context.locale}/signin`
              : '/signin',
        },
      }
    }
    return {
      redirect: {
        permanent: false,
        destination:
          context.locale !== context.defaultLocale
            ? `/${context.locale}/typebots`
            : '/typebots',
      },
    }
  }
)
