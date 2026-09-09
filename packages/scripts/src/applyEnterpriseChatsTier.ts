import { enterpriseChatTiers } from "@typebot.io/billing/constants";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import Stripe from "stripe";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const enterpriseProductName = "Enterprise plan";

const applyEnterpriseChatsTier = async () => {
  assertProductionEnvironment();

  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("Missing STRIPE_SECRET_KEY env variable");

  const workspaceId = await getRequiredInput({
    message: "Workspace ID?",
    name: "workspace-id",
  });
  const tierLookupKey = await getRequiredInput({
    message: `Tier? (${enterpriseChatTiers.map((tier) => tier.lookupKey).join(", ")})`,
    name: "tier",
    validate: (value) =>
      enterpriseChatTiers.some((tier) => tier.lookupKey === value)
        ? undefined
        : `Expected one of ${enterpriseChatTiers.map((tier) => tier.lookupKey).join(", ")}`,
  });
  const tier = enterpriseChatTiers.find(
    (tier) => tier.lookupKey === tierLookupKey,
  );
  if (!tier) throw new Error(`Unknown tier ${tierLookupKey}`);

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: { name: true, plan: true, stripeId: true },
  });
  if (!workspace?.stripeId)
    throw new Error("Workspace not found or not linked to a Stripe customer");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const subscription = (
    await stripe.subscriptions.list({
      customer: workspace.stripeId,
      status: "active",
    })
  ).data
    .sort((a, b) => a.created - b.created)
    .at(0);
  if (!subscription) throw new Error("No active subscription found");
  if (subscription.cancel_at_period_end || subscription.cancel_at)
    throw new Error(
      "The subscription has a pending cancellation. Remove it in Stripe before applying an enterprise tier.",
    );

  const meteredItem = subscription.items.data.find(
    (item) => item.price.recurring?.usage_type === "metered",
  );
  if (!meteredItem)
    throw new Error("No metered chats item found on the subscription");
  const licensedItems = subscription.items.data.filter(
    (item) => item.id !== meteredItem.id,
  );

  const existingPrice = (
    await stripe.prices.list({ lookup_keys: [tier.lookupKey], active: true })
  ).data.at(0);

  if (
    !(await confirmAction({
      message: `Move workspace "${workspace.name}" (${workspace.plan}) to ${tier.nickname} (${existingPrice ? existingPrice.id : "Stripe price will be created"})? This removes ${licensedItems.length} licensed item(s) and keeps chats usage on ${meteredItem.id}, without proration.`,
    }))
  )
    return;

  const price =
    existingPrice ?? (await createEnterprisePrice(tier, { stripe }));

  await stripe.subscriptions.update(subscription.id, {
    items: [
      { id: meteredItem.id, price: price.id, clear_usage: false },
      ...licensedItems.map((item) => ({ id: item.id, deleted: true })),
    ],
    proration_behavior: "none",
    metadata: { enterpriseTier: tier.lookupKey },
  });

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: Plan.ENTERPRISE,
      customChatsLimit: tier.includedChats,
    },
  });

  console.log(
    `Workspace ${workspaceId} is now on ${tier.nickname} (${price.id}) with subscription ${subscription.id}`,
  );
};

const createEnterprisePrice = async (
  tier: (typeof enterpriseChatTiers)[number],
  { stripe }: { stripe: Stripe },
) => {
  const product =
    (
      await stripe.products.search({
        query: `name:'${enterpriseProductName}' AND active:'true'`,
      })
    ).data.at(0) ??
    (await stripe.products.create({
      name: enterpriseProductName,
      description:
        "Fixed monthly tier with included chats. Extra chats are billed per chat.",
    }));

  return stripe.prices.create({
    product: product.id,
    nickname: tier.nickname,
    lookup_key: tier.lookupKey,
    currency: "usd",
    billing_scheme: "tiered",
    tiers_mode: "graduated",
    tax_behavior: "exclusive",
    recurring: {
      interval: "month",
      usage_type: "metered",
      aggregate_usage: "last_during_period",
    },
    tiers: [
      { up_to: tier.includedChats, flat_amount: tier.monthlyPriceInCents },
      { up_to: "inf", unit_amount_decimal: tier.overageUnitAmountDecimal },
    ],
  });
};

runScript(applyEnterpriseChatsTier);
