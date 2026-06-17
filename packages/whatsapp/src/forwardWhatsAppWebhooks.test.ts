import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildWhatsAppWebhookForwardingPayload,
  forwardWhatsAppWebhooks,
} from "./forwardWhatsAppWebhooks";
import {
  type WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from "./schemas";

const mocks = vi.hoisted(() => ({
  publicTypebotFindMany: vi.fn(),
  safeKyPost: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@typebot.io/lib/ky", () => ({
  safeKy: {
    post: mocks.safeKyPost,
  },
}));

vi.mock("@typebot.io/prisma", () => ({
  default: {
    publicTypebot: {
      findMany: mocks.publicTypebotFindMany,
    },
  },
}));

const rawPayload = {
  object: "whatsapp_business_account",
  extra: { retained: true },
  entry: [
    {
      changes: [
        {
          value: {
            metadata: {
              phone_number_id: "phone-number-id",
            },
            messages: [
              {
                from: "33612345678",
                id: "message-id",
                timestamp: "1710000000",
                type: "text",
                text: {
                  body: "Hello",
                },
              },
            ],
            statuses: [
              {
                id: "failed-status",
                recipient_id: "33612345678",
                status: "failed",
                timestamp: "1710000001",
              },
              {
                id: "errored-status",
                recipient_id: "33612345678",
                status: "sent",
                timestamp: "1710000002",
                errors: [
                  {
                    code: 131047,
                    title: "Re-engagement message",
                  },
                ],
              },
              {
                id: "marketing-status",
                recipient_id: "33612345678",
                status: "delivered",
                timestamp: "1710000003",
                conversation: {
                  id: "marketing-conversation",
                  origin: {
                    type: "marketing",
                  },
                },
              },
              {
                id: "utility-status",
                recipient_id: "33612345678",
                status: "delivered",
                timestamp: "1710000004",
                conversation: {
                  id: "utility-conversation",
                  origin: {
                    type: "utility",
                  },
                },
              },
            ],
          },
        },
        {
          value: {
            metadata: {
              phone_number_id: "phone-number-id",
            },
            statuses: [
              {
                id: "marketing-lite-status",
                recipient_id: "33612345678",
                status: "read",
                timestamp: "1710000005",
                conversation: {
                  id: "marketing-lite-conversation",
                  origin: {
                    type: "marketing_lite",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  ],
} satisfies WhatsAppWebhookRequestBody & {
  object: string;
  extra: { retained: boolean };
};

describe("buildWhatsAppWebhookForwardingPayload", () => {
  it("returns the raw payload when all webhook events are forwarded", () => {
    expect(
      buildWhatsAppWebhookForwardingPayload({
        entry: rawPayload.entry,
        rawPayload,
        eventTypes: ["all"],
      }),
    ).toBe(rawPayload);
  });

  it("keeps only error statuses when error statuses are forwarded", () => {
    expect(
      getForwardedStatusIds(
        buildWhatsAppWebhookForwardingPayload({
          entry: rawPayload.entry,
          rawPayload,
          eventTypes: ["errorStatuses"],
        }),
      ),
    ).toEqual(["failed-status", "errored-status"]);
  });

  it("keeps only marketing statuses when marketing statuses are forwarded", () => {
    expect(
      getForwardedStatusIds(
        buildWhatsAppWebhookForwardingPayload({
          entry: rawPayload.entry,
          rawPayload,
          eventTypes: ["marketingStatuses"],
        }),
      ),
    ).toEqual(["marketing-status", "marketing-lite-status"]);
  });

  it("keeps error and marketing statuses when both types are forwarded", () => {
    expect(
      getForwardedStatusIds(
        buildWhatsAppWebhookForwardingPayload({
          entry: rawPayload.entry,
          rawPayload,
          eventTypes: ["errorStatuses", "marketingStatuses"],
        }),
      ),
    ).toEqual([
      "failed-status",
      "errored-status",
      "marketing-status",
      "marketing-lite-status",
    ]);
  });

  it("keeps failure and marketing statuses for legacy forward URLs", () => {
    expect(
      getForwardedStatusIds(
        buildWhatsAppWebhookForwardingPayload({
          entry: rawPayload.entry,
          rawPayload,
          eventTypes: ["failedAndMarketingStatuses"],
        }),
      ),
    ).toEqual([
      "failed-status",
      "errored-status",
      "marketing-status",
      "marketing-lite-status",
    ]);
  });
});

describe("forwardWhatsAppWebhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.publicTypebotFindMany.mockResolvedValue([]);
    mocks.safeKyPost.mockResolvedValue(undefined);
  });

  it("keeps forwarding legacy URL-only configs as failure and marketing statuses", async () => {
    mocks.publicTypebotFindMany.mockResolvedValue([
      {
        settings: {
          whatsApp: {
            isEnabled: true,
            errorAndMarketingStatusWebhookForwardUrl: "https://example.com",
          },
        },
      },
    ]);

    await forwardWhatsAppWebhooks({
      credentialsId: "credentials-id",
      entry: rawPayload.entry,
      rawPayload,
      workspaceId: "workspace-id",
    });

    expect(mocks.publicTypebotFindMany).toHaveBeenCalledWith({
      where: {
        typebot: {
          workspaceId: "workspace-id",
          whatsAppCredentialsId: "credentials-id",
        },
      },
      select: {
        settings: true,
      },
    });
    expect(mocks.safeKyPost).toHaveBeenCalledTimes(1);
    expect(mocks.safeKyPost).toHaveBeenCalledWith("https://example.com", {
      json: expect.any(Object),
    });
    expect(
      getForwardedStatusIds(mocks.safeKyPost.mock.calls[0]?.[1]?.json),
    ).toEqual([
      "failed-status",
      "errored-status",
      "marketing-status",
      "marketing-lite-status",
    ]);
  });

  it("does not forward when a config is explicitly disabled", async () => {
    mocks.publicTypebotFindMany.mockResolvedValue([
      {
        settings: {
          whatsApp: {
            isEnabled: true,
            errorAndMarketingStatusWebhookForwardUrl: "https://example.com",
            isWebhookForwardingEnabled: false,
          },
        },
      },
    ]);

    await forwardWhatsAppWebhooks({
      credentialsId: "credentials-id",
      entry: rawPayload.entry,
      rawPayload,
      workspaceId: "workspace-id",
    });

    expect(mocks.safeKyPost).not.toHaveBeenCalled();
  });

  it("forwards the raw payload when all events are selected", async () => {
    mocks.publicTypebotFindMany.mockResolvedValue([
      {
        settings: {
          whatsApp: {
            isEnabled: true,
            errorAndMarketingStatusWebhookForwardUrl: "https://example.com",
            isWebhookForwardingEnabled: true,
            webhookForwardingEventTypes: ["all"],
          },
        },
      },
    ]);

    await forwardWhatsAppWebhooks({
      credentialsId: "credentials-id",
      entry: rawPayload.entry,
      rawPayload,
      workspaceId: "workspace-id",
    });

    expect(mocks.safeKyPost).toHaveBeenCalledWith("https://example.com", {
      json: rawPayload,
    });
  });
});

const getForwardedStatusIds = (payload: unknown) =>
  whatsAppWebhookRequestBodySchema
    .parse(payload)
    .entry.flatMap(({ changes }) =>
      changes.flatMap(({ value }) =>
        (value.statuses ?? []).map(({ id }) => id),
      ),
    );
