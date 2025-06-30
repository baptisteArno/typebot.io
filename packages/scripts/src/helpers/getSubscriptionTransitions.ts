import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { Plan } from "@typebot.io/prisma/enum";
import { executePostHogQuery } from "./executePostHogQuery";

export interface SubscriptionTransitions {
  upgrades: {
    freeToStarter: number;
    freeToPro: number;
    starterToPro: number;
    automaticStarterToPro: number;
  };
  downgrades: {
    scheduledForCancellation: {
      starter: number;
      pro: number;
    };
    cancellationRemoved: {
      starter: number;
      pro: number;
    };
    starterToFree: number;
    proToStarter: number;
  };
}

const isPlan = (value: string): value is Plan => {
  return Object.values(Plan).includes(value as Plan);
};

export const getSubscriptionTransitions =
  async (): Promise<SubscriptionTransitions> => {
    const transitions: SubscriptionTransitions = {
      upgrades: {
        freeToStarter: 0,
        freeToPro: 0,
        starterToPro: 0,
        automaticStarterToPro: 0,
      },
      downgrades: {
        scheduledForCancellation: {
          starter: 0,
          pro: 0,
        },
        cancellationRemoved: {
          starter: 0,
          pro: 0,
        },
        starterToFree: 0,
        proToStarter: 0,
      },
    };

    try {
      // Query for "Subscription updated" events (has both prevPlan and plan)
      const subscriptionUpdatedQuery = `
      SELECT 
        JSONExtractString(properties, 'prevPlan') as prevPlan,
        JSONExtractString(properties, 'plan') as plan,
        events.$group_1 as workspace
      FROM events
      WHERE event = 'Subscription updated'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
      GROUP BY events.$group_1, JSONExtractString(properties, 'prevPlan'), JSONExtractString(properties, 'plan')
    `;

      // Query for "Subscription automatically updated" events (only STARTER -> PRO)
      const subscriptionAutoUpdatedQuery = `
      SELECT COUNT(DISTINCT events.$group_1) as count
      FROM events
      WHERE event = 'Subscription automatically updated'
      AND JSONExtractString(properties, 'plan') = 'PRO'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
    `;

      // Query for "Subscription scheduled for cancellation" events
      const subscriptionScheduledForCancellationQuery = `
      SELECT JSONExtractString(properties, 'plan') as plan,
             events.$group_1 as workspace
      FROM events
      WHERE event = 'Subscription scheduled for cancellation'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
      GROUP BY events.$group_1, JSONExtractString(properties, 'plan')
    `;

      // Query for "Subscription cancellation removed" events
      const subscriptionCancellationRemovedQuery = `
      SELECT JSONExtractString(properties, 'plan') as plan,
             events.$group_1 as workspace
      FROM events
      WHERE event = 'Subscription cancellation removed'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
      GROUP BY events.$group_1, JSONExtractString(properties, 'plan')
    `;

      const [
        updatedResponse,
        autoUpdatedResponse,
        scheduledForCancellationResponse,
        cancellationRemovedResponse,
      ] = await Promise.all([
        executePostHogQuery(subscriptionUpdatedQuery),
        executePostHogQuery(subscriptionAutoUpdatedQuery),
        executePostHogQuery(subscriptionScheduledForCancellationQuery),
        executePostHogQuery(subscriptionCancellationRemovedQuery),
      ]);

      // Process "Subscription updated" events
      for (const row of updatedResponse.results) {
        const prevPlan = String(row[0]);
        const currentPlan = String(row[1]);

        if (
          prevPlan &&
          currentPlan &&
          isPlan(prevPlan) &&
          isPlan(currentPlan)
        ) {
          countTransition(transitions, prevPlan as Plan, currentPlan as Plan);
        }
      }

      // Process "Subscription automatically updated" events (only STARTER -> PRO)
      const autoStarterToProCount = autoUpdatedResponse.results?.[0]?.[0] ?? 0;
      transitions.upgrades.automaticStarterToPro =
        typeof autoStarterToProCount === "number" ? autoStarterToProCount : 0;

      // Process "Subscription scheduled for cancellation" events
      for (const row of scheduledForCancellationResponse.results) {
        const plan = String(row[0]);
        if (plan === Plan.STARTER) {
          transitions.downgrades.scheduledForCancellation.starter++;
        } else if (plan === Plan.PRO) {
          transitions.downgrades.scheduledForCancellation.pro++;
        }
      }

      // Process "Subscription cancellation removed" events
      for (const row of cancellationRemovedResponse.results) {
        const plan = String(row[0]);
        if (plan === Plan.STARTER) {
          transitions.downgrades.cancellationRemoved.starter++;
        } else if (plan === Plan.PRO) {
          transitions.downgrades.cancellationRemoved.pro++;
        }
      }

      return transitions;
    } catch (error) {
      console.error(
        "Error fetching subscription transition metrics:",
        await parseUnknownError({ err: error }),
      );
      return transitions;
    }
  };

const countTransition = (
  transitions: SubscriptionTransitions,
  prevPlan: Plan,
  currentPlan: Plan,
): void => {
  // Upgrades
  if (prevPlan === Plan.FREE && currentPlan === Plan.STARTER) {
    transitions.upgrades.freeToStarter++;
  } else if (prevPlan === Plan.FREE && currentPlan === Plan.PRO) {
    transitions.upgrades.freeToPro++;
  } else if (prevPlan === Plan.STARTER && currentPlan === Plan.PRO) {
    transitions.upgrades.starterToPro++;
  }
  // Downgrades
  else if (prevPlan === Plan.STARTER && currentPlan === Plan.FREE) {
    transitions.downgrades.starterToFree++;
  } else if (prevPlan === Plan.PRO && currentPlan === Plan.STARTER) {
    transitions.downgrades.proToStarter++;
  }
};
