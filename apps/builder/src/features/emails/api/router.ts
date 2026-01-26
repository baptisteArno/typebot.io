import { publicProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { z } from "zod";
import {
  handleResubscribeEmail,
  resubscribeEmailInputSchema,
  resubscribeEmailOutputSchema,
} from "./handleResubscribeEmail";
import {
  handleUnsubscribeEmail,
  unsubscribeEmailInputSchema,
} from "./handleUnsubscribeEmail";

export const emailsRouter = {
  unsubscribe: publicProcedure
    .route({
      method: "POST",
      path: "/emails/unsubscribe",
      summary: "Unsubscribe email",
      tags: ["Email"],
      inputStructure: "detailed",
      successStatus: 202,
    })
    .input(unsubscribeEmailInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleUnsubscribeEmail),

  resubscribe: publicProcedure
    .route({
      method: "POST",
      path: "/emails/unsubscribe/resubscribe",
      summary: "Resubscribe email",
      tags: ["Email"],
      inputStructure: "detailed",
    })
    .input(resubscribeEmailInputSchema)
    .output(resubscribeEmailOutputSchema)
    .handler(handleResubscribeEmail),
};
