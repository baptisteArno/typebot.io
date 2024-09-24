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
    data: z.object({
      name: z.string().optional(),
      plan: z.nativeEnum(Plan),
    }),
  }),
);

const userCreatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User created"),
    data: z.object({
      email: z.string(),
      name: z.string().optional(),
    }),
  }),
);

const userLoggedInEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User logged in"),
  }),
);

const userUpdatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal("User updated"),
    data: z.object({
      name: z.string().optional(),
      onboardingCategories: z.array(z.string()).optional(),
      referral: z.string().optional(),
      company: z.string().optional(),
    }),
  }),
);

const typebotCreatedEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("Typebot created"),
    data: z.object({
      name: z.string(),
      template: z.string().optional(),
    }),
  }),
);

const publishedTypebotEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal("Typebot published"),
    data: z.object({
      name: z.string(),
      isFirstPublish: z.literal(true).optional(),
    }),
  }),
);

const customDomainAddedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal("Custom domain added"),
    data: z.object({
      domain: z.string(),
    }),
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

export const clientSideEvents = [removedBrandingEventSchema] as const;

export const eventSchema = z.discriminatedUnion("name", [
  workspaceCreatedEventSchema,
  userCreatedEventSchema,
  userLoggedInEventSchema,
  typebotCreatedEventSchema,
  publishedTypebotEventSchema,
  subscriptionUpdatedEventSchema,
  newResultsCollectedEventSchema,
  workspaceLimitReachedEventSchema,
  workspaceAutoQuarantinedEventSchema,
  subscriptionAutoUpdatedEventSchema,
  workspacePastDueEventSchema,
  workspaceNotPastDueEventSchema,
  userUpdatedEventSchema,
  customDomainAddedEventSchema,
  whatsAppCredentialsCreatedEventSchema,
  createdFolderEventSchema,
  publishedFileUploadBlockEventSchema,
  visitedAnalyticsEventSchema,
  ...clientSideEvents,
]);

export const clientSideCreateEventSchema = removedBrandingEventSchema.omit({
  userId: true,
});

export type TelemetryEvent = z.infer<typeof eventSchema>;
