import { TRPCError } from "@trpc/server";
import { formatEmail } from "@typebot.io/bot-engine/blocks/inputs/email/formatEmail";
import { sendVerificationCodeEmail as sendEmail } from "@typebot.io/emails/transactional/VerificationCodeEmail";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { customAlphabet } from "nanoid";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { isEmailLegit } from "../helpers/emailValidation";
import oneMinRateLimiter from "../lib/oneMinRateLimiter";

export const sendUpdateEmailVerifCodeEmail = authenticatedProcedure
  .input(
    z.object({
      newEmail: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input: { newEmail } }) => {
    if (oneMinRateLimiter) {
      const { success } = await oneMinRateLimiter.limit(user.id);
      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
    }

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
    const tokenValue = `${nanoid(4)}-${nanoid(5)}-${nanoid(4)}-${nanoid(5)}`;
    // Encode new email in identifier since Better Auth uses 'value' for the token
    const identifier = `${user.id}-changeEmail-${Buffer.from(formattedNewEmail).toString("base64")}`;
    await prisma.verification.create({
      data: {
        value: tokenValue,
        expiresAt: oneHourLater,
        identifier,
      },
    });

    await sendEmail({
      to: formattedNewEmail,
      code: tokenValue,
    });

    return { status: "success" };
  });
