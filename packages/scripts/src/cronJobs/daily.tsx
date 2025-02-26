import { sendMessage } from "@typebot.io/telemetry/sendMessage";
import { cleanExpiredData } from "../helpers/cleanExpiredData";
import { trackAndReportYesterdaysResults } from "../helpers/trackAndReportYesterdaysResults";

export const main = async () => {
  let reportMessage = "Daily cron job:\n\n";

  const { totalResults, totalWorkspaces } =
    await trackAndReportYesterdaysResults();
  reportMessage += `📥 ${totalWorkspaces} workspaces collected a total of ${totalResults} results.\n`;

  // const { totalDeletedWorkspaces } = await deleteOrWarnInactiveWorkspaces();
  // reportMessage += `🔥 ${totalDeletedWorkspaces} workspaces were deleted.\n`;

  const { totalDeletedChatSessions } = await cleanExpiredData();
  reportMessage += `💬 ${totalDeletedChatSessions} chat sessions were deleted.\n\n`;

  reportMessage += `[Go to daily dashboard](https://eu.posthog.com/project/${process.env.POSTHOG_PROJECT_ID}/dashboard/${process.env.POSTHOG_DAILY_DASHBOARD_ID})`;

  await sendMessage(reportMessage);
};

main().then();
