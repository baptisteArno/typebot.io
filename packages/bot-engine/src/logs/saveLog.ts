import prisma from "@typebot.io/prisma";
import { shortenLogDetails } from "./helpers/shortenLogDetails";

type Props = {
  status: "error" | "success" | "info";
  resultId: string | undefined;
  message: string;
  details?: unknown;
};

export const saveLog = ({ status, resultId, message, details }: Props) => {
  if (!resultId || resultId === "undefined") return;
  return prisma.log.create({
    data: {
      resultId,
      status,
      description: message,
      details: shortenLogDetails(JSON.stringify(details)) as string | null,
    },
  });
};
