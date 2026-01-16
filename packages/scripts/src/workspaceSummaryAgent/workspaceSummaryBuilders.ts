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

const MAX_GROUPS_PER_BOT = 20;
const MAX_BLOCKS_PER_GROUP = 10;
const MAX_BOTS_PER_WORKSPACE = 6;

const createFolderIfNotExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const getUserJourneyAISummary = async (
  eventsJournal: string,
): Promise<string> => {
  const {
    object: { summary },
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

  return summary;
};

const getSimplifiedTypebotObject = (
  typebot: Pick<
    Prisma.Typebot,
    "id" | "name" | "createdAt" | "updatedAt" | "version" | "groups"
  >,
): Record<string, any> => {
  const groups = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  });

  // receives typebot data from DB
  const groupsData = [];

  // count total number of groups and blocks
  const total_groups = groups.length;
  const total_blocks = groups.reduce(
    (acc, group) => acc + group.blocks.length,
    0,
  );
  // collect unique block types
  const unique_block_types = new Set<string>();
  for (const group of groups) {
    for (const block of group.blocks) {
      unique_block_types.add(block.type);
    }
  }
  // build simplified typebot data
  for (const group of groups.slice(0, MAX_GROUPS_PER_BOT)) {
    const blocks = [];
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
    total_groups: total_groups,
    total_blocks: total_blocks,
    unique_block_types: Array.from(unique_block_types),
    groups: groupsData,
  };
};

const getTypebotAISummary = async (
  typebotData: string,
): Promise<Record<string, any>> => {
  const {
    object: { summary, isScam, isUndesired, reason, category, otherCategory },
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

  return {
    summary: summary,
    category: category,
    otherCategory: otherCategory,
    isScam: isScam,
    isUndesired: isUndesired,
    reason: reason,
  };
};

const getEventsJournal = (events: Array<any>) => {
  const journal: string[] = [];
  const ongoing: Record<string, { from: string; to: string; total: number }> =
    {};
  let from_date = "";

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
    const properties = JSON.parse(propertiesString as string);
    const time = timestamp.split("T")[0];

    if (event === "New results collected") {
      let key: string;
      // some events may not have group_0 defined
      if (properties.$group_0 === undefined) {
        key = "unknown";
      } else {
        key = properties.$group_0.slice(0, 7);
      }
      // some events may have total=0, then ignore
      if (properties.total === 0) {
        continue;
      }
      if (key in ongoing) {
        ongoing[key].to = time;
        ongoing[key].total += properties.total;
      } else {
        ongoing[key] = { from: time, to: time, total: properties.total };
      }
    } else {
      flushAllOngoing();
    }
    if (event === "Typebot published") {
      // if previous event in the journal is the same typebot, keep last
      if (
        journal.length > 0 &&
        journal[journal.length - 1].includes("Typebot") &&
        journal[journal.length - 1].includes("published") &&
        journal[journal.length - 1].includes(properties.$group_0.slice(0, 7))
      ) {
        journal.pop();
        if (from_date === time) {
          journal.push(
            `${from_date}: Typebot ${properties.$group_0.slice(0, 7)} published multiple times`,
          );
        } else {
          journal.push(
            `${from_date} to ${time}: Typebot ${properties.$group_0.slice(0, 7)} published multiple times`,
          );
        }
      } else {
        // update from_date in case it's the first of a serie
        from_date = time;
        journal.push(
          `${time}: Typebot ${properties.$group_0.slice(0, 7)} published`,
        );
      }
    }
    if (event === "Workspace created") {
      journal.push(
        `${time}: Workspace ${properties.$group_1.slice(0, 7)} created with ${properties.plan} plan`,
      );
    } else if (event === "$groupidentify") {
      if (properties.$group_type === "typebot") {
        journal.push(
          `${time}: Typebot ${properties.$group_key.slice(0, 7)} created: ${properties.$group_set.name}`,
        );
      }
      if (properties.$group_type === "workspace") {
        journal.push(
          `${time}: Workspace ${properties.$group_key.slice(0, 7)} created`,
        );
      }
    }

    if (event === "Workspace limit reached") {
      journal.push(
        `${time}: Workspace limit reached for ${properties.limitType} (used: ${properties.used}, limit: ${properties.limit})`,
      );
    }

    if (event === "Workspace automatically quarantined") {
      journal.push(
        `${time}: Workspace automatically quarantined because total chats used = ${properties.totalChatsUsed} and chats limit = ${properties.chatsLimit}`,
      );
    }
    if (event === "Subscription updated") {
      let eventString = "";
      eventString += `${time}: Subscription updated to ${properties.plan}`;
      if (properties.prevPlan) {
        eventString += ` (from ${properties.prevPlan})`;
      }
      journal.push(eventString);
    }

    if (event === "Subscription scheduled for cancellation") {
      let eventString = "";
      eventString += `${time}: Subscription scheduled for cancellation`;
      if (properties.plan) {
        eventString += ` (plan ${properties.plan})`;
      }
      journal.push(eventString);
    }

    if (event === "User created") {
      journal.push(
        `${time}: User account created for email:${properties.email} name: ${properties.name}.`,
      );
    }

    const typebotEvents = [
      "File upload block published",
      "Branding removed",
      "Analytics visited",
    ];
    for (const typebotEvent of typebotEvents) {
      if (event === typebotEvent) {
        journal.push(
          `${time}: ${typebotEvent} on typebot ${properties.$group_0.slice(0, 7)}`,
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
        const journal_entry = `${time}: ${simpleEvent}`;
        // check if previous entry is not the same, to avoid redundancy
        if (journal[journal.length - 1] !== journal_entry) {
          journal.push(journal_entry);
        }
      }
    }
  }

  flushAllOngoing();

  const deduplicated_journal = Array.from(new Set(journal));

  return deduplicated_journal;
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

  const last_events: Record<string, string> = {};
  for (const row of result?.results ?? []) {
    const [eventName, ts] = row as [string, string | null];
    if (eventName && typeof ts === "string") {
      last_events[eventName] = ts.split("T")[0];
    }
  }

  // Already ordered by last_ts DESC, but keep your sort to be safe:
  const last_events_sorted = Object.fromEntries(
    Object.entries(last_events).sort(([, a], [, b]) => {
      return new Date(b).getTime() - new Date(a).getTime();
    }),
  );

  return last_events_sorted;
};

const getUserJourney = async (userId: string, workspaceId: string) => {
  const events_query = `SELECT event, timestamp, properties FROM events WHERE distinct_id = '${userId}' ORDER BY timestamp LIMIT 5000`;
  const events_response = await executePostHogQuery(events_query);
  const events_results = events_response.results;
  console.log("   Found ", events_results.length, "events for user", userId);

  const events_journal = getEventsJournal(events_results);
  saveToFile(
    `${workspaceId}/users/${userId}/eventsJournal.txt`,
    events_journal.join("\n"),
  );
  console.log("   Journal length:", events_journal.length);

  const journey_summary = await getUserJourneyAISummary(
    events_journal.join("\n"),
  );

  return journey_summary;
};

const getTypebotResultsCount = async (typebotId: string) => {
  const results_count_query = `SELECT sum(properties.total) FROM events WHERE event = 'New results collected' AND properties.$group_0 = '${typebotId}' `;
  try {
    const results_count_response =
      await executePostHogQuery(results_count_query);
    const total_results = Number(
      results_count_response?.results?.[0]?.[0] ?? 0,
    );
    return total_results;
  } catch (error) {
    console.error("Error fetching results count for typebot:", typebotId);
    console.error(error);
    return null;
  }
};

const getTypebotsSummaries = async (
  typebots_objects: Pick<
    Prisma.Typebot,
    "id" | "name" | "createdAt" | "updatedAt" | "version" | "groups"
  >[],
  workspaceId?: string,
) => {
  // sort typebots by creation date descending
  const sorted_typebots = typebots_objects.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  // get typebot results count from PostHog
  const typebots_list = await Promise.all(
    sorted_typebots.map(async (tb) => ({
      id: tb.id,
      name: tb.name,
      created_at: tb.createdAt.toISOString().split("T")[0],
      total_results: await getTypebotResultsCount(tb.id),
    })),
  );

  // sort typebots by total_results descending
  const top_typebots_ids = typebots_list
    .sort((a, b) => (b.total_results ?? 0) - (a.total_results ?? 0))
    .map((tb) => tb.id)
    .slice(0, MAX_BOTS_PER_WORKSPACE);

  // enhance top typebots with AI summary
  for (const typebot of sorted_typebots) {
    if (!top_typebots_ids.includes(typebot.id)) continue;

    // get typebot simplified object
    const typebot_simplified_json = getSimplifiedTypebotObject(typebot);

    // get ai summary
    const typebot_ai_summary = await getTypebotAISummary(
      JSON.stringify(typebot_simplified_json, null, 2),
    );
    const typebot_full_summary = Object.assign(
      typebot_simplified_json,
      typebot_ai_summary,
    );
    saveToFile(
      `${workspaceId ? workspaceId + "/" : ""}typebots/${typebot.id}/typebotSummary.json`,
      JSON.stringify(typebot_full_summary, null, 2),
    );
    // update typebot in the list
    delete typebot_full_summary.groups; // no need for groups data
    const typebot_index = typebots_list.findIndex((tb) => tb.id === typebot.id);
    Object.assign(typebots_list[typebot_index], typebot_full_summary);
  }
  return typebots_list;
};

const getTypebotsCategoryCounts = (typebots_list: any[]) => {
  const category_count: Record<string, number> = {};
  for (const tb of typebots_list) {
    if (tb.category) {
      if (tb.category in category_count) {
        category_count[tb.category]++;
      } else {
        category_count[tb.category] = 1;
      }
    } else if (tb.isScam || tb.isUndesired) {
      if ("Undesired/Scam" in category_count) {
        category_count["Undesired/Scam"]++;
      } else {
        category_count["Undesired/Scam"] = 1;
      }
    }
  }
  return category_count;
};

export type workspaceSummaryType = {
  workspace: {
    id: string;
    name: string;
    created_at: string;
    plan: string;
  };
  subscription: {
    stripe_id: string | null;
    total_subscriptions: number;
    total_paid: string;
    country_emoji: string;
    list: Array<{
      subscription_id: string;
      country_emoji: string;
      start_date: string;
      status: string;
      current_period_end: string;
      cancel_at_period_end: boolean;
      canceled_at: string | null;
      cancellation_reason: string;
      cancellation_comment: string;
      total_paid: string;
    }>;
  };
  members: {
    total_members: number;
    list: Array<{
      email: string | null;
      role: $Enums.WorkspaceRole;
      user_id: string;
    }>;
  };
  typebots: {
    total_typebots: number;
    category_count: Record<string, number>;
    list: Array<{
      id: string;
      name: string;
      created_at: string;
      total_results: number | null;
      total_groups?: number;
      total_blocks?: number;
      unique_block_types?: string[];
      summary?: string;
      category?: string | null;
      otherCategory?: string | null;
      isScam?: boolean;
      isUndesired?: boolean;
      reason?: string | null;
    }>;
  };
  last_events: Record<string, string>;
  user_journeys: Array<{
    email: string | null;
    summary: string;
  }>;
  ai_analysis?: {
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
  } = {
    businessActivity,
    purpose,
    workspaceLevel,
    engagementLevel,
    workspaceTimeline,
  };

  if (churnRisk !== null) result.churnRisk = churnRisk;
  if (recommendations !== null) result.recommendations = recommendations;
  if (churnReason !== null) result.churnReason = churnReason;
  if (outreachEmail !== null) result.outreachEmail = outreachEmail;

  return result;
}

export function toReadableFormat(summary: workspaceSummaryType) {
  // Workspace basic info
  let output = `# Workspace Summary: ${summary.workspace.name} (${summary.workspace.id})\n\n`;
  output += `**Created At:** ${summary.workspace.created_at}\n`;
  output += `**Plan:** ${summary.workspace.plan}\n`;
  output += `**Country:** ${
    summary.subscription.country_emoji || "Not available"
  }\n\n`;
  // Workspace AI summary
  if (summary.ai_analysis) {
    output += `## 🧠 AI Analysis\n\n`;
    output += `- **Business Activity:** ${summary.ai_analysis.businessActivity}\n`;
    output += `- **Purpose:** ${summary.ai_analysis.purpose}\n`;
    output += `- **Workspace Level:** ${summary.ai_analysis.workspaceLevel}\n`;
    output += `- **Engagement Level:** ${summary.ai_analysis.engagementLevel}\n`;
    output += `- **Workspace Timeline:**\n`;
    const timelineLines =
      summary.ai_analysis.workspaceTimeline?.split("\n") || [];
    timelineLines.forEach((line) => {
      output += `  ${line.trim()}\n`;
    });
    output += `- **Typebot categories:**\n`;
    Object.entries(summary.typebots.category_count).forEach(
      ([category, count]) => {
        output += `  - **${category}:** ${count}\n`;
      },
    );
    // if churn, print churn reason and outreach email
    if (summary.ai_analysis.churnReason) {
      output += `- **Churn Reason:** ${summary.ai_analysis.churnReason}\n`;
      output += `- **Outreach Email:**\n\n`;
      output += `\`\`\`plaintext\n${summary.ai_analysis.outreachEmail}\n\`\`\`\n\n`;
    } else if (summary.ai_analysis.churnRisk) {
      // if no churn, print churn risk and recommendations
      output += `- **Churn Risk:** ${summary.ai_analysis.churnRisk}\n`;
      const recLines = summary.ai_analysis.recommendations?.split("\n") || [];
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
  for (const journey of summary.user_journeys) {
    output += `### User: ${journey.email}\n\n`;
    output += `${journey.summary}\n\n`;
  }
  // Members
  output += `## 👥 Members (${summary.members.total_members})\n\n`;
  for (const member of summary.members.list) {
    output += `- **Email:** ${member.email} | **Role:** ${member.role} | **User ID:** ${member.user_id}\n`;
  }
  output += `\n`;
  // Subscriptions
  output += `## 🛒 Subscriptions (${summary.subscription.total_subscriptions})\n\n`;
  output += `- **Stripe Customer ID:** ${summary.subscription.stripe_id}\n`;
  output += `- **Total Paid:** ${summary.subscription.total_paid}\n\n`;

  for (const sub of summary.subscription.list) {
    output += `- **Subscription ID:** ${sub.subscription_id}\n`;
    output += `  - **Start Date:** ${sub.start_date}\n`;
    output += `  - **Status:** ${sub.status}\n`;
    output += `  - **Current Period End:** ${sub.current_period_end}\n`;
    if (sub.cancel_at_period_end) {
      output += `  - **Cancel At Period End:** Yes\n`;
    }
    if (sub.canceled_at) {
      output += `  - **Canceled At:** ${sub.canceled_at}\n`;
      output += `  - **Cancellation Reason:** ${sub.cancellation_reason}\n`;
      output += `  - **Cancellation Comment:** ${sub.cancellation_comment}\n`;
    }
    output += `  - **Total Paid:** ${sub.total_paid}\n\n`;
  }
  // Typebots
  output += `## 🤖 Typebots (${summary.typebots.total_typebots})\n\n`;
  for (const tb of summary.typebots.list) {
    output += `- **Name:** ${tb.name} | **ID:** ${tb.id} | **Created At:** ${tb.created_at} | **Total Results:** ${tb.total_results}\n`;
    if (tb.summary) {
      output += `  - **Unique Block Types:** ${tb.unique_block_types?.join(", ")}\n`;
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
  for (const [event, date] of Object.entries(summary.last_events)) {
    output += `- **${event}:** ${date}\n`;
  }
  return output;
}

export async function buildWorkspaceSummaryObject(workspaceId: string) {
  console.log(" ✓ Fetching prisma workspace...");
  const workspace = await getPrismaWorkspace(workspaceId);

  if (!workspace) {
    console.error(`❌ Workspace not found: ${workspaceId}`);
    return null;
  }

  // Stripe
  console.log(" ✓ Fetching subscriptions from Stripe...");
  let subscription_object: any = null;
  if (!workspace.stripeId) {
    console.log("   ⨯ No stripe ID for this workspace.");
  } else {
    subscription_object = await getCustomerChurnSummary(workspace.stripeId);
  }

  // Members
  console.log(` ✓ Fetching members (${workspace.members.length} member(s))...`);
  const members_list = workspace.members.map((member) => ({
    email: member.user.email,
    role: member.role,
    user_id: member.user.id,
  }));

  // User journeys for ADMIN members
  console.log(" ✓ Analyzing user journeys for admin members...");
  const user_journeys = await Promise.all(
    members_list
      .filter((m) => m.role === "ADMIN")
      .map(async (m) => ({
        email: m.email,
        summary: await getUserJourney(m.user_id, workspaceId),
      })),
  );

  // Typebots
  console.log(
    ` ✓ Analyzing Typebots (${workspace.typebots.length} typebots)...`,
  );
  const typebots_list = await getTypebotsSummaries(
    workspace.typebots,
    workspaceId,
  );

  // Count typebot categories
  const category_count = getTypebotsCategoryCounts(typebots_list);

  // Last events
  console.log(" ✓ Fetching last event occurrences...");
  const last_events_sorted = await getLastEventOccurences(workspaceId);

  const wsSummary = {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      created_at: workspace.createdAt.toISOString().split("T")[0],
      plan: workspace.plan,
    },
    subscription: subscription_object,
    members: {
      total_members: members_list.length,
      list: members_list,
    },
    typebots: {
      total_typebots: typebots_list.length,
      category_count: category_count,
      list: typebots_list,
    },
    last_events: last_events_sorted,

    user_journeys: user_journeys,
  };

  return wsSummary;
}
