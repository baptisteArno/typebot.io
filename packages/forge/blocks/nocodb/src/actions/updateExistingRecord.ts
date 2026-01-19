import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { filterOperators } from "../constants";

export const updateExistingRecord = createAction({
  auth,
  name: "Update Existing Record",
  options: option.object({
    tableId: option.string.meta({
      layout: {
        label: "Table ID",
        isRequired: true,
        moreInfoTooltip:
          "Can be found by clicking on the 3 dots next to the table name.",
      },
    }),
    viewId: option.string.meta({
      layout: {
        label: "View ID",
        moreInfoTooltip:
          "Can be found by clicking on the 3 dots next to the view name.",
      },
    }),
    filter: option
      .filter({
        operators: filterOperators,
        isJoinerHidden: ({ filter }) =>
          !filter?.comparisons || filter.comparisons.length < 2,
      })
      .meta({
        layout: {
          accordion: "Select Records",
        },
      }),
    updates: option
      .array(
        option.object({
          fieldName: option.string.meta({
            layout: {
              label: "Enter a field name",
            },
          }),
          value: option.string.meta({
            layout: {
              placeholder: "Enter a value",
            },
          }),
        }),
      )
      .meta({
        layout: {
          accordion: "Updates",
        },
      }),
  }),
});
