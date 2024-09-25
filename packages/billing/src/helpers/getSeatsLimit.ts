import { Plan } from "@typebot.io/prisma/enum";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { seatsLimits } from "../constants";

export const getSeatsLimit = ({
  plan,
  customSeatsLimit,
}: Pick<Workspace, "plan" | "customSeatsLimit">) => {
  if (plan === Plan.UNLIMITED) return "inf";
  if (plan === Plan.CUSTOM) return customSeatsLimit ? customSeatsLimit : "inf";
  return seatsLimits[plan];
};
