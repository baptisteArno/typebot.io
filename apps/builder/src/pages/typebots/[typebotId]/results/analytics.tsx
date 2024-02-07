import { GetServerSidePropsContext } from 'next'
import ResultsPage from '../results'
import { env } from '@typebot.io/env'
import { trackAnalyticsPageView } from '@/features/telemetry/helpers/trackAnalyticsPageView'

const AnalyticsPage = ResultsPage

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || env.NEXT_PUBLIC_E2E_TEST)
    return {
      props: {},
    }
  await trackAnalyticsPageView(context)
  return {
    props: {},
  }
}

export default AnalyticsPage
