import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import ky from "ky";
import { auth } from "../auth";
import {
  defaultBaseUrl,
  defaultLimitForSearch,
  filterOperators,
} from "../constants";
import { convertFilterToWhereClause } from "../helpers/convertFilterToWhereClause";
import { linkRelationUpdatesIfAny } from "../helpers/linkRelationUpdatesIfAny";
import { parseRecordsUpdateBody } from "../helpers/parseRecordsUpdateBody";
import { parseSearchParams } from "../helpers/parseSearchParams";
import type { ListTableRecordsResponse } from "../types";

export const updateExistingRecord = createAction({
  auth,
  name: "Update Existing Record",
  options: option.object({
    tableId: option.string.layout({
      label: "Table ID",
      isRequired: true,
      moreInfoTooltip:
        "Can be found by clicking on the 3 dots next to the table name.",
    }),
    viewId: option.string.layout({
      label: "View ID",
      moreInfoTooltip:
        "Can be found by clicking on the 3 dots next to the view name.",
    }),
    filter: option
      .filter({
        operators: filterOperators,
        isJoinerHidden: ({ filter }) =>
          !filter?.comparisons || filter.comparisons.length < 2,
      })
      .layout({
        accordion: "Select Records",
      }),
    updates: option
      .array(
        option.object({
          fieldName: option.string.layout({
            label: "Enter a field name",
          }),
          value: option.string.layout({
            placeholder: "Enter a value",
          }),
        }),
      )
      .layout({
        accordion: "Updates",
      }),
  }),
  run: {
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
});
