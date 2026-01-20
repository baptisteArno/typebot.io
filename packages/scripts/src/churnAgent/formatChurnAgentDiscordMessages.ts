import { env } from "@typebot.io/env";
import type { WorkspaceSummaryType } from "../workspaceSummaryAgent/workspaceSummaryBuilders";

type Options = {
  excludeTimeline?: boolean;
  excludeEmailSuggestion?: boolean;
};

export const formatChurnAgentDiscordMessages = (
  { workspace, subscription, members, aiAnalysis }: WorkspaceSummaryType,
  { excludeTimeline, excludeEmailSuggestion }: Options = {},
) => {
  const stripeCustomerUrl = subscription.stripeId
    ? `https://dashboard.stripe.com/customers/${subscription.stripeId}`
    : null;

  const messages = [
    `# 👋 Workspace scheduled for cancellation
  - Name: ${workspace.name}${subscription.countryEmoji ? ` ${subscription.countryEmoji}` : ""}
  - Spent ${subscription.totalPaid}${stripeCustomerUrl ? `, [see subscription details](<${stripeCustomerUrl}>)` : ""}
  - Created ${workspace.createdAt}`,
  ];

  if (aiAnalysis) {
    if (!excludeTimeline) {
      messages.push(
        `## Timeline:\n\n${aiAnalysis.workspaceTimeline}\n[Full activity here](<${env.POSTHOG_API_HOST}/project/${env.POSTHOG_PROJECT_ID}/groups/1/${workspace.id}/events>)`,
      );
    }

    messages.push(
      `## Business activity:\n\n${aiAnalysis.businessActivity}`,
      `## Purpose:\n\n${aiAnalysis.purpose}`,
      `## Workspace level:\n\n${aiAnalysis.workspaceLevel}`,
      `## Reason:\n\n${aiAnalysis.churnReason}`,
    );

    if (!excludeEmailSuggestion) {
      messages.push(
        aiAnalysis.outreachEmail
          ? `## Email suggestion:\n\n${aiAnalysis.outreachEmail}\nRecipient: ${members.list.find((m) => m.role === "ADMIN")?.email || "Unknown"}`
          : "No email suggestion",
      );
    }
  }

  return messages;
};
