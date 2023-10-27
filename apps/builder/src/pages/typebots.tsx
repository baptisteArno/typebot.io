import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { GetServerSidePropsContext } from 'next'

export default function Page() {
  return <DashboardPage />
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const redirectPath = context.query.redirectPath?.toString()
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}
