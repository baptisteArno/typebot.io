import { Plan } from "@typebot.io/prisma/enum";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { chatsLimits } from "../constants";

export const getChatsLimit = ({
  plan,
  customChatsLimit,
}: Pick<Workspace, "plan"> & {
  customChatsLimit?: Workspace["customChatsLimit"];
}) => {
  if (
    plan === Plan.UNLIMITED ||
    plan === Plan.LIFETIME ||
    plan === Plan.OFFERED
  )
    return "inf";
  if (plan === Plan.CUSTOM) return customChatsLimit ?? "inf";
  return chatsLimits[plan];
};
