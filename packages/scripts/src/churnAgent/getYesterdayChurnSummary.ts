import { openai } from "@ai-sdk/openai";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isInputBlock,
  isIntegrationBlock,
} from "@typebot.io/blocks-core/helpers";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId, omit } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import prisma from "@typebot.io/prisma/withReadReplica";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import { generateObject } from "ai";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { z } from "zod";
import { executePostHogQuery } from "../helpers/executePostHogQuery";
import {
  mainAgentSystemPrompt,
  typebotSummarizerSystemPrompt,
} from "./constants";
import { getSubscriptionCancellationDetails } from "./getPlanCancellationReason";

const MAX_GROUPS_PER_BOT = 20;
const MAX_BLOCKS_PER_GROUP = 10;
const MAX_BOTS_PER_WORKSPACE = 10;
const MAX_EVENTS_PER_MEMBER = 150;

type SimplifedWorkspaceEvent = {
  event: string | number;
  createdAt: string | number;
  updatedAt?: string | number;
  typebotId?: string;
  total?: number;
  isFirstPublish?: boolean;
  prevPlan?: any;
  plan?: any;
  template?: any;
  chatsLimit?: any;
  totalChatsUsed?: any;
  isFirstOfKind?: boolean;
};

type WorkspaceData = {
  name: string;
  created_at: string;
  members: { id: string; email: string | null; role: string }[];
  totalBots?: number;
  latestBots?: {
    id: string;
    name: string;
  }[];
  bots?: {
    id: string;
    name: string;
  }[];
  latestProductEvents?: string[];
  productEvents?: string[];
};

const churnSummarySchema = z.object({
  snapshot: z
    .string()
    .describe(
      "A small snapshot of the workspace, explaining what it does briefly and what is its main use case.",
    ),
  timeline: z
    .string()
    .describe(
      "A summary of the workspace's journey in a short bullet points list format. Human readable dates.",
    ),
  guessedChurnReason: z
    .string()
    .describe("A guess of why the workspace churned")
    .nullable(),
  outreachEmail: z
    .object({
      recipient: z.string(),
      subject: z.string(),
      content: z.string(),
    })
    .nullable()
    .describe("Email details to be sent to the churning workspace admin"),
});
export type ChurnSummary = z.infer<typeof churnSummarySchema> & {
  workspace: {
    id: string;
    name: string;
    plan: string;
    totalSpent?: string;
    createdAt: string;
    stripeId: string | null;
    countryEmoji?: string;
  };
};

export const getYesterdayChurnSummary = async ({
  onSummaryGenerated,
}: {
  onSummaryGenerated: (summary: ChurnSummary) => Promise<void>;
}): Promise<ChurnSummary[]> => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  console.log(`📊 Starting churn summary analysis for ${yesterday}`);

  // Query for "Subscription updated" events (has both prevPlan and plan)
  const churnedWorkspacesQuery = `
      SELECT events.\`$group_1\` AS workspace_id, max(events.created_at) as max_created_at FROM events
      WHERE event = 'Subscription scheduled for cancellation'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
      GROUP BY workspace_id
      ORDER BY max_created_at DESC
    `;

  console.log("🔍 Querying PostHog for churned workspaces...");
  const churnedWorkspacesResponse = await executePostHogQuery(
    churnedWorkspacesQuery,
  );

  const totalChurnedWorkspaces = churnedWorkspacesResponse.results.length;
  console.log(`📈 Found ${totalChurnedWorkspaces} churned workspaces`);

  if (totalChurnedWorkspaces === 0) {
    console.log("✨ No churned workspaces found for yesterday");
    return [];
  }

  const summaries = [];
  for (const [index, row] of churnedWorkspacesResponse.results.entries()) {
    const workspaceId = row[0] as string;
    console.log(
      `\n🏢 Processing workspace ${index + 1}/${totalChurnedWorkspaces}: ${workspaceId}`,
    );

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        name: true,
        stripeId: true,
        createdAt: true,
        plan: true,
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        typebots: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            version: true,
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            groups: true,
          },
        },
      },
    });

    if (!workspace) {
      console.error(`❌ Workspace not found: ${workspaceId}`);
      continue;
    }

    console.log(`   📝 Workspace: ${workspace.name}`);
    console.log(`   🤖 Typebots: ${workspace.typebots.length}`);

    const cancellationReason = workspace.stripeId
      ? await getSubscriptionCancellationDetails(workspace.stripeId)
      : null;

    if (workspace.stripeId && !cancellationReason) {
      console.log(`   ❌ Cancellation was most likely unscheduled`);
      continue;
    }

    const subscriptionDetails = {
      plan: workspace.plan,
      total_paid: cancellationReason?.totalPaid,
      scheduled_cancellation_date: yesterday,
      cancel_at: cancellationReason?.cancelAt?.toISOString().split("T")[0],
      cancellation_reason: cancellationReason?.feedback
        ? {
            stripeQuickPickReason: cancellationReason.feedback,
            comment: cancellationReason.comment,
          }
        : undefined,
    };

    const workspaceData = await getWorkspaceJsonRepresentation(workspace);

    const userMessage = JSON.stringify(
      {
        subscription: subscriptionDetails,
        ...workspaceData,
      },
      null,
      2,
    );

    const workspacePromptPath = path.join(
      __dirname,
      `../../logs/workspaces/${workspace.id}/prompt.txt`,
    );
    createFolderIfNotExists(workspacePromptPath);
    writeFileSync(workspacePromptPath, userMessage);

    console.log(`   🧠 Generating churn report...`);
    const { object: churnSummary } = await generateObject({
      model: openai("gpt-5"),
      schema: churnSummarySchema,
      system: mainAgentSystemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    console.log(`   ✅ Success`);
    const workspaceSummaryPath = path.join(
      __dirname,
      `../../logs/workspaces/${workspace.id}/summary.txt`,
    );
    createFolderIfNotExists(workspaceSummaryPath);
    writeFileSync(workspaceSummaryPath, JSON.stringify(churnSummary, null, 2));
    const fullSummary = {
      ...churnSummary,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
        totalSpent: subscriptionDetails.total_paid,
        createdAt: workspace.createdAt.toLocaleDateString(),
        stripeId: workspace.stripeId,
        countryEmoji: cancellationReason?.countryEmoji,
      },
    };
    await onSummaryGenerated(fullSummary);
    summaries.push(fullSummary);
  }

  console.log(
    `\n🎉 Churn analysis complete! Generated ${summaries.length} summaries.`,
  );
  return summaries;
};

const getWorkspaceJsonRepresentation = async (
  workspace: Pick<Prisma.Workspace, "id" | "name" | "createdAt"> & {
    typebots: Pick<
      Prisma.Typebot,
      "id" | "name" | "version" | "createdAt" | "updatedAt" | "groups"
    >[];
    members: (Pick<Prisma.MemberInWorkspace, "role"> & {
      user: Pick<Prisma.User, "id" | "email">;
    })[];
  },
) => {
  const workspaceData: WorkspaceData = {
    name: workspace.name,
    created_at: workspace.createdAt.toISOString().split("T")[0],
    members: workspace.members
      .map((member) => ({
        id: member.user.id,
        email: member.user.email,
        role: member.role,
      }))
      .filter((member) => member.role !== "GUEST"),
  };

  const workspaceEvents = [];
  console.log(`   📊 Fetching workspace events...`);
  for (const member of workspace.members.filter(
    (member) => member.role !== "GUEST",
  )) {
    const workspaceEventsQuery = `
      SELECT events.event, events.created_at, events.properties from events
      WHERE events.distinct_id = '${member.user.id}'
      ORDER BY events.created_at DESC
      LIMIT 10000
      `;
    const workspaceEventsResponse =
      await executePostHogQuery(workspaceEventsQuery);
    workspaceEvents.push(...workspaceEventsResponse.results);
  }
  console.log(`   📈 Found ${workspaceEvents.length} events`);

  const eventsWithSimplifiedProperties = workspaceEvents
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .map((event) => {
      const eventProperties = JSON.parse(event[2] as string);

      if (
        event[0] === "$groupidentify" &&
        eventProperties.$group_type === "typebot"
      ) {
        const typebot = workspace.typebots.find(
          byId(eventProperties.$group_key),
        );
        if (typebot) {
          event[0] = "Typebot created";
          eventProperties.$groups = {
            workspace: workspace.id,
            typebot: typebot.id,
          };
        }
      }

      if (event[0] === "Typebot published" && !eventProperties.isFirstPublish)
        event[0] = "Published typebot updated";

      return {
        event: event[0],
        createdAt: event[1],
        userId: eventProperties.distinct_id,
        workspaceId: eventProperties.$groups?.workspace,
        typebotId: eventProperties.$groups?.typebot,
        total: eventProperties.total,
        isFirstPublish: eventProperties.isFirstPublish,
        isFirstOfKind: eventProperties.isFirstOfKind,
        prevPlan: eventProperties.prevPlan,
        plan: eventProperties.plan,
        template: eventProperties.template,
        chatsLimit: eventProperties.chatsLimit,
        totalChatsUsed: eventProperties.totalChatsUsed,
      };
    })
    .filter((event) => {
      if (
        event.workspaceId !== workspace.id ||
        event.event === "$groupidentify"
      ) {
        return false;
      }
      return true;
    })
    .reduce<SimplifedWorkspaceEvent[]>((acc, event) => {
      const lastEvent = acc[acc.length - 1];
      if (lastEvent && lastEvent.typebotId === event.typebotId) {
        if (
          lastEvent.event === "New results collected" &&
          event.event === "New results collected" &&
          !isNaN(event.total)
        ) {
          lastEvent.total += event.total ?? 0;
          lastEvent.createdAt = event.createdAt;
          if (!lastEvent.updatedAt) lastEvent.updatedAt = lastEvent.createdAt;
          return acc;
        } else if (
          lastEvent.event === "Typebot published" &&
          event.event === "Typebot published"
        ) {
          const lastEventDate = new Date(lastEvent.createdAt);
          const eventDate = new Date(event.createdAt);
          if (lastEventDate.toDateString() === eventDate.toDateString()) {
            lastEvent.updatedAt = event.createdAt;
            return acc;
          }
        }
      }
      acc.push(omit(event, "workspaceId"));
      return acc;
    }, []);

  const bots = [];

  if (workspace.typebots.length > MAX_BOTS_PER_WORKSPACE) {
    workspaceData.totalBots = workspace.typebots.length;
  }

  for (const [index, typebot] of workspace.typebots
    .slice(0, MAX_BOTS_PER_WORKSPACE)
    .entries()) {
    console.log(
      `   🤖 Summarizing typebot ${index + 1}/${workspace.typebots.length}: ${typebot.name}`,
    );
    bots.push({
      id: typebot.id,
      name: typebot.name,
      summary: await getTypebotSummary(typebot, workspace.id),
    });
  }

  if (workspace.typebots.length > MAX_BOTS_PER_WORKSPACE) {
    workspaceData.latestBots = bots;
  } else {
    workspaceData.bots = bots;
  }

  const productEvents = [];
  for (const event of eventsWithSimplifiedProperties.slice(
    0,
    MAX_EVENTS_PER_MEMBER,
  )) {
    const { event: name, createdAt, ...rest } = event;
    const eventData: Record<string, any> = {
      name,
      createdAt: new Date(createdAt).toISOString().split("T")[0],
      ...rest,
    };

    productEvents.push(JSON.stringify(eventData));
  }

  if (eventsWithSimplifiedProperties.length > MAX_EVENTS_PER_MEMBER) {
    workspaceData.latestProductEvents = productEvents;
  } else {
    workspaceData.productEvents = productEvents;
  }

  return workspaceData;
};

const getTypebotSummary = async (
  typebot: Pick<
    Prisma.Typebot,
    "id" | "name" | "createdAt" | "updatedAt" | "version" | "groups"
  >,
  workspaceId: string,
): Promise<string> => {
  const groups = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  });

  const groupsData = [];

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

  const promptPath = path.join(
    __dirname,
    `../../logs/workspaces/${workspaceId}/typebots/${typebot.id}/prompt.txt`,
  );
  createFolderIfNotExists(promptPath);
  writeFileSync(
    promptPath,
    JSON.stringify(
      {
        name: typebot.name,
        groups: groupsData,
      },
      null,
      2,
    ),
  );

  const {
    object: { summary },
  } = await generateObject({
    model: openai("gpt-5"),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
    schema: z.object({
      summary: z.string(),
    }),
    system: typebotSummarizerSystemPrompt,
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          {
            name: typebot.name,
            groups: groupsData,
          },
          null,
          2,
        ),
      },
    ],
  });

  const summaryPath = path.join(
    __dirname,
    `../../logs/workspaces/${workspaceId}/typebots/${typebot.id}/summary.txt`,
  );
  createFolderIfNotExists(summaryPath);
  writeFileSync(summaryPath, summary);

  return summary;
};

const createFolderIfNotExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};
