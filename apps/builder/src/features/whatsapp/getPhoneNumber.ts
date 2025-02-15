import { authenticatedProcedure } from "@/helpers/server/trpc";
import { ClientToastError } from "@/lib/ClientToastError";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import ky from "ky";

const inputSchema = z.object({
  credentialsId: z.string().optional(),
  systemToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
});

export const getPhoneNumber = authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input, ctx: { user } }) => {
    const credentials = await getCredentials(user.id, input);
    if (!credentials)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });
    try {
      const { display_phone_number } = await ky
        .get(
          `${env.WHATSAPP_CLOUD_API_URL}/v17.0/${credentials.phoneNumberId}`,
          {
            headers: {
              Authorization: `Bearer ${credentials.systemUserAccessToken}`,
            },
          },
        )
        .json<{ display_phone_number: string }>();

      const formattedPhoneNumber = `${
        display_phone_number.startsWith("+") ? "" : "+"
      }${display_phone_number.replace(/[\s-]/g, "")}`;

      return {
        id: credentials.phoneNumberId,
        name: formattedPhoneNumber,
      };
    } catch (err) {
      throw await ClientToastError.fromUnkownError(err);
    }
  });

const getCredentials = async (
  userId: string,
  input: z.infer<typeof inputSchema>,
): Promise<WhatsAppCredentials["data"] | undefined> => {
  if (input.systemToken && input.phoneNumberId)
    return {
      systemUserAccessToken: input.systemToken,
      phoneNumberId: input.phoneNumberId,
    };
  if (!input.credentialsId) return;
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: input.credentialsId,
      workspace: { members: { some: { userId } } },
    },
  });
  if (!credentials) return;
  return (await decrypt(
    credentials.data,
    credentials.iv,
  )) as WhatsAppCredentials["data"];
};
