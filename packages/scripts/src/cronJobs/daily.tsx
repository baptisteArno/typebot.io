import { sendMessage } from "@typebot.io/telemetry/sendMessage";
import { cleanExpiredData } from "../helpers/cleanExpiredData";
import { formatSubscriptionMessage } from "../helpers/formatSubscriptionMessage";
import { getLandingPageVisitors } from "../helpers/getLandingPageVisitors";
import { getSubscriptionTransitions } from "../helpers/getSubscriptionTransitions";
import { trackAndReportYesterdaysResults } from "../helpers/trackAndReportYesterdaysResults";

export const main = async () => {
  await cleanExpiredData();
  const { totalResults, totalWorkspaces } =
    await trackAndReportYesterdaysResults();
  const uniqueVisitors = await getLandingPageVisitors();
  const subscriptionTransitions = await getSubscriptionTransitions();

  // const { totalDeletedWorkspaces } = await deleteOrWarnInactiveWorkspaces();
  // reportMessage += `🔥 ${totalDeletedWorkspaces} workspaces were deleted.\n`;

  await sendMessage(`Daily report:
    
📥 ${totalResults} collected results
🏭 ${totalWorkspaces} active workspaces
🌐 ${uniqueVisitors} landing page visits

${formatSubscriptionMessage(subscriptionTransitions)}

[Go to daily dashboard](https://eu.posthog.com/project/${process.env.POSTHOG_PROJECT_ID}/dashboard/${process.env.POSTHOG_DAILY_DASHBOARD_ID})
[Go to web analytics](https://eu.posthog.com/project/${process.env.POSTHOG_PROJECT_ID}/web)`);
};

main().then();
