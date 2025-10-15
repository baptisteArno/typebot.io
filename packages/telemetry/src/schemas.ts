import { Plan } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";

const userEvent = z.object({
  userId: z.string(),
});

const workspaceEvent = userEvent.merge(
  z.object({
    workspaceId: z.string(),
  }),
);

const typebotEvent = workspaceEvent.merge(
  z.object({
    typebotId: z.string(),
  }),
);

const workspaceCreatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Workspace created"),
  }),
);

const userCreatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User created"),
  }),
);

const userLoggedInEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User logged in"),
  }),
);

const userLoggedOutEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User logged out"),
  }),
);

const userUpdatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User updated"),
  }),
);

const typebotCreatedEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("Typebot created"),
    data: z
      .object({
        template: z.string().optional(),
      })
      .optional(),
  }),
);

const publishedTypebotEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("Typebot published"),
    data: z.object({
      isFirstPublish: z.literal(true).optional(),
    }),
  }),
);

const customDomainAddedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Custom domain added"),
  }),
);

const whatsAppCredentialsCreatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("WhatsApp credentials created"),
  }),
);

const subscriptionUpdatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Subscription updated"),
    data: z.object({
      prevPlan: z.nativeEnum(Plan),
      plan: z.nativeEnum(Plan),
    }),
  }),
);

const subscriptionAutoUpdatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Subscription automatically updated"),
    data: z.object({
      plan: z.nativeEnum(Plan),
    }),
  }),
);

const subscriptionScheduledForCancellationEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Subscription scheduled for cancellation"),
    data: z.object({
      plan: z.enum([Plan.STARTER, Plan.PRO]),
    }),
  }),
);

const removedCancellationEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Subscription cancellation removed"),
    data: z.object({
      plan: z.enum([Plan.STARTER, Plan.PRO]),
    }),
  }),
);

const newResultsCollectedEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("New results collected"),
    data: z.object({
      total: z.number(),
      isFirstOfKind: z.literal(true).optional(),
    }),
  }),
);

const workspaceLimitReachedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Workspace limit reached"),
    data: z.object({
      chatsLimit: z.number(),
      totalChatsUsed: z.number(),
    }),
  }),
);

const workspaceAutoQuarantinedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Workspace automatically quarantined"),
    data: z.object({
      chatsLimit: z.number(),
      totalChatsUsed: z.number(),
    }),
  }),
);

const workspaceUnpaidEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Workspace unpaid"),
  }),
);

export const workspacePastDueEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Workspace past due"),
  }),
);

export const workspaceNotPastDueEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Workspace past due status removed"),
  }),
);

export const removedBrandingEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("Branding removed"),
  }),
);

export const createdFolderEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Folder created"),
  }),
);

export const publishedFileUploadBlockEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("File upload block published"),
  }),
);

export const visitedAnalyticsEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("Analytics visited"),
  }),
);

export const limitFirstEmailSentEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Limit warning email sent"),
  }),
);

export const limitSecondEmailSentEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Limit reached email sent"),
  }),
);

const builderEvents = [
  workspaceCreatedEventSchema,
  userCreatedEventSchema,
  userLoggedInEventSchema,
  userLoggedOutEventSchema,
  typebotCreatedEventSchema,
  publishedTypebotEventSchema,
  subscriptionUpdatedEventSchema,
  newResultsCollectedEventSchema,
  workspaceLimitReachedEventSchema,
  workspaceAutoQuarantinedEventSchema,
  subscriptionAutoUpdatedEventSchema,
  workspacePastDueEventSchema,
  workspaceUnpaidEventSchema,
  workspaceNotPastDueEventSchema,
  userUpdatedEventSchema,
  customDomainAddedEventSchema,
  whatsAppCredentialsCreatedEventSchema,
  createdFolderEventSchema,
  publishedFileUploadBlockEventSchema,
  visitedAnalyticsEventSchema,
  limitFirstEmailSentEventSchema,
  limitSecondEmailSentEventSchema,
  removedBrandingEventSchema,
  subscriptionScheduledForCancellationEventSchema,
  removedCancellationEventSchema,
] as const;

const pageViewEventSchema = z.object({
  name: z.literal("$pageview"),
  visitorId: z.string(),
  data: z.object({
    $current_url: z.string(),
    $pathname: z.string(),
    $referrer: z.string().optional(),
    $referring_domain: z.string().optional(),
    $process_person_profile: z.literal(false),
    $session_id: z.string(),
    $utm_source: z.string().optional(),
    $utm_medium: z.string().optional(),
    $utm_campaign: z.string().optional(),
    $device_type: z.enum(["Desktop", "Mobile", "Tablet"]).optional(),
  }),
});

const landingPageEvents = [pageViewEventSchema] as const;

export const eventSchema = z.discriminatedUnion("name", [
  ...builderEvents,
  ...landingPageEvents,
]);

export const clientSideCreateEventSchema = removedBrandingEventSchema.omit({
  userId: true,
});

export type TelemetryEvent = z.infer<typeof eventSchema>;
