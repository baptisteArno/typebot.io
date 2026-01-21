import {
  type CustomerSubscriptionSummary,
  getCustomerSubscriptionsList,
} from "./getCustomerSubscriptionsList";

export type CustomerChurnSummary = {
  stripeId: string;
  totalPaid: string;
  totalSubscriptions: number;
  countryEmoji: string;
  list: CustomerSubscriptionSummary[];
};

export async function getCustomerChurnSummary(
  stripeId: string,
): Promise<CustomerChurnSummary> {
  const subscriptionsList = await getCustomerSubscriptionsList(stripeId);
  // order subscriptions by cancelAt date descending
  subscriptionsList.sort((a, b) => {
    const dateA = a.cancelAtPeriodEnd
      ? new Date(a.currentPeriodEnd).getTime()
      : 0;
    const dateB = b.cancelAtPeriodEnd
      ? new Date(b.currentPeriodEnd).getTime()
      : 0;
    return dateB - dateA;
  });
  const totalPaidNumber = subscriptionsList.reduce(
    (acc, sub) =>
      acc + parseFloat(sub.totalPaid.replace("$", "").replace("€", "")),
    0,
  );

  return {
    stripeId,
    totalPaid: `$${totalPaidNumber.toFixed(2)}`,
    totalSubscriptions: subscriptionsList.length,
    countryEmoji: subscriptionsList[0]?.countryEmoji || "",
    list: subscriptionsList,
  };
}
