import { isDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import type { Workspace } from "@typebot.io/workspaces/schemas";

export const hasProPerks = (workspace?: Pick<Workspace, "plan">) =>
  isDefined(workspace) &&
  (workspace.plan === Plan.PRO ||
    workspace.plan === Plan.LIFETIME ||
    workspace.plan === Plan.CUSTOM ||
    workspace.plan === Plan.UNLIMITED);
