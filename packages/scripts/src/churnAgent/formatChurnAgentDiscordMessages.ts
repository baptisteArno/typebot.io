import { env } from "@typebot.io/env";
import type { ChurnSummary } from "./getYesterdayChurnSummary";

export const formatChurnAgentDiscordMessages = ({
  workspace,
  snapshot,
  timeline,
  guessedChurnReason,
  outreachEmail,
}: ChurnSummary) => [
  `# 👋 Workspace scheduled for cancellation
  - Name: ${workspace.name}${workspace.countryEmoji ? ` ${workspace.countryEmoji}` : ""}
  - Spent ${workspace.totalSpent}, [see subscription details](<https://dashboard.stripe.com/customers/${workspace.stripeId}>)
  - Created ${workspace.createdAt}
  - Summary: ${snapshot}. [Full activity here](<${env.POSTHOG_API_HOST}/project/${env.POSTHOG_PROJECT_ID}/groups/1/${workspace.id}/events>)`,
  `## Timeline:\n\n${timeline}`,
  `## Reason:\n\n${guessedChurnReason}}`,
  outreachEmail
    ? `## Email suggestion:\n\n${outreachEmail?.recipient}\n\`${outreachEmail?.subject}\`\n\`\`\`\n${outreachEmail?.content}\`\`\``
    : "No email suggestion",
];
