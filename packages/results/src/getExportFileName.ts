import { getPublicId } from "@typebot.io/typebot/helpers/getPublicId";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { getTimeFilterFileNameSuffix, type TimeFilter } from "./timeFilter";

export const getExportFileName = (
  typebot: Pick<Typebot, "name" | "id" | "publicId">,
  timeFilter?: TimeFilter,
) => {
  const timeFilterSuffix = getTimeFilterFileNameSuffix(timeFilter);

  return `typebot-${getPublicId(typebot)}${
    timeFilterSuffix ? `-${timeFilterSuffix}` : ""
  }-${new Date().toISOString().slice(0, 10)}.csv`;
};
