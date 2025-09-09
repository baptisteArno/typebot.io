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
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          token,
          identifier: `${user.id}-changeEmail`,
        },
      },
      select: {
        expires: true,
        value: true,
      },
    });

    if (!verificationToken?.value)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Token not found",
      });

    if (verificationToken.expires < new Date()) {
      await deleteToken(token);
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
          email: verificationToken.value,
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

    await deleteToken(token);

    return {
      status: "success",
    };
  });

const deleteToken = (token: string) =>
  prisma.verificationToken.delete({
    where: {
      token,
    },
  });
