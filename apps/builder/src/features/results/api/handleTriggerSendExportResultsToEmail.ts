import { inngest } from "@typebot.io/inngest/client";
import { SEND_EMAIL_REQUESTED_EVENT_NAME } from "@typebot.io/inngest/functions/exportResults";
import type { User } from "@typebot.io/user/schemas";

export const handleTriggerSendExportResultsToEmail = async ({
  context: { user },
}: {
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const event = await inngest.send({
    name: SEND_EMAIL_REQUESTED_EVENT_NAME,
    data: {
      userId: user.id,
      email: user.email,
    },
  });
  return { eventId: event.ids[0] };
};
