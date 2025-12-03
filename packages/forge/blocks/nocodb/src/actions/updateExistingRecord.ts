import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { filterOperators } from "../constants";

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
});
