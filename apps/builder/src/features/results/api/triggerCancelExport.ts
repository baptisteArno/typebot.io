import { inngest } from "@typebot.io/inngest/client";
import { EXPORT_REQUEST_CANCELLED_EVENT_NAME } from "@typebot.io/inngest/functions/exportResults";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const triggerCancelExport = authenticatedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const event = await inngest.send({
      name: EXPORT_REQUEST_CANCELLED_EVENT_NAME,
      data: {
        userId: user.id,
      },
    });

    return { eventId: event.ids[0] };
  },
);
