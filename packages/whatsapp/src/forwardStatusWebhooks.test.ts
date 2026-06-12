import { WhatsAppWebhookForwardingScope } from "@typebot.io/settings/constants";
import { describe, expect, it } from "vitest";
import {
  buildWebhookForwardingPayload,
  getForwardingRoutesFromPublicTypebots,
} from "./forwardStatusWebhooks";
import type { WhatsAppWebhookRequestBody } from "./schemas";

describe("getForwardingRoutesFromPublicTypebots", () => {
  it("keeps legacy forwarding URLs on the default scope", () => {
    expect(
      getForwardingRoutesFromPublicTypebots([
        {
          settings: {
            whatsApp: {
              isEnabled: true,
              errorAndMarketingStatusWebhookForwardUrl:
                "https://example.com/legacy-webhook",
            },
          },
        },
      ]),
    ).toEqual([
      {
        url: "https://example.com/legacy-webhook",
        scope: WhatsAppWebhookForwardingScope.ERROR_AND_MARKETING_STATUSES,
      },
    ]);
  });

  it("uses the new forwarding config before the legacy URL", () => {
    expect(
      getForwardingRoutesFromPublicTypebots([
        {
          settings: {
            whatsApp: {
              isEnabled: true,
              errorAndMarketingStatusWebhookForwardUrl:
                "https://example.com/legacy-webhook",
              webhookForwarding: {
                url: "https://example.com/new-webhook",
                scope: WhatsAppWebhookForwardingScope.ALL_EVENTS,
              },
            },
          },
        },
      ]),
    ).toEqual([
      {
        url: "https://example.com/new-webhook",
        scope: WhatsAppWebhookForwardingScope.ALL_EVENTS,
      },
    ]);
  });

  it("defaults new forwarding config without a scope to the legacy behavior", () => {
    expect(
      getForwardingRoutesFromPublicTypebots([
        {
          settings: {
            whatsApp: {
              isEnabled: true,
              webhookForwarding: {
                url: "https://example.com/new-webhook",
              },
            },
          },
        },
      ]),
    ).toEqual([
      {
        url: "https://example.com/new-webhook",
        scope: WhatsAppWebhookForwardingScope.ERROR_AND_MARKETING_STATUSES,
      },
    ]);
  });

  it("ignores disabled WhatsApp typebots even with a legacy forwarding URL", () => {
    expect(
      getForwardingRoutesFromPublicTypebots([
        {
          settings: {
            whatsApp: {
              isEnabled: false,
              errorAndMarketingStatusWebhookForwardUrl:
                "https://example.com/disabled-webhook",
            },
          },
        },
      ]),
    ).toEqual([]);
  });

  it("keeps the most inclusive scope when multiple typebots use the same URL", () => {
    expect(
      getForwardingRoutesFromPublicTypebots([
        {
          settings: {
            whatsApp: {
              isEnabled: true,
              errorAndMarketingStatusWebhookForwardUrl:
                "https://example.com/shared-webhook",
            },
          },
        },
        {
          settings: {
            whatsApp: {
              isEnabled: true,
              webhookForwarding: {
                url: "https://example.com/shared-webhook",
                scope: WhatsAppWebhookForwardingScope.ALL_EVENTS,
              },
            },
          },
        },
      ]),
    ).toEqual([
      {
        url: "https://example.com/shared-webhook",
        scope: WhatsAppWebhookForwardingScope.ALL_EVENTS,
      },
    ]);
  });
});

describe("buildWebhookForwardingPayload", () => {
  it("keeps the legacy marketing and failed status filter", () => {
    const payload = buildWebhookForwardingPayload({
      entry: incomingWebhookEntry,
      webhookRequestBody: incomingWebhookRequestBody,
      scope: WhatsAppWebhookForwardingScope.ERROR_AND_MARKETING_STATUSES,
    });

    expect(payload).toMatchObject({
      entry: [
        {
          changes: [
            {
              value: {
                messages: incomingWebhookEntry[0]?.changes[0]?.value.messages,
                statuses: [{ id: "marketing-status" }, { id: "failed-status" }],
              },
            },
          ],
        },
      ],
    });
  });

  it("can forward all message statuses", () => {
    const payload = buildWebhookForwardingPayload({
      entry: incomingWebhookEntry,
      webhookRequestBody: incomingWebhookRequestBody,
      scope: WhatsAppWebhookForwardingScope.ALL_STATUSES,
    });

    expect(payload).toMatchObject({
      entry: [
        {
          changes: [
            {
              value: {
                messages: incomingWebhookEntry[0]?.changes[0]?.value.messages,
                statuses: [
                  { id: "utility-status" },
                  { id: "marketing-status" },
                  { id: "failed-status" },
                ],
              },
            },
          ],
        },
      ],
    });
  });

  it("can forward the full Meta webhook payload", () => {
    const payload = buildWebhookForwardingPayload({
      entry: incomingWebhookEntry,
      webhookRequestBody: incomingWebhookRequestBody,
      scope: WhatsAppWebhookForwardingScope.ALL_EVENTS,
    });

    expect(payload).toEqual(incomingWebhookRequestBody);
  });
});

const incomingWebhookEntry: WhatsAppWebhookRequestBody["entry"] = [
  {
    changes: [
      {
        value: {
          metadata: {
            phone_number_id: "phone-number-id",
          },
          messages: [
            {
              id: "incoming-message",
              from: "33600000000",
              timestamp: "1700000000",
              type: "text",
              text: {
                body: "Hello",
              },
            },
          ],
          statuses: [
            {
              id: "utility-status",
              recipient_id: "33600000000",
              status: "delivered",
              timestamp: "1700000001",
              conversation: {
                id: "utility-conversation",
                origin: {
                  type: "utility",
                },
              },
            },
            {
              id: "marketing-status",
              recipient_id: "33600000000",
              status: "read",
              timestamp: "1700000002",
              conversation: {
                id: "marketing-conversation",
                origin: {
                  type: "marketing",
                },
              },
            },
            {
              id: "failed-status",
              recipient_id: "33600000000",
              status: "failed",
              timestamp: "1700000003",
              errors: [
                {
                  code: 131026,
                  title: "Message undeliverable",
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

const incomingWebhookRequestBody = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "whatsapp-business-account-id",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              phone_number_id: "phone-number-id",
            },
            messages: [
              {
                id: "incoming-message",
                from: "33600000000",
                timestamp: "1700000000",
                type: "text",
                text: {
                  body: "Hello",
                },
              },
            ],
            statuses: [
              {
                id: "utility-status",
                recipient_id: "33600000000",
                status: "delivered",
                timestamp: "1700000001",
                conversation: {
                  id: "utility-conversation",
                  origin: {
                    type: "utility",
                  },
                },
              },
              {
                id: "marketing-status",
                recipient_id: "33600000000",
                status: "read",
                timestamp: "1700000002",
                conversation: {
                  id: "marketing-conversation",
                  origin: {
                    type: "marketing",
                  },
                },
              },
              {
                id: "failed-status",
                recipient_id: "33600000000",
                status: "failed",
                timestamp: "1700000003",
                errors: [
                  {
                    code: 131026,
                    title: "Message undeliverable",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};
