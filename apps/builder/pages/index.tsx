import { GetServerSidePropsContext } from 'next'
import { getSession } from 'next-auth/react'

function RedirectPage() {
  return
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context)
  if (!session?.user) {
    return { redirect: { permanent: false, destination: '/signin' } }
  }
  return { redirect: { permanent: false, destination: '/typebots' } }
}

export default RedirectPage
