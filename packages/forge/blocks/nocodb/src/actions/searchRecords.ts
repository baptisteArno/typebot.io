import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { filterOperators } from "../constants";

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
});
