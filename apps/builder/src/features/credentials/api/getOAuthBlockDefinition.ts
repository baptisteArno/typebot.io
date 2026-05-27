import { ORPCError } from "@orpc/server";
import type { OAuthDefinition } from "@typebot.io/forge/types";
import {
  type ForgedBlockDefinition,
  forgedBlocks,
} from "@typebot.io/forge-repository/definitions";

export const getOAuthBlockDefinition = (blockType: string) => {
  const blockDefinition = Object.values(forgedBlocks).find(
    (blockDefinition) => blockDefinition.id === blockType,
  );

  if (!blockDefinition || !isOAuthDefinition(blockDefinition.auth))
    throw new ORPCError("BAD_REQUEST", {
      message: "Block is not an OAuth block",
    });

  return { ...blockDefinition, auth: blockDefinition.auth };
};

const isOAuthDefinition = (
  authConfig: ForgedBlockDefinition["auth"] | undefined,
): authConfig is OAuthDefinition => {
  return !!authConfig && authConfig.type === "oauth";
};
