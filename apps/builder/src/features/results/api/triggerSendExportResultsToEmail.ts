import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { inngest } from "@typebot.io/inngest/client";
import { SEND_EMAIL_REQUESTED_EVENT_NAME } from "@typebot.io/inngest/functions/exportResults";
import { z } from "@typebot.io/zod";

export const triggerSendExportResultsToEmail = authenticatedProcedure
  .output(
    z.object({
      eventId: z.string(),
    }),
  )
  .handler(async ({ context: { user } }) => {
    const event = await inngest.send({
      name: SEND_EMAIL_REQUESTED_EVENT_NAME,
      data: {
        userId: user.id,
        email: user.email,
      },
    });
    return { eventId: event.ids[0] };
  });
