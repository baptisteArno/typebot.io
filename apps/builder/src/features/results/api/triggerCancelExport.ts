import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { inngest } from "@typebot.io/inngest/client";
import { EXPORT_REQUEST_CANCELLED_EVENT_NAME } from "@typebot.io/inngest/functions/exportResults";

export const triggerCancelExport = authenticatedProcedure.handler(
  async ({ context: { user } }) => {
    const event = await inngest.send({
      name: EXPORT_REQUEST_CANCELLED_EVENT_NAME,
      data: {
        userId: user.id,
      },
    });

    return { eventId: event.ids[0] };
  },
);
