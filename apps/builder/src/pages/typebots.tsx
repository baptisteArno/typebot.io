import { NextPageContext } from 'next/types'
import { DashboardPage } from '@/features/dashboard'

export default function Page() {
  return <DashboardPage />
}

export async function getServerSideProps(context: NextPageContext) {
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
