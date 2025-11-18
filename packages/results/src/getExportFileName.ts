import { getPublicId } from "@typebot.io/typebot/helpers/getPublicId";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export const getExportFileName = (
  typebot: Pick<Typebot, "name" | "id" | "publicId">,
) => {
  return `typebot-${getPublicId(typebot)}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
};
