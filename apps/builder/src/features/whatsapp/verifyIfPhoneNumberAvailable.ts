import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const verifyIfPhoneNumberAvailable = authenticatedProcedure
  .input(z.object({ phoneNumberDisplayName: z.string() }))
  .handler(async ({ input: { phoneNumberDisplayName } }) => {
    const existingWhatsAppCredentials = await prisma.credentials.findFirst({
      where: {
        type: "whatsApp",
        name: phoneNumberDisplayName,
      },
    });

    if (existingWhatsAppCredentials) return { message: "taken" };
    return { message: "available" };
  });
