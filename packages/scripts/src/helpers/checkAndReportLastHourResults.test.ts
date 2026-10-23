import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  setSystemTime,
} from "bun:test";

mock.module("@typebot.io/env", () => ({
  env: {
    NEXTAUTH_URL: "https://app.typebot.io",
    STRIPE_SECRET_KEY: "sk_test_local",
    STRIPE_STARTER_PRICE_ID: "price_starter",
    STRIPE_STARTER_CHATS_PRICE_ID: "price_starter_chats",
    STRIPE_PRO_PRICE_ID: "price_pro",
    STRIPE_PRO_CHATS_PRICE_ID: "price_pro_chats",
  },
}));

const workspaceFindMany = mock();
const workspaceUpdateMany = mock(
  async (_args: { where: unknown; data: Record<string, unknown> }) => ({
    count: 1,
  }),
);
const resultCount = mock();

mock.module("@typebot.io/prisma/withReadReplica", () => ({
  default: {
    publicTypebot: {
      findMany: async () => [{ typebotId: "typebot-under-attack" }],
    },
    result: {
      findMany: async () => [{ typebotId: "typebot-under-attack" }],
      count: resultCount,
    },
    typebot: { findMany: async () => [{ id: "typebot-under-attack" }] },
    workspace: { findMany: workspaceFindMany, updateMany: workspaceUpdateMany },
  },
}));

const subscriptionsList = mock();
const subscriptionsUpdate = mock(async () => ({}));
const invoicesList = mock();
const createUsageRecord = mock(async () => ({}));

mock.module("stripe", () => ({
  default: class {
    subscriptions = { list: subscriptionsList, update: subscriptionsUpdate };
    invoices = { list: invoicesList };
    subscriptionItems = { createUsageRecord };
  },
}));

const sendBillingCycleResetEmail = mock(async () => {});
const sendBillingCycleResetFailedEmail = mock(async () => {});
const sendUnusualUsagePausedEmail = mock(async () => {});
const trackEvents = mock(async () => {});

mock.module(
  "@typebot.io/emails/transactional/AlmostReachedChatsLimitEmail",
  () => ({ sendAlmostReachedChatsLimitEmail: async () => {} }),
);
mock.module("@typebot.io/emails/transactional/ReachedChatsLimitEmail", () => ({
  sendReachedChatsLimitEmail: async () => {},
}));
mock.module("@typebot.io/emails/transactional/BillingCycleResetEmail", () => ({
  sendBillingCycleResetEmail,
}));
mock.module(
  "@typebot.io/emails/transactional/BillingCycleResetFailedEmail",
  () => ({ sendBillingCycleResetFailedEmail }),
);
mock.module("@typebot.io/emails/transactional/UnusualUsagePausedEmail", () => ({
  sendUnusualUsagePausedEmail,
}));
mock.module("@typebot.io/telemetry/trackEvents", () => ({ trackEvents }));

const { checkAndReportLastHourResults } = await import(
  "./checkAndReportLastHourResults"
);

const toUnixTime = (isoDate: string) => new Date(isoDate).getTime() / 1000;

const subscriptionStartedAt = toUnixTime("2024-05-28T17:19:04.000Z");
const regularPeriodStartedAt = toUnixTime("2026-07-28T17:19:04.000Z");
const billingCycleResetAt = "2026-08-26T06:48:32.000Z";

const regularBillingCycleSubscription = {
  id: "sub_under_attack",
  status: "active",
  created: subscriptionStartedAt,
  start_date: subscriptionStartedAt,
  billing_cycle_anchor: subscriptionStartedAt,
  current_period_start: regularPeriodStartedAt,
  items: {
    data: [
      {
        id: "si_plan",
        price: { id: "price_pro", recurring: { usage_type: "licensed" } },
      },
      {
        id: "si_chats",
        price: { id: "price_pro_chats", recurring: { usage_type: "metered" } },
      },
    ],
  },
};

const firstBillingCycleAfterResetSubscription = {
  ...regularBillingCycleSubscription,
  billing_cycle_anchor: toUnixTime(billingCycleResetAt),
  current_period_start: toUnixTime(billingCycleResetAt),
};

const createPaidInvoice = ({
  billingReason,
  overageCents,
  refundedCents = 0,
}: {
  billingReason: "subscription_cycle" | "subscription_update";
  overageCents: number;
  refundedCents?: number;
}) => ({
  billing_reason: billingReason,
  post_payment_credit_notes_amount: 0,
  charge: { amount_refunded: refundedCents },
  lines: {
    data: [
      { price: { id: "price_pro" }, amount: 8900 },
      { price: { id: "price_pro_chats" }, amount: overageCents },
    ],
  },
});

const regularInvoicesWithoutOverage = [
  createPaidInvoice({ billingReason: "subscription_cycle", overageCents: 0 }),
  createPaidInvoice({ billingReason: "subscription_cycle", overageCents: 0 }),
];

const earlyResetInvoice = createPaidInvoice({
  billingReason: "subscription_update",
  overageCents: 18000,
});

const runHourlyCheck = async ({
  now,
  subscription,
  paidInvoices,
  totalChatsUsed,
  chatsHardLimit = null,
}: {
  now: string;
  subscription: typeof regularBillingCycleSubscription;
  paidInvoices: ReturnType<typeof createPaidInvoice>[];
  totalChatsUsed: number;
  chatsHardLimit?: number | null;
}) => {
  setSystemTime(new Date(now));
  workspaceFindMany.mockResolvedValue([
    {
      id: "workspace-under-attack",
      name: "Acme",
      typebots: [{ id: "typebot-under-attack" }],
      members: [
        {
          role: "ADMIN",
          user: { id: "admin-user", email: "admin@example.com" },
        },
      ],
      additionalStorageIndex: 0,
      customChatsLimit: null,
      customStorageLimit: null,
      plan: "PRO",
      isQuarantined: false,
      chatsLimitFirstEmailSentAt: null,
      chatsLimitSecondEmailSentAt: null,
      stripeId: "cus_under_attack",
      chatsHardLimit,
    },
  ]);
  subscriptionsList.mockResolvedValue({ data: [subscription] });
  invoicesList.mockResolvedValue({ data: paidInvoices });
  resultCount.mockResolvedValue(totalChatsUsed);
  await checkAndReportLastHourResults();
};

const quarantineUpdates = () =>
  workspaceUpdateMany.mock.calls.filter(
    ([args]) => args.data.isQuarantined === true,
  );

describe("checkAndReportLastHourResults suspicious Pro usage", () => {
  beforeEach(() => {
    for (const mockedFunction of [
      workspaceUpdateMany,
      subscriptionsUpdate,
      invoicesList,
      createUsageRecord,
      sendBillingCycleResetEmail,
      sendBillingCycleResetFailedEmail,
      sendUnusualUsagePausedEmail,
      trackEvents,
    ])
      mockedFunction.mockClear();
  });

  afterAll(() => {
    setSystemTime();
  });

  it("resets the billing cycle the first time usage looks suspicious", async () => {
    await runHourlyCheck({
      now: "2026-08-26T06:00:00.000Z",
      subscription: regularBillingCycleSubscription,
      paidInvoices: regularInvoicesWithoutOverage,
      totalChatsUsed: 29982,
    });

    expect(subscriptionsUpdate).toHaveBeenCalledWith("sub_under_attack", {
      billing_cycle_anchor: "now",
      proration_behavior: "create_prorations",
      payment_behavior: "error_if_incomplete",
    });
    expect(sendBillingCycleResetEmail).toHaveBeenCalledTimes(1);
    expect(quarantineUpdates()).toHaveLength(0);
  });

  it("quarantines instead of resetting again when unusual usage continues after an early reset", async () => {
    await runHourlyCheck({
      now: "2026-08-26T12:00:00.000Z",
      subscription: firstBillingCycleAfterResetSubscription,
      paidInvoices: [earlyResetInvoice, ...regularInvoicesWithoutOverage],
      totalChatsUsed: 11000,
    });

    expect(createUsageRecord).toHaveBeenCalledWith(
      "si_chats",
      { quantity: 11000, timestamp: "now" },
      expect.anything(),
    );
    expect(subscriptionsUpdate).not.toHaveBeenCalled();
    expect(quarantineUpdates()).toEqual([
      [
        {
          where: { id: "workspace-under-attack" },
          data: { isQuarantined: true },
        },
      ],
    ]);
    expect(sendUnusualUsagePausedEmail).toHaveBeenCalledWith({
      to: ["admin@example.com"],
      workspaceName: "Acme",
      totalChatsUsed: 11000,
      billingCycleResetAt: new Date(billingCycleResetAt),
    });
    expect(trackEvents).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          name: "Workspace automatically quarantined",
          userId: "admin-user",
          workspaceId: "workspace-under-attack",
          data: {
            reason: "suspicious usage after billing cycle reset",
            totalChatsUsed: 11000,
          },
        },
      ]),
    );
  });

  it("does not trust the overage charged by an early billing cycle reset", async () => {
    await runHourlyCheck({
      now: "2026-08-08T17:19:04.000Z",
      subscription: regularBillingCycleSubscription,
      paidInvoices: [earlyResetInvoice, ...regularInvoicesWithoutOverage],
      totalChatsUsed: 15000,
    });

    expect(subscriptionsUpdate).toHaveBeenCalledTimes(1);
    expect(sendBillingCycleResetEmail).toHaveBeenCalledTimes(1);
  });

  it("does not trust overage that was refunded", async () => {
    await runHourlyCheck({
      now: "2026-08-08T17:19:04.000Z",
      subscription: regularBillingCycleSubscription,
      paidInvoices: [
        createPaidInvoice({
          billingReason: "subscription_cycle",
          overageCents: 525700,
          refundedCents: 525700,
        }),
      ],
      totalChatsUsed: 15000,
    });

    expect(subscriptionsUpdate).toHaveBeenCalledTimes(1);
  });

  it("does not trust a small paid overage for a much larger bill", async () => {
    await runHourlyCheck({
      now: "2026-08-08T17:19:04.000Z",
      subscription: regularBillingCycleSubscription,
      paidInvoices: [
        createPaidInvoice({
          billingReason: "subscription_cycle",
          overageCents: 5000,
        }),
        ...regularInvoicesWithoutOverage,
      ],
      totalChatsUsed: 200000,
    });

    expect(subscriptionsUpdate).toHaveBeenCalledTimes(1);
  });

  it("prices usage above the last chats tier on every chat", async () => {
    await runHourlyCheck({
      now: "2026-08-08T17:19:04.000Z",
      subscription: regularBillingCycleSubscription,
      paidInvoices: [
        createPaidInvoice({
          billingReason: "subscription_cycle",
          overageCents: 100000,
        }),
      ],
      totalChatsUsed: 2000000,
    });

    expect(subscriptionsUpdate).toHaveBeenCalledTimes(1);
  });

  it("keeps trusting stable high usage paid on regular invoices", async () => {
    await runHourlyCheck({
      now: "2026-08-17T17:19:04.000Z",
      subscription: regularBillingCycleSubscription,
      paidInvoices: [
        createPaidInvoice({
          billingReason: "subscription_cycle",
          overageCents: 26000,
        }),
        createPaidInvoice({
          billingReason: "subscription_cycle",
          overageCents: 26000,
        }),
        createPaidInvoice({
          billingReason: "subscription_cycle",
          overageCents: 18000,
        }),
      ],
      totalChatsUsed: 35000,
    });

    expect(subscriptionsUpdate).not.toHaveBeenCalled();
    expect(quarantineUpdates()).toHaveLength(0);
  });

  it("leaves workspaces with a chats hard limit to that limit", async () => {
    await runHourlyCheck({
      now: "2026-08-26T12:00:00.000Z",
      subscription: firstBillingCycleAfterResetSubscription,
      paidInvoices: [earlyResetInvoice, ...regularInvoicesWithoutOverage],
      totalChatsUsed: 15000,
      chatsHardLimit: 20000,
    });

    expect(invoicesList).not.toHaveBeenCalled();
    expect(subscriptionsUpdate).not.toHaveBeenCalled();
    expect(quarantineUpdates()).toHaveLength(0);
  });
});
