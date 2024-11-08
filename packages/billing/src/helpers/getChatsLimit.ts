import { Plan } from "@typebot.io/prisma/enum";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { chatsLimits } from "../constants";

export const getChatsLimit = ({
  plan,
  customChatsLimit,
}: Pick<Workspace, "plan"> & {
  customChatsLimit?: Workspace["customChatsLimit"];
}) => {
  if (customChatsLimit) return customChatsLimit;
  if (
    plan === Plan.UNLIMITED ||
    plan === Plan.LIFETIME ||
    plan === Plan.OFFERED ||
    plan === Plan.CUSTOM
  )
    return "inf";
  return chatsLimits[plan];
};
