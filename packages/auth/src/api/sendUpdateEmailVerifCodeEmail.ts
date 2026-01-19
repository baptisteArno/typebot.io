import { ORPCError } from "@orpc/server";
import { formatEmail } from "@typebot.io/bot-engine/blocks/inputs/email/formatEmail";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { sendVerificationCodeEmail as sendEmail } from "@typebot.io/emails/transactional/VerificationCodeEmail";
import prisma from "@typebot.io/prisma";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { isEmailLegit } from "../helpers/emailValidation";
import oneMinRateLimiter from "../lib/oneMinRateLimiter";

export const sendUpdateEmailVerifCodeEmail = authenticatedProcedure
  .input(
    z.object({
      newEmail: z.string(),
    }),
  )
  .handler(async ({ context: { user }, input: { newEmail } }) => {
    if (oneMinRateLimiter) {
      const { success } = await oneMinRateLimiter.limit(user.id);
      if (!success)
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Too many requests. Please try again later.",
        });
    }
    const formattedNewEmail = formatEmail(newEmail);

    if (!formattedNewEmail || !isEmailLegit(formattedNewEmail))
      throw new ORPCError("BAD_REQUEST", { message: "Invalid email format" });

    const existingUser = await prisma.user.findUnique({
      where: {
        email: formattedNewEmail,
      },
    });

    if (existingUser)
      throw new ORPCError("BAD_REQUEST", { message: "Email already in use" });

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
