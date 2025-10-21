import { env } from "@typebot.io/env";
import type { GetServerSidePropsContext } from "next";
import { trackAnalyticsPageView } from "@/features/telemetry/helpers/trackAnalyticsPageView";
import ResultsPage from "../results";

const AnalyticsPage = ResultsPage;

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY)
    return {
      props: {},
    };
  await trackAnalyticsPageView(context);
  return {
    props: {},
  };
};

export default AnalyticsPage;
