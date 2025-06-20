import { sendMessage } from "@typebot.io/telemetry/sendMessage";
import { cleanExpiredData } from "../helpers/cleanExpiredData";
import { getLandingPageVisitors } from "../helpers/getLandingPageVisitors";
import { trackAndReportYesterdaysResults } from "../helpers/trackAndReportYesterdaysResults";

export const main = async () => {
  let reportMessage = "Daily cron job:\n\n";

  const { totalResults, totalWorkspaces } =
    await trackAndReportYesterdaysResults();
  reportMessage += `📥 ${totalWorkspaces} workspaces collected a total of ${totalResults} results.\n`;

  const uniqueVisitors = await getLandingPageVisitors();
  reportMessage += `🌐 ${uniqueVisitors} unique visitors on the landing page yesterday.\n`;

  // const { totalDeletedWorkspaces } = await deleteOrWarnInactiveWorkspaces();
  // reportMessage += `🔥 ${totalDeletedWorkspaces} workspaces were deleted.\n`;

  const { totalDeletedChatSessions } = await cleanExpiredData();
  reportMessage += `💬 ${totalDeletedChatSessions} chat sessions were deleted.\n\n`;

  reportMessage += `[Go to daily dashboard](https://eu.posthog.com/project/${process.env.POSTHOG_PROJECT_ID}/dashboard/${process.env.POSTHOG_DAILY_DASHBOARD_ID})\n`;
  reportMessage += `[Go to web analytics](https://eu.posthog.com/project/${process.env.POSTHOG_PROJECT_ID}/web)`;

  await sendMessage(reportMessage);
};

main().then();
