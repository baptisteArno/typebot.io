import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const updateUserEmail = authenticatedProcedure
  .input(
    z.object({
      token: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input: { token } }) => {
    // Find verification record by searching for identifier prefix
    // The identifier format is: ${userId}-changeEmail-${base64(newEmail)}
    const verifications = await prisma.verification.findMany({
      where: {
        identifier: {
          startsWith: `${user.id}-changeEmail-`,
        },
        value: token,
      },
      select: {
        id: true,
        expiresAt: true,
        identifier: true,
      },
    });

    const verification = verifications[0];

    if (!verification)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Token not found",
      });

    // Extract new email from identifier
    const identifierParts = verification.identifier.split("-changeEmail-");
    if (identifierParts.length !== 2) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid verification identifier format",
      });
    }
    const newEmail = Buffer.from(identifierParts[1], "base64").toString(
      "utf-8",
    );

    if (verification.expiresAt < new Date()) {
      await deleteVerification(verification.id);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Token expired",
      });
    }

    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: newEmail,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already in use",
          });
        }
      }
      throw error;
    }

    await deleteVerification(verification.id);

    return {
      status: "success",
    };
  });

const deleteVerification = (id: string) =>
  prisma.verification.delete({
    where: { id },
  });
