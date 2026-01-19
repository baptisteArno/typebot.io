import prisma from "@typebot.io/prisma";
import { z } from "zod";

export const verifyIfPhoneNumberAvailableInputSchema = z.object({
  phoneNumberDisplayName: z.string(),
});

export const handleVerifyIfPhoneNumberAvailable = async ({
  input: { phoneNumberDisplayName },
}: {
  input: z.infer<typeof verifyIfPhoneNumberAvailableInputSchema>;
}) => {
  const existingWhatsAppCredentials = await prisma.credentials.findFirst({
    where: {
      type: "whatsApp",
      name: phoneNumberDisplayName,
    },
  });

  if (existingWhatsAppCredentials) return { message: "taken" };
  return { message: "available" };
};
