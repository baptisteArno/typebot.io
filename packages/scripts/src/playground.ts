import { formatSubscriptionMessage } from "./helpers/formatSubscriptionMessage";
import { getSubscriptionTransitions } from "./helpers/getSubscriptionTransitions";

const executePlayground = async () => {
  const result = await getSubscriptionTransitions();
  console.log(formatSubscriptionMessage(result));
};

executePlayground();
