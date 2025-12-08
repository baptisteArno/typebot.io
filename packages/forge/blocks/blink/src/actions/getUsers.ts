import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { responseDataLabels } from "../constants";

export const getUsers = createAction({
  name: "Get Users",
  auth,
  options: option.object({
    filter: option
      .discriminatedUnion("type", [
        option.object({
          type: option.literal("User ID"),
          userId: option.string,
        }),
        option.object({
          type: option.literal("Employee ID"),
          employeeId: option.string,
        }),
      ])
      .optional()
      .layout({
        accordion: "Filter",
      }),
    responseMapping: option
      .saveResponseArray(
        Object.values(responseDataLabels) as [string, ...string[]],
      )
      .layout({
        accordion: "Save in variables",
      }),
  }),
  getSetVariableIds: (options) =>
    options.responseMapping?.map((v) => v.variableId).filter(isDefined) ?? [],
});
