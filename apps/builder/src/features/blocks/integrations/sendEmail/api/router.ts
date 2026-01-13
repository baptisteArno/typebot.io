import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import {
  handleTestSmtpConfig,
  testSmtpConfigInputSchema,
} from "./handleTestSmtpConfig";

export const emailRouter = {
  testSmtpConfig: authenticatedProcedure
    .input(testSmtpConfigInputSchema)
    .handler(handleTestSmtpConfig),
};
