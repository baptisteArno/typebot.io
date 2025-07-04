import { prices } from "@typebot.io/billing/constants";
import { Plan } from "@typebot.io/prisma/enum";
import type { SubscriptionTransitions } from "./getSubscriptionTransitions";

export const formatSubscriptionMessage = (
  subscriptionTransitions: SubscriptionTransitions,
): string => {
  const messages: string[] = [];

  const freeToStarterRevenue =
    subscriptionTransitions.upgrades.freeToStarter * prices[Plan.STARTER];
  const freeToProRevenue =
    subscriptionTransitions.upgrades.freeToPro * prices[Plan.PRO];
  const starterToProRevenue =
    subscriptionTransitions.upgrades.starterToPro *
    (prices[Plan.PRO] - prices[Plan.STARTER]);
  const autoUpgradeRevenue =
    subscriptionTransitions.upgrades.automaticStarterToPro *
    (prices[Plan.PRO] - prices[Plan.STARTER]);
  const downgradeLoss =
    subscriptionTransitions.downgrades.proToStarter *
    (prices[Plan.PRO] - prices[Plan.STARTER]);
  const scheduledForCancellationRevenue =
    subscriptionTransitions.downgrades.scheduledForCancellation.starter *
      prices[Plan.STARTER] +
    subscriptionTransitions.downgrades.scheduledForCancellation.pro *
      prices[Plan.PRO];
  const cancellationRemovedRevenue =
    subscriptionTransitions.downgrades.cancellationRemoved.starter *
      prices[Plan.STARTER] +
    subscriptionTransitions.downgrades.cancellationRemoved.pro *
      prices[Plan.PRO];

  if (subscriptionTransitions.upgrades.freeToStarter > 0) {
    messages.push(
      `💶 FREE → STARTER: ${subscriptionTransitions.upgrades.freeToStarter} (+$${freeToStarterRevenue})`,
    );
  }
  if (subscriptionTransitions.upgrades.freeToPro > 0) {
    messages.push(
      `💶 FREE → PRO: ${subscriptionTransitions.upgrades.freeToPro} (+$${freeToProRevenue})`,
    );
  }

  if (subscriptionTransitions.upgrades.starterToPro > 0) {
    messages.push(
      `💶 STARTER → PRO: ${subscriptionTransitions.upgrades.starterToPro} (+$${starterToProRevenue})`,
    );
  }

  if (subscriptionTransitions.upgrades.automaticStarterToPro > 0) {
    messages.push(
      `⚡ Auto-upgraded: ${subscriptionTransitions.upgrades.automaticStarterToPro} (+$${autoUpgradeRevenue})`,
    );
  }

  const totalCancellationRemoved =
    subscriptionTransitions.downgrades.cancellationRemoved.starter +
    subscriptionTransitions.downgrades.cancellationRemoved.pro;

  if (totalCancellationRemoved > 0) {
    const parts: string[] = [];
    if (subscriptionTransitions.downgrades.cancellationRemoved.starter > 0) {
      parts.push(
        `${subscriptionTransitions.downgrades.cancellationRemoved.starter} STARTER`,
      );
    }
    if (subscriptionTransitions.downgrades.cancellationRemoved.pro > 0) {
      parts.push(
        `${subscriptionTransitions.downgrades.cancellationRemoved.pro} PRO`,
      );
    }
    messages.push(
      `🤝 Cancellation removed: ${parts.join(", ")} (+$${cancellationRemovedRevenue})`,
    );
  }

  if (subscriptionTransitions.downgrades.proToStarter > 0) {
    messages.push(
      `💸 Downgraded: ${subscriptionTransitions.downgrades.proToStarter} (-$${downgradeLoss})`,
    );
  }

  // Scheduled for cancellation (intentions) with 📅
  if (
    subscriptionTransitions.downgrades.scheduledForCancellation.starter > 0 ||
    subscriptionTransitions.downgrades.scheduledForCancellation.pro > 0
  ) {
    messages.push(
      `😢 Scheduled for cancellation: ${subscriptionTransitions.downgrades.scheduledForCancellation.starter + subscriptionTransitions.downgrades.scheduledForCancellation.pro} (-$${scheduledForCancellationRevenue})`,
    );
  }

  const totalGained =
    freeToStarterRevenue +
    freeToProRevenue +
    starterToProRevenue +
    autoUpgradeRevenue +
    cancellationRemovedRevenue;
  const totalLost = downgradeLoss + scheduledForCancellationRevenue;
  const netRevenue = totalGained - totalLost;

  const sign = netRevenue >= 0 ? "+" : "-";
  messages.push(`Net revenue: ${sign}$${Math.abs(netRevenue)}`);

  return messages.join("\n");
};
