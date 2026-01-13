import { inngest } from "@typebot.io/inngest/client";
import { EXPORT_REQUEST_CANCELLED_EVENT_NAME } from "@typebot.io/inngest/functions/exportResults";
import type { User } from "@typebot.io/user/schemas";

export const handleTriggerCancelExport = async ({
  context: { user },
}: {
  context: { user: Pick<User, "id"> };
}) => {
  const event = await inngest.send({
    name: EXPORT_REQUEST_CANCELLED_EVENT_NAME,
    data: {
      userId: user.id,
    },
  });

  return { eventId: event.ids[0] };
};
