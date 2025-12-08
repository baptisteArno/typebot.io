import { createActionHandler } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import ky from "ky";
import { updateExistingRecord } from "../actions/updateExistingRecord";
import { defaultBaseUrl, defaultLimitForSearch } from "../constants";
import { convertFilterToWhereClause } from "../helpers/convertFilterToWhereClause";
import { linkRelationUpdatesIfAny } from "../helpers/linkRelationUpdatesIfAny";
import { parseRecordsUpdateBody } from "../helpers/parseRecordsUpdateBody";
import { parseSearchParams } from "../helpers/parseSearchParams";
import type { ListTableRecordsResponse } from "../types";

export const updateExistingRecordHandler = createActionHandler(
  updateExistingRecord,
  {
    server: async ({
      credentials: { baseUrl, apiKey },
      options: { tableId, filter, viewId, updates },
      logs,
    }) => {
      if (!apiKey) return logs.add("API key is required");
      if (!updates) return logs.add("At least one update is required");
      if (!tableId) return logs.add("Table ID is required");
      if (!filter?.comparisons || filter.comparisons.length === 0)
        return logs.add("At least one filter is required");
      try {
        const listData = await ky
          .get(
            `${baseUrl ?? defaultBaseUrl}/api/v2/tables/${tableId}/records`,
            {
              headers: {
                "xc-token": apiKey,
              },
              searchParams: parseSearchParams({
                where: convertFilterToWhereClause(filter),
                viewId,
                limit: defaultLimitForSearch,
              }),
            },
          )
          .json<ListTableRecordsResponse>();

        await ky.patch(
          `${baseUrl ?? defaultBaseUrl}/api/v2/tables/${tableId}/records`,
          {
            headers: {
              "xc-token": apiKey,
            },
            json: parseRecordsUpdateBody(
              listData.list.map((item) => item.Id),
              updates,
            ),
          },
        );

        await linkRelationUpdatesIfAny({
          baseUrl,
          apiKey,
          tableId,
          updates,
          recordIdsToUpdate: listData.list.map((item) => item.Id),
        });
      } catch (error) {
        logs.add(
          await parseUnknownError({
            err: error,
            context: "While updating NocoDB existing record",
          }),
        );
      }
    },
  },
);
