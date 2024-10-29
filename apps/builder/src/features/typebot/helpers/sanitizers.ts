import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { sessionOnlySetVariableOptions } from "@typebot.io/blocks-logic/setVariable/constants";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { Workspace } from "@typebot.io/workspaces/schemas";

export const sanitizeSettings = (
  settings: Typebot["settings"],
  workspacePlan: Plan,
  mode: "create" | "update",
): Typebot["settings"] => ({
  ...settings,
  publicShare: mode === "create" ? undefined : settings.publicShare,
  general:
    workspacePlan === Plan.FREE || settings.general
      ? {
          ...settings.general,
          isBrandingEnabled:
            workspacePlan === Plan.FREE
              ? true
              : settings.general?.isBrandingEnabled,
        }
      : undefined,
  whatsApp: settings.whatsApp
    ? {
        ...settings.whatsApp,
        isEnabled:
          mode === "create"
            ? false
            : hasProPerks({ plan: workspacePlan })
              ? settings.whatsApp.isEnabled
              : false,
      }
    : undefined,
});

export const sanitizeGroups =
  (workspace: Pick<Workspace, "id" | "plan">) =>
  async (groups: Typebot["groups"]): Promise<Typebot["groups"]> =>
    Promise.all(
      groups.map(async (group) => ({
        ...group,
        blocks: await Promise.all(group.blocks.map(sanitizeBlock(workspace))),
      })),
    ) as Promise<Typebot["groups"]>;

const sanitizeBlock =
  (workspace: Pick<Workspace, "id" | "plan">) =>
  async (block: Block): Promise<Block> => {
    if (!("options" in block) || !block.options) return block;

    switch (block.type) {
      case IntegrationBlockType.EMAIL:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId:
              (await sanitizeCredentialsId(workspace.id)(
                block.options?.credentialsId,
              )) ?? getDefaultEmailCredentialsId(workspace.plan),
          },
        };
      default:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspace.id)(
              block.options?.credentialsId,
            ),
          },
        };
    }
  };

const sanitizeCredentialsId =
  (workspaceId: string) =>
  async (credentialsId?: string): Promise<string | undefined> => {
    if (!credentialsId) return;
    const credentials = await prisma.credentials.findFirst({
      where: {
        id: credentialsId,
        workspaceId,
      },
      select: {
        id: true,
      },
    });
    return credentials?.id;
  };

export const isPublicIdNotAvailable = async (publicId: string) => {
  const typebotWithSameIdCount = await prisma.typebot.count({
    where: {
      publicId,
    },
  });
  return typebotWithSameIdCount > 0;
};

export const isCustomDomainNotAvailable = async ({
  customDomain,
  workspaceId,
}: {
  customDomain: string;
  workspaceId: string;
}) => {
  const domainCount = await prisma.customDomain.count({
    where: {
      workspaceId,
      name: customDomain.split("/")[0],
    },
  });
  if (domainCount === 0) return true;

  const typebotWithSameDomainCount = await prisma.typebot.count({
    where: {
      customDomain,
    },
  });

  return typebotWithSameDomainCount > 0;
};

export const sanitizeFolderId = async ({
  folderId,
  workspaceId,
}: {
  folderId: string | null;
  workspaceId: string;
}) => {
  if (!folderId) return;
  const folderCount = await prisma.dashboardFolder.count({
    where: {
      id: folderId,
      workspaceId,
    },
  });
  return folderCount !== 0 ? folderId : undefined;
};

export const sanitizeCustomDomain = async ({
  customDomain,
  workspaceId,
}: {
  customDomain?: string | null;
  workspaceId: string;
}) => {
  if (!customDomain) return customDomain;
  const domainCount = await prisma.customDomain.count({
    where: {
      name: customDomain?.split("/")[0],
      workspaceId,
    },
  });
  return domainCount === 0 ? null : customDomain;
};

export const sanitizeVariables = ({
  variables,
  groups,
}: Pick<Typebot, "variables" | "groups">): Typebot["variables"] => {
  const blocks = groups
    .flatMap((group) => group.blocks as Block[])
    .filter((b) => isInputBlock(b) || b.type === LogicBlockType.SET_VARIABLE);
  return variables.map((variable) => {
    const isVariableLinkedToInputBlock = blocks.some(
      (block) =>
        isInputBlock(block) && block.options?.variableId === variable.id,
    );
    if (isVariableLinkedToInputBlock)
      return {
        ...variable,
        isSessionVariable: false,
      };
    const isVariableSetToForbiddenResultVar = blocks.some(
      (block) =>
        block.type === LogicBlockType.SET_VARIABLE &&
        block.options?.variableId === variable.id &&
        sessionOnlySetVariableOptions.includes(
          block.options.type as (typeof sessionOnlySetVariableOptions)[number],
        ),
    );
    if (isVariableSetToForbiddenResultVar)
      return {
        ...variable,
        isSessionVariable: true,
      };
    return variable;
  });
};

const getDefaultEmailCredentialsId = (
  workspacePlan: Plan,
): "default" | undefined => {
  if (workspacePlan === Plan.FREE) return;
  return "default";
};
