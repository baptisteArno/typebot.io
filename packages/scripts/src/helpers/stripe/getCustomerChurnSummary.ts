import { getCustomerSubscriptionsList } from "./getCustomerSubscriptionsList";

export async function getCustomerChurnSummary(stripeId: string) {
  const subscriptions_list = await getCustomerSubscriptionsList(stripeId);
  // order subscriptions by cancelet_at date descending
  subscriptions_list.sort((a, b) => {
    const dateA = a.cancel_at_period_end
      ? new Date(a.current_period_end).getTime()
      : 0;
    const dateB = b.cancel_at_period_end
      ? new Date(b.current_period_end).getTime()
      : 0;
    return dateB - dateA;
  });
  const total_paid = subscriptions_list.reduce(
    (acc, sub) => acc + parseFloat(sub.total_paid.replace("$", "")),
    0,
  );

  return {
    stripe_id: stripeId,
    total_paid: `$${total_paid.toFixed(2)}`,
    total_subscriptions: subscriptions_list.length,
    country_emoji: subscriptions_list[0]?.country_emoji || "",
    list: subscriptions_list,
  };
}
