import { ORPCError } from "@orpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { createToastORPCError } from "@typebot.io/lib/createToastORPCError";
import { ky } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { formatPhoneNumberDisplayName } from "../formatPhoneNumberDisplayName";

export const getPhoneNumberInputSchema = z.object({
  credentialsId: z.string().optional(),
  systemToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
});

export const handleGetPhoneNumber = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getPhoneNumberInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const credentials = await getCredentials(user, input);
  if (!credentials)
    throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });

  if (credentials.type === "360dialog")
    return {
      name: credentials.phoneNumber,
    };
  try {
    const { display_phone_number } = await ky
      .get(`${env.WHATSAPP_CLOUD_API_URL}/v17.0/${credentials.phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${credentials.systemUserAccessToken}`,
        },
      })
      .json<{ display_phone_number: string }>();

    const formattedPhoneNumber =
      formatPhoneNumberDisplayName(display_phone_number);

    return {
      name: formattedPhoneNumber,
    };
  } catch (err) {
    throw await createToastORPCError(err);
  }
};

const getCredentials = async (
  user: { id: string; email: string },
  input: z.infer<typeof getPhoneNumberInputSchema>,
): Promise<
  | { type: "meta"; systemUserAccessToken: string; phoneNumberId: string }
  | { type: "360dialog"; phoneNumber: string }
  | undefined
> => {
  if (input.systemToken && input.phoneNumberId)
    return {
      type: "meta",
      systemUserAccessToken: input.systemToken,
      phoneNumberId: input.phoneNumberId,
    };
  if (!input.credentialsId) return;
  const credentials = await prisma.credentials.findFirst({
    where: {
      id: input.credentialsId,
      workspace: env.ADMIN_EMAIL?.includes(user.email)
        ? undefined
        : { members: { some: { userId: user.id } } },
    },
  });
  if (!credentials) return;
  const decryptedData = (await decrypt(
    credentials.data,
    credentials.iv,
  )) as WhatsAppCredentials["data"];

  if (!decryptedData.provider || decryptedData.provider === "meta") {
    return {
      type: "meta",
      systemUserAccessToken: decryptedData.systemUserAccessToken,
      phoneNumberId: decryptedData.phoneNumberId,
    };
  }

  if (decryptedData.provider === "360dialog") {
    return {
      type: "360dialog",
      phoneNumber: credentials.name,
    };
  }
};
