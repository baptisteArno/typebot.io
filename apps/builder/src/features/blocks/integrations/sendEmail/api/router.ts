import {
  authenticatedProcedure,
  publicProcedure,
} from "@typebot.io/config/orpc/builder/middlewares";
import { z } from "zod";
import {
  handleResendWebhook,
  resendWebhookInputSchema,
} from "./handleResendWebhook";
import {
  handleTestSmtpConfig,
  testSmtpConfigInputSchema,
} from "./handleTestSmtpConfig";

export const emailRouter = {
  testSmtpConfig: authenticatedProcedure
    .input(testSmtpConfigInputSchema)
    .handler(handleTestSmtpConfig),
  resendWebhook: publicProcedure
    .route({
      method: "POST",
      path: "/resend/webhook",
      summary: "Handle Resend webhook",
      tags: ["Email"],
      inputStructure: "detailed",
    })
    .input(resendWebhookInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleResendWebhook),
};
