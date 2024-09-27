import { createAction, option } from "@typebot.io/forge";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import ky, { HTTPError } from "ky";
import { auth } from "../auth";
import {
  defaultBaseUrl,
  defaultLimitForSearch,
  filterOperators,
} from "../constants";
import { convertFilterToWhereClause } from "../helpers/convertFilterToWhereClause";
import { parseErrorResponse } from "../helpers/parseErrorResponse";
import { parseSearchParams } from "../helpers/parseSearchParams";
import type { ListTableRecordsResponse } from "../types";

export const searchRecords = createAction({
  auth,
  name: "Search Records",
  options: option.object({
    tableId: option.string.layout({
      label: "Table ID",
      moreInfoTooltip:
        "Can be found by clicking on the 3 dots next to the table name.",
      isRequired: true,
    }),
    viewId: option.string.layout({
      label: "View ID",
      moreInfoTooltip:
        "Can be found by clicking on the 3 dots next to the view name.",
    }),
    returnType: option.enum(["All", "First", "Last", "Random"]).layout({
      accordion: "Filter",
      defaultValue: "All",
    }),
    filter: option
      .filter({
        operators: filterOperators,
        isJoinerHidden: ({ filter }) =>
          !filter?.comparisons || filter.comparisons.length < 2,
      })
      .layout({
        accordion: "Filter",
      }),
    responseMapping: option
      .array(
        option.object({
          fieldName: option.string.layout({
            label: "Enter a field name",
          }),
          variableId: option.string.layout({
            inputType: "variableDropdown",
          }),
        }),
      )
      .layout({
        accordion: "Response Mapping",
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { baseUrl, apiKey },
      options: { tableId, responseMapping, filter, returnType, viewId },
      variables,
      logs,
    }) => {
      if (!apiKey) return logs.add("API key is required");
      try {
        const data = await ky
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

        let filterIndex: number | undefined = undefined;

        if (returnType && returnType !== "All") {
          const total = data.pageInfo.totalRows;
          if (returnType === "First") {
            filterIndex = 0;
          } else if (returnType === "Last") {
            filterIndex = total - 1;
          } else if (returnType === "Random") {
            filterIndex = Math.floor(Math.random() * total);
          }
        }

        const filteredList =
          isDefined(filterIndex) && data.list[filterIndex]
            ? [data.list[filterIndex]]
            : data.list;

        if (filteredList.length === 0)
          return logs.add({
            status: "info",
            description: `Couldn't find any rows matching the filter`,
            details: JSON.stringify(filter, null, 2),
          });

        responseMapping?.forEach((mapping) => {
          if (!mapping.fieldName || !mapping.variableId) return;
          if (isNotDefined(filteredList[0]![mapping.fieldName])) {
            logs.add(`Field ${mapping.fieldName} does not exist in the table`);
            return;
          }

          const items = filteredList.map(
            (item) => item![mapping.fieldName as string],
          );

          variables.set(
            mapping.variableId,
            items.length === 1 ? items[0] : items,
          );
        });
      } catch (error) {
        if (error instanceof HTTPError)
          return logs.add({
            status: "error",
            description: error.message,
            details: await parseErrorResponse(error.response),
          });
        console.error(error);
      }
    },
  },
});
