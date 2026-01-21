import { openai } from "@ai-sdk/openai";
import type { $Enums } from "@prisma/client";
import { zodToSchema } from "@typebot.io/ai/zodToSchema";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isInputBlock,
  isIntegrationBlock,
} from "@typebot.io/blocks-core/helpers";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import type { Prisma } from "@typebot.io/prisma/types";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import { generateObject } from "ai";
import fs, { existsSync, mkdirSync } from "fs";
import path from "path";
import { z } from "zod";
import { executePostHogQuery } from "../helpers/executePostHogQuery";
import { getPrismaWorkspace } from "../helpers/prisma/getWorkspace";
import { getCustomerChurnSummary } from "../helpers/stripe/getCustomerChurnSummary";

import {
  typebotSummarySystemPrompt,
  userJourneySummarySystemPrompt,
  workspaceSummarySystemPrompt,
} from "./agentPrompts";
import { calculateCost } from "./aiModelPricing";

const MAX_GROUPS_PER_BOT = 20;
const MAX_BLOCKS_PER_GROUP = 10;
const MAX_BOTS_PER_WORKSPACE = 6;

type AiUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
};

type AggregatedAiUsage = AiUsage & {
  callCount: number;
  byFunction: Record<string, AiUsage & { callCount: number }>;
};

const createEmptyUsage = (): AiUsage => ({
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  cost: 0,
});

const addUsage = (a: AiUsage, b: AiUsage): AiUsage => ({
  inputTokens: a.inputTokens + b.inputTokens,
  outputTokens: a.outputTokens + b.outputTokens,
  totalTokens: a.totalTokens + b.totalTokens,
  cost: a.cost + b.cost,
});

type SimplifiedTypebotBlock =
  | { type: "bubble"; content: string }
  | { type: "input"; blockType: string }
  | { type: "integration"; blockType: string };

type SimplifiedTypebotGroup = {
  title: string;
  blocks: SimplifiedTypebotBlock[];
};

type SimplifiedTypebot = {
  name: string;
  totalGroups: number;
  totalBlocks: number;
  uniqueBlockTypes: string[];
  groups: SimplifiedTypebotGroup[];
};

type TypebotAiSummary = {
  summary: string;
  category: string | null;
  otherCategory: string | null;
  isScam: boolean;
  isUndesired: boolean;
  reason: string | null;
};

export type WorkspaceSubscriptionItem = {
  subscriptionId: string;
  countryEmoji: string;
  startDate: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  cancellationReason: string;
  cancellationComment: string;
  totalPaid: string;
};

export type WorkspaceSubscriptionSummary = {
  stripeId: string | null;
  totalSubscriptions: number;
  totalPaid: string;
  countryEmoji: string;
  list: WorkspaceSubscriptionItem[];
};

export type WorkspaceMemberSummary = {
  email: string | null;
  role: $Enums.WorkspaceRole;
  userId: string;
};

export type WorkspaceTypebotSummary = {
  id: string;
  name: string;
  createdAt: string;
  totalResults: number | null;
  totalGroups?: number;
  totalBlocks?: number;
  uniqueBlockTypes?: string[];
  summary?: string;
  category?: string | null;
  otherCategory?: string | null;
  isScam?: boolean;
  isUndesired?: boolean;
  reason?: string | null;
};

export type WorkspaceUserJourneySummary = {
  email: string | null;
  summary: string;
};

export type WorkspaceAiAnalysis = {
  businessActivity: string;
  purpose: string;
  workspaceLevel: string;
  engagementLevel: string;
  workspaceTimeline: string;
  churnRisk?: string;
  recommendations?: string;
  churnReason?: string;
  outreachEmail?: string;
};

export type WorkspaceSummaryType = {
  workspace: {
    id: string;
    name: string;
    createdAt: string;
    plan: string;
  };
  subscription: WorkspaceSubscriptionSummary;
  members: {
    totalMembers: number;
    list: WorkspaceMemberSummary[];
  };
  typebots: {
    totalTypebots: number;
    categoryCount: Record<string, number>;
    list: WorkspaceTypebotSummary[];
  };
  lastEvents: Record<string, string>;
  userJourneys: WorkspaceUserJourneySummary[];
  aiAnalysis?: WorkspaceAiAnalysis;
  aiUsage?: AggregatedAiUsage;
};

const createFolderIfNotExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const getUserJourneyAISummary = async (
  eventsJournal: string,
): Promise<{ summary: string; usage: AiUsage }> => {
  const {
    object: { summary },
    usage,
  } = await generateObject({
    model: openai("gpt-5"),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
    schema: zodToSchema(
      z.object({
        summary: z.string(),
      }),
    ),
    system: userJourneySummarySystemPrompt,
    messages: [
      {
        role: "user",
        content: eventsJournal,
      },
    ],
  });

  const usageWithDetails = usage as typeof usage & {
    inputTokenDetails?: { cacheReadTokens?: number };
  };

  return {
    summary,
    usage: {
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      cost: calculateCost("gpt-5", usage.promptTokens, usage.completionTokens, {
        cachedTokens: usageWithDetails.inputTokenDetails?.cacheReadTokens,
      }),
    },
  };
};

const getSimplifiedTypebotObject = (
  typebot: Pick<
    Prisma.Typebot,
    "id" | "name" | "createdAt" | "updatedAt" | "version" | "groups"
  >,
): SimplifiedTypebot => {
  const groups = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  });

  // receives typebot data from DB
  const groupsData: SimplifiedTypebotGroup[] = [];

  // count total number of groups and blocks
  const totalGroups = groups.length;
  const totalBlocks = groups.reduce(
    (acc, group) => acc + group.blocks.length,
    0,
  );
  // collect unique block types
  const uniqueBlockTypes = new Set<string>();
  for (const group of groups) {
    for (const block of group.blocks) {
      uniqueBlockTypes.add(block.type);
    }
  }
  // build simplified typebot data
  for (const group of groups.slice(0, MAX_GROUPS_PER_BOT)) {
    const blocks: SimplifiedTypebotBlock[] = [];
    for (const block of group.blocks.slice(0, MAX_BLOCKS_PER_GROUP)) {
      if (
        block.type === BubbleBlockType.TEXT &&
        block.content?.richText &&
        block.content.richText.length > 0
      ) {
        blocks.push({
          type: "bubble",
          content: convertRichTextToMarkdown(block.content?.richText),
        });
      }
      if (isInputBlock(block)) {
        blocks.push({ type: "input", blockType: block.type });
      }
      if (isIntegrationBlock(block)) {
        blocks.push({ type: "integration", blockType: block.type });
      }
    }
    if (blocks.length > 0) {
      groupsData.push({
        title: group.title,
        blocks,
      });
    }
  }

  return {
    name: typebot.name,
    totalGroups,
    totalBlocks,
    uniqueBlockTypes: Array.from(uniqueBlockTypes),
    groups: groupsData,
  };
};

const getTypebotAISummary = async (
  typebotData: string,
): Promise<TypebotAiSummary & { usage: AiUsage }> => {
  const {
    object: { summary, isScam, isUndesired, reason, category, otherCategory },
    usage,
  } = await generateObject({
    model: openai("gpt-5"),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
    schema: zodToSchema(
      z.object({
        summary: z.string(),
        isScam: z.boolean(),
        isUndesired: z.boolean(),
        reason: z.string().nullable(),
        category: z.string().nullable(),
        otherCategory: z.string().nullable(),
      }),
    ),
    system: typebotSummarySystemPrompt,
    messages: [
      {
        role: "user",
        content: typebotData,
      },
    ],
  });

  const usageWithDetails = usage as typeof usage & {
    inputTokenDetails?: { cacheReadTokens?: number };
  };

  return {
    summary,
    category,
    otherCategory,
    isScam,
    isUndesired,
    reason,
    usage: {
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      cost: calculateCost("gpt-5", usage.promptTokens, usage.completionTokens, {
        cachedTokens: usageWithDetails.inputTokenDetails?.cacheReadTokens,
      }),
    },
  };
};

const getEventsJournal = (events: (string | number)[][]) => {
  const journal: string[] = [];
  const ongoing: Record<string, { from: string; to: string; total: number }> =
    {};
  let fromDate = "";

  const flushAllOngoing = () => {
    for (const key in ongoing) {
      const entry = ongoing[key];
      if (entry.from !== entry.to) {
        journal.push(
          `${entry.from} to ${entry.to}: ${entry.total} New results collected on typebot ${key}`,
        );
      } else {
        journal.push(
          `${entry.from}: ${entry.total} New results collected on typebot ${key}`,
        );
      }
    }
    Object.keys(ongoing).forEach((key) => delete ongoing[key]);
  };

  for (const eventEntry of events) {
    const event = eventEntry[0];
    const timestamp = eventEntry[1];
    const propertiesString = eventEntry[2];
    if (typeof event !== "string" || typeof timestamp !== "string") continue;

    const properties = parseJsonRecord(String(propertiesString));
    const time = timestamp.split("T")[0];

    if (event === "New results collected") {
      let key: string;
      // some events may not have group_0 defined
      const group0 = getString(properties["$group_0"]);
      if (!group0) {
        key = "unknown";
      } else {
        key = group0.slice(0, 7);
      }
      // some events may have total=0, then ignore
      const total = getNumberLike(properties["total"]) ?? 0;
      if (total === 0) {
        continue;
      }
      if (key in ongoing) {
        ongoing[key].to = time;
        ongoing[key].total += total;
      } else {
        ongoing[key] = { from: time, to: time, total };
      }
    } else {
      flushAllOngoing();
    }
    if (event === "Typebot published") {
      // if previous event in the journal is the same typebot, keep last
      const group0 = getString(properties["$group_0"]);
      if (!group0) continue;
      if (
        journal.length > 0 &&
        journal[journal.length - 1].includes("Typebot") &&
        journal[journal.length - 1].includes("published") &&
        journal[journal.length - 1].includes(group0.slice(0, 7))
      ) {
        journal.pop();
        if (fromDate === time) {
          journal.push(
            `${fromDate}: Typebot ${group0.slice(0, 7)} published multiple times`,
          );
        } else {
          journal.push(
            `${fromDate} to ${time}: Typebot ${group0.slice(0, 7)} published multiple times`,
          );
        }
      } else {
        // update fromDate in case it's the first of a serie
        fromDate = time;
        journal.push(`${time}: Typebot ${group0.slice(0, 7)} published`);
      }
    }
    if (event === "Workspace created") {
      const group1 = getString(properties["$group_1"]);
      if (!group1) continue;
      const plan = getString(properties.plan) ?? "unknown";
      journal.push(
        `${time}: Workspace ${group1.slice(0, 7)} created with ${plan} plan`,
      );
    } else if (event === "$groupidentify") {
      const groupType = getString(properties["$group_type"]);
      if (groupType === "typebot") {
        const groupKey = getString(properties["$group_key"]);
        const groupSet = getRecord(properties["$group_set"]);
        const groupName = groupSet ? getString(groupSet["name"]) : undefined;
        if (!groupKey || !groupName) continue;
        journal.push(
          `${time}: Typebot ${groupKey.slice(0, 7)} created: ${groupName}`,
        );
      }
      if (groupType === "workspace") {
        const groupKey = getString(properties["$group_key"]);
        if (!groupKey) continue;
        journal.push(`${time}: Workspace ${groupKey.slice(0, 7)} created`);
      }
    }

    if (event === "Workspace limit reached") {
      const limitType = getString(properties["limitType"]) ?? "unknown";
      journal.push(
        `${time}: Workspace limit reached for ${limitType} (used: ${String(properties["used"])}, limit: ${String(properties["limit"])})`,
      );
    }

    if (event === "Workspace automatically quarantined") {
      journal.push(
        `${time}: Workspace automatically quarantined because total chats used = ${String(properties["totalChatsUsed"])} and chats limit = ${String(properties["chatsLimit"])}`,
      );
    }
    if (event === "Subscription updated") {
      let eventString = "";
      const plan = getString(properties["plan"]);
      eventString += `${time}: Subscription updated${plan ? ` to ${plan}` : ""}`;
      const prevPlan = getString(properties["prevPlan"]);
      if (prevPlan) {
        eventString += ` (from ${prevPlan})`;
      }
      journal.push(eventString);
    }

    if (event === "Subscription scheduled for cancellation") {
      let eventString = "";
      eventString += `${time}: Subscription scheduled for cancellation`;
      const plan = getString(properties["plan"]);
      if (plan) {
        eventString += ` (plan ${plan})`;
      }
      journal.push(eventString);
    }

    if (event === "User created") {
      const email = getString(properties["email"]) ?? "unknown";
      const name = getString(properties["name"]) ?? "unknown";
      journal.push(
        `${time}: User account created for email:${email} name: ${name}.`,
      );
    }

    const typebotEvents = [
      "File upload block published",
      "Branding removed",
      "Analytics visited",
    ];
    for (const typebotEvent of typebotEvents) {
      if (event === typebotEvent) {
        const group0 = getString(properties["$group_0"]);
        if (!group0) continue;
        journal.push(
          `${time}: ${typebotEvent} on typebot ${group0.slice(0, 7)}`,
        );
      }
    }

    const simpleEvents = [
      "User logged in",
      "User updated",
      "Limit warning email sent",
      "Limit reached email sent",
      "Custom domain added",
      "Workspace unpaid",
      "Workspace past due",
      "Workspace past due status removed",
      "Whatsapp credentials created",
      "Folder created",
      "Subscription cancellation removed",
    ];

    for (const simpleEvent of simpleEvents) {
      if (event === simpleEvent) {
        const journalEntry = `${time}: ${simpleEvent}`;
        // check if previous entry is not the same, to avoid redundancy
        if (journal[journal.length - 1] !== journalEntry) {
          journal.push(journalEntry);
        }
      }
    }
  }

  flushAllOngoing();

  const deduplicatedJournal = Array.from(new Set(journal));

  return deduplicatedJournal;
};

const getLastEventOccurences = async (workspaceId: string) => {
  const events = [
    "User created",
    "User updated",
    "Typebot published",
    "New results collected",
    "Analytics visited",
    "Custom domain added",
    "Branding removed",
    "File upload block published",
    "Folder created",
    "WhatsApp credentials created",
    "Workspace limit reached",
    "Subscription updated",
    "Workspace automatically quarantined",
    "Workspace past due",
    "Workspace past due status removed",
    "Workspace unpaid",
    "Subscription scheduled for cancellation",
    "Subscription cancellation removed",
  ];

  const query = `
    SELECT
      event,
      max(timestamp) AS last_ts
    FROM events
    WHERE properties.$group_1 = '${workspaceId}'
      AND event IN (${events.map((e) => `'${e}'`).join(", ")})
    GROUP BY event
    ORDER BY last_ts DESC
  `;

  const result = await executePostHogQuery(query);

  const lastEvents: Record<string, string> = {};
  for (const row of result?.results ?? []) {
    const eventName = row[0];
    const ts = row[1];
    if (typeof eventName !== "string" || typeof ts !== "string") continue;
    lastEvents[eventName] = ts.split("T")[0];
  }

  // Already ordered by last_ts DESC, but keep your sort to be safe:
  const lastEventsSorted = Object.fromEntries(
    Object.entries(lastEvents).sort(([, a], [, b]) => {
      return new Date(b).getTime() - new Date(a).getTime();
    }),
  );

  return lastEventsSorted;
};

const getUserJourney = async (
  userId: string,
  workspaceId: string,
): Promise<{ summary: string; usage: AiUsage }> => {
  const eventsQuery = `SELECT event, timestamp, properties FROM events WHERE distinct_id = '${userId}' ORDER BY timestamp LIMIT 5000`;
  const eventsResponse = await executePostHogQuery(eventsQuery);
  const eventsResults = eventsResponse.results;
  console.log("   Found ", eventsResults.length, "events for user", userId);

  const eventsJournal = getEventsJournal(eventsResults);
  saveToFile(
    `${workspaceId}/users/${userId}/eventsJournal.txt`,
    eventsJournal.join("\n"),
  );
  console.log("   Journal length:", eventsJournal.length);

  const { summary, usage } = await getUserJourneyAISummary(
    eventsJournal.join("\n"),
  );

  return { summary, usage };
};

const getTypebotResultsCount = async (typebotId: string) => {
  const resultsCountQuery = `SELECT sum(properties.total) FROM events WHERE event = 'New results collected' AND properties.$group_0 = '${typebotId}' `;
  try {
    const resultsCountResponse = await executePostHogQuery(resultsCountQuery);
    const totalResults = Number(resultsCountResponse?.results?.[0]?.[0] ?? 0);
    return totalResults;
  } catch (error) {
    console.error("Error fetching results count for typebot:", typebotId);
    console.error(error);
    return null;
  }
};

const getTypebotsSummaries = async (
  typebotsObjects: Pick<
    Prisma.Typebot,
    "id" | "name" | "createdAt" | "updatedAt" | "version" | "groups"
  >[],
  workspaceId?: string,
): Promise<{ list: WorkspaceTypebotSummary[]; usage: AiUsage }> => {
  // sort typebots by creation date descending
  const sortedTypebots = typebotsObjects.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  // get typebot results count from PostHog
  const typebotsList: WorkspaceTypebotSummary[] = await Promise.all(
    sortedTypebots.map(async (tb) => ({
      id: tb.id,
      name: tb.name,
      createdAt: tb.createdAt.toISOString().split("T")[0],
      totalResults: await getTypebotResultsCount(tb.id),
    })),
  );

  // sort typebots by totalResults descending
  const topTypebotsIds = typebotsList
    .sort((a, b) => (b.totalResults ?? 0) - (a.totalResults ?? 0))
    .map((tb) => tb.id)
    .slice(0, MAX_BOTS_PER_WORKSPACE);

  let totalUsage = createEmptyUsage();

  // enhance top typebots with AI summary
  for (const typebot of sortedTypebots) {
    if (!topTypebotsIds.includes(typebot.id)) continue;

    // get typebot simplified object
    const typebotSimplified = getSimplifiedTypebotObject(typebot);

    // get ai summary
    const { usage, ...typebotAiSummary } = await getTypebotAISummary(
      JSON.stringify(typebotSimplified, null, 2),
    );
    totalUsage = addUsage(totalUsage, usage);

    const typebotFullSummary = Object.assign(
      typebotSimplified,
      typebotAiSummary,
    );
    saveToFile(
      `${workspaceId ? workspaceId + "/" : ""}typebots/${typebot.id}/typebotSummary.json`,
      JSON.stringify(typebotFullSummary, null, 2),
    );
    // update typebot in the list
    const typebotIndex = typebotsList.findIndex((tb) => tb.id === typebot.id);
    const { groups: _groups, ...typebotSummaryWithoutGroups } =
      typebotFullSummary;
    Object.assign(typebotsList[typebotIndex], typebotSummaryWithoutGroups);
  }
  return { list: typebotsList, usage: totalUsage };
};

const getTypebotsCategoryCounts = (typebotsList: WorkspaceTypebotSummary[]) => {
  const categoryCount: Record<string, number> = {};
  for (const tb of typebotsList) {
    if (tb.category) {
      if (tb.category in categoryCount) {
        categoryCount[tb.category]++;
      } else {
        categoryCount[tb.category] = 1;
      }
    } else if (tb.isScam || tb.isUndesired) {
      if ("Undesired/Scam" in categoryCount) {
        categoryCount["Undesired/Scam"]++;
      } else {
        categoryCount["Undesired/Scam"] = 1;
      }
    }
  }
  return categoryCount;
};

export function saveToFile(filePath: string, data: string) {
  const completeFilePath = path.join(
    __dirname,
    `../../logs/workspaces/`,
    filePath,
  );
  createFolderIfNotExists(completeFilePath);
  fs.writeFileSync(completeFilePath, data);
}

export async function getWorkspaceAISummary(workspaceSummary: string): Promise<{
  businessActivity: string;
  purpose: string;
  workspaceLevel: string;
  engagementLevel: string;
  workspaceTimeline: string;
  churnRisk?: string;
  recommendations?: string;
  churnReason?: string;
  outreachEmail?: string;
  usage: AiUsage;
}> {
  const {
    object: {
      businessActivity,
      purpose,
      workspaceLevel,
      engagementLevel,
      workspaceTimeline,
      churnRisk,
      recommendations,
      churnReason,
      outreachEmail,
    },
    usage,
  } = await generateObject({
    model: openai("gpt-5"),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
    schema: zodToSchema(
      z.object({
        businessActivity: z.string(),
        purpose: z.string(),
        workspaceLevel: z.string(),
        engagementLevel: z.string(),
        workspaceTimeline: z.string(),
        churnRisk: z.string().nullable(),
        recommendations: z.string().nullable(),
        churnReason: z.string().nullable(),
        outreachEmail: z.string().nullable(),
      }),
    ),
    system: workspaceSummarySystemPrompt,
    messages: [
      {
        role: "user",
        content: workspaceSummary,
      },
    ],
  });

  const usageWithDetails = usage as typeof usage & {
    inputTokenDetails?: { cacheReadTokens?: number };
  };

  const result: {
    businessActivity: string;
    purpose: string;
    workspaceLevel: string;
    engagementLevel: string;
    workspaceTimeline: string;
    churnRisk?: string;
    recommendations?: string;
    churnReason?: string;
    outreachEmail?: string;
    usage: AiUsage;
  } = {
    businessActivity,
    purpose,
    workspaceLevel,
    engagementLevel,
    workspaceTimeline,
    usage: {
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      cost: calculateCost("gpt-5", usage.promptTokens, usage.completionTokens, {
        cachedTokens: usageWithDetails.inputTokenDetails?.cacheReadTokens,
      }),
    },
  };

  if (churnRisk !== null) result.churnRisk = churnRisk;
  if (recommendations !== null) result.recommendations = recommendations;
  if (churnReason !== null) result.churnReason = churnReason;
  if (outreachEmail !== null) result.outreachEmail = outreachEmail;

  return result;
}

export function toReadableFormat(summary: WorkspaceSummaryType) {
  // Workspace basic info
  let output = `# Workspace Summary: ${summary.workspace.name} (${summary.workspace.id})\n\n`;
  output += `**Created At:** ${summary.workspace.createdAt}\n`;
  output += `**Plan:** ${summary.workspace.plan}\n`;
  output += `**Country:** ${
    summary.subscription.countryEmoji || "Not available"
  }\n\n`;
  // Workspace AI summary
  if (summary.aiAnalysis) {
    output += `## 🧠 AI Analysis\n\n`;
    output += `- **Business Activity:** ${summary.aiAnalysis.businessActivity}\n`;
    output += `- **Purpose:** ${summary.aiAnalysis.purpose}\n`;
    output += `- **Workspace Level:** ${summary.aiAnalysis.workspaceLevel}\n`;
    output += `- **Engagement Level:** ${summary.aiAnalysis.engagementLevel}\n`;
    output += `- **Workspace Timeline:**\n`;
    const timelineLines =
      summary.aiAnalysis.workspaceTimeline?.split("\n") || [];
    timelineLines.forEach((line) => {
      output += `  ${line.trim()}\n`;
    });
    output += `- **Typebot categories:**\n`;
    Object.entries(summary.typebots.categoryCount).forEach(
      ([category, count]) => {
        output += `  - **${category}:** ${count}\n`;
      },
    );
    // if churn, print churn reason and outreach email
    if (summary.aiAnalysis.churnReason) {
      output += `- **Churn Reason:** ${summary.aiAnalysis.churnReason}\n`;
      output += `- **Outreach Email:**\n\n`;
      output += `\`\`\`plaintext\n${summary.aiAnalysis.outreachEmail}\n\`\`\`\n\n`;
    } else if (summary.aiAnalysis.churnRisk) {
      // if no churn, print churn risk and recommendations
      output += `- **Churn Risk:** ${summary.aiAnalysis.churnRisk}\n`;
      const recLines = summary.aiAnalysis.recommendations?.split("\n") || [];
      output += `- **Recommendations:**\n`;
      recLines.forEach((line) => {
        output += `  ${line.trim()}\n`;
      });
    }
    output += `\n`;
  }
  output += `\n`;
  // User journeys
  output += `## 👨‍💻 User Journeys\n\n`;
  for (const journey of summary.userJourneys) {
    output += `### User: ${journey.email}\n\n`;
    output += `${journey.summary}\n\n`;
  }
  // Members
  output += `## 👥 Members (${summary.members.totalMembers})\n\n`;
  for (const member of summary.members.list) {
    output += `- **Email:** ${member.email} | **Role:** ${member.role} | **User ID:** ${member.userId}\n`;
  }
  output += `\n`;
  // Subscriptions
  output += `## 🛒 Subscriptions (${summary.subscription.totalSubscriptions})\n\n`;
  output += `- **Stripe Customer ID:** ${summary.subscription.stripeId}\n`;
  output += `- **Total Paid:** ${summary.subscription.totalPaid}\n\n`;

  for (const sub of summary.subscription.list) {
    output += `- **Subscription ID:** ${sub.subscriptionId}\n`;
    output += `  - **Start Date:** ${sub.startDate}\n`;
    output += `  - **Status:** ${sub.status}\n`;
    output += `  - **Current Period End:** ${sub.currentPeriodEnd}\n`;
    if (sub.cancelAtPeriodEnd) {
      output += `  - **Cancel At Period End:** Yes\n`;
    }
    if (sub.canceledAt) {
      output += `  - **Canceled At:** ${sub.canceledAt}\n`;
      output += `  - **Cancellation Reason:** ${sub.cancellationReason}\n`;
      output += `  - **Cancellation Comment:** ${sub.cancellationComment}\n`;
    }
    output += `  - **Total Paid:** ${sub.totalPaid}\n\n`;
  }
  // Typebots
  output += `## 🤖 Typebots (${summary.typebots.totalTypebots})\n\n`;
  for (const tb of summary.typebots.list) {
    output += `- **Name:** ${tb.name} | **ID:** ${tb.id} | **Created At:** ${tb.createdAt} | **Total Results:** ${tb.totalResults}\n`;
    if (tb.summary) {
      output += `  - **Unique Block Types:** ${tb.uniqueBlockTypes?.join(", ")}\n`;
      output += `  - **Summary:** ${tb.summary}\n`;
      output += `  - **Category:** ${tb.category}\n`;
      if (tb.category === "Other") {
        output += `  - **Other Category:** ${tb.otherCategory}\n`;
      }
      if (tb.isScam === true) {
        output += `  - **Is Scam:** 🚨 ${tb.isScam}\n`;
      }
      if (tb.isUndesired === true) {
        output += `  - **Is Undesired:** 🚫 ${tb.isUndesired}\n`;
      }
      if (tb.reason) {
        output += `  - **Reason:** ${tb.reason}\n`;
      }
    }
  }
  // Last events
  output += `\n## 📆 Last occurrence of events\n\n`;
  for (const [event, date] of Object.entries(summary.lastEvents)) {
    output += `- **${event}:** ${date}\n`;
  }
  return output;
}

export async function buildWorkspaceSummaryObject(
  workspaceId: string,
): Promise<WorkspaceSummaryType | null> {
  console.log(" ✓ Fetching prisma workspace...");
  const workspace = await getPrismaWorkspace(workspaceId);

  if (!workspace) {
    console.error(`❌ Workspace not found: ${workspaceId}`);
    return null;
  }

  // Stripe
  console.log(" ✓ Fetching subscriptions from Stripe...");
  const subscription: WorkspaceSubscriptionSummary = workspace.stripeId
    ? await getCustomerChurnSummary(workspace.stripeId)
    : {
        stripeId: null,
        totalSubscriptions: 0,
        totalPaid: "$0.00",
        countryEmoji: "",
        list: [],
      };

  // Members
  console.log(` ✓ Fetching members (${workspace.members.length} member(s))...`);
  const membersList: WorkspaceMemberSummary[] = workspace.members.map(
    (member) => ({
      email: member.user.email,
      role: member.role,
      userId: member.user.id,
    }),
  );

  // User journeys for ADMIN members
  console.log(" ✓ Analyzing user journeys for admin members...");
  const userJourneyResults = await Promise.all(
    membersList
      .filter((m) => m.role === "ADMIN")
      .map(async (m) => {
        const { summary, usage } = await getUserJourney(m.userId, workspaceId);
        return { email: m.email, summary, usage };
      }),
  );
  const userJourneys: WorkspaceUserJourneySummary[] = userJourneyResults.map(
    ({ email, summary }) => ({ email, summary }),
  );
  const userJourneysUsage = userJourneyResults.reduce(
    (acc, { usage }) => addUsage(acc, usage),
    createEmptyUsage(),
  );

  // Typebots
  console.log(
    ` ✓ Analyzing Typebots (${workspace.typebots.length} typebots)...`,
  );
  const { list: typebotsList, usage: typebotsUsage } =
    await getTypebotsSummaries(workspace.typebots, workspaceId);

  // Count typebot categories
  const categoryCount = getTypebotsCategoryCounts(typebotsList);

  // Last events
  console.log(" ✓ Fetching last event occurrences...");
  const lastEventsSorted = await getLastEventOccurences(workspaceId);

  const totalUsage = addUsage(userJourneysUsage, typebotsUsage);

  const wsSummary: WorkspaceSummaryType = {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      createdAt: workspace.createdAt.toISOString().split("T")[0],
      plan: workspace.plan,
    },
    subscription,
    members: {
      totalMembers: membersList.length,
      list: membersList,
    },
    typebots: {
      totalTypebots: typebotsList.length,
      categoryCount,
      list: typebotsList,
    },
    lastEvents: lastEventsSorted,
    userJourneys,
    aiUsage: {
      ...totalUsage,
      callCount:
        userJourneyResults.length +
        typebotsList.filter((t) => t.summary).length,
      byFunction: {
        userJourney: {
          ...userJourneysUsage,
          callCount: userJourneyResults.length,
        },
        typebot: {
          ...typebotsUsage,
          callCount: typebotsList.filter((t) => t.summary).length,
        },
      },
    },
  };

  console.log(
    ` ✓ AI Usage: ${totalUsage.totalTokens} tokens ($${totalUsage.cost.toFixed(4)})`,
  );

  return wsSummary;
}

function parseJsonRecord(value: string): Record<string, unknown> {
  const parsed = safeJsonParse(value);
  return isRecord(parsed) ? parsed : {};
}

function safeJsonParse(value: string): unknown {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumberLike(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (normalized === "") return undefined;
  const numberValue = Number(normalized);
  if (Number.isNaN(numberValue)) return undefined;
  return numberValue;
}
