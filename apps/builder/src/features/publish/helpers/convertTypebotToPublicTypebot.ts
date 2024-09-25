import { createId } from "@paralleldrive/cuid2";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";

export const convertTypebotToPublicTypebot = (
  typebot: TypebotV6,
): PublicTypebot => ({
  id: createId(),
  version: typebot.version,
  typebotId: typebot.id,
  groups: typebot.groups,
  events: typebot.events,
  edges: typebot.edges,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  createdAt: new Date(),
  updatedAt: new Date(),
});
