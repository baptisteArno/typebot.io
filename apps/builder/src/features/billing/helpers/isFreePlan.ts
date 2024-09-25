import { isNotDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import type { Workspace } from "@typebot.io/workspaces/schemas";

export const isFreePlan = (workspace?: Pick<Workspace, "plan">) =>
  isNotDefined(workspace) || workspace?.plan === Plan.FREE;
