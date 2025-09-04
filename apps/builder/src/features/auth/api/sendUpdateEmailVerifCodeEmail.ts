import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { formatEmail } from "@typebot.io/bot-engine/blocks/inputs/email/formatEmail";
import { sendVerificationCodeEmail as sendEmail } from "@typebot.io/emails/transactional/VerificationCodeEmail";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { customAlphabet } from "nanoid";
import { isEmailLegit } from "../helpers/emailValidation";

export const sendUpdateEmailVerifCodeEmail = authenticatedProcedure
  .input(
    z.object({
      newEmail: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input: { newEmail } }) => {
    const formattedNewEmail = formatEmail(newEmail);

    if (!formattedNewEmail || !isEmailLegit(formattedNewEmail))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid email format",
      });

    const existingUser = await prisma.user.findUnique({
      where: {
        email: formattedNewEmail,
      },
    });

    if (existingUser)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email already in use",
      });

    const oneHourLater = new Date(Date.now() + 1000 * 60 * 60);
    const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 4);
    const verificationToken = await prisma.verificationToken.create({
      data: {
        token: `${nanoid(4)}-${nanoid(5)}-${nanoid(4)}-${nanoid(5)}`,
        expires: oneHourLater,
        identifier: `${user.id}-changeEmail`,
        value: formattedNewEmail,
      },
    });

    await sendEmail({
      to: formattedNewEmail,
      code: verificationToken.token,
    });

    return { status: "success" };
  });
