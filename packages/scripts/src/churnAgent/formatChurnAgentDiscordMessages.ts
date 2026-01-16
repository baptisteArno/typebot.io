import { env } from "@typebot.io/env";
import type { workspaceSummaryType } from "../workspaceSummaryAgent/WorkspaceSummaryBuilders";

type Options = {
  excludeTimeline?: boolean;
  excludeEmailSuggestion?: boolean;
};

export const formatChurnAgentDiscordMessages = (
  { workspace, subscription, members, ai_analysis }: workspaceSummaryType,
  { excludeTimeline, excludeEmailSuggestion }: Options = {},
) => {
  const messages = [
    `# 👋 Workspace scheduled for cancellation
  - Name: ${workspace.name}${subscription.country_emoji ? ` ${subscription.country_emoji}` : ""}
  - Spent ${subscription.total_paid}, [see subscription details](<https://dashboard.stripe.com/customers/${subscription.stripe_id}>)
  - Created ${workspace.created_at}`,
  ];

  if (ai_analysis) {
    if (!excludeTimeline) {
      messages.push(
        `## Timeline:\n\n${ai_analysis.workspaceTimeline}\n[Full activity here](<${env.POSTHOG_API_HOST}/project/${env.POSTHOG_PROJECT_ID}/groups/1/${workspace.id}/events>)`,
      );
    }

    messages.push(
      `## Business activity:\n\n${ai_analysis.businessActivity}`,
      `## Purpose:\n\n${ai_analysis.purpose}`,
      `## Workspace level:\n\n${ai_analysis.workspaceLevel}`,
      `## Reason:\n\n${ai_analysis.churnReason}`,
    );

    if (!excludeEmailSuggestion) {
      messages.push(
        ai_analysis.outreachEmail
          ? `## Email suggestion:\n\n${ai_analysis.outreachEmail}\nRecipient: ${members.list.find((m) => m.role === "ADMIN")?.email || "Unknown"}`
          : "No email suggestion",
      );
    }
  }

  return messages;
};
