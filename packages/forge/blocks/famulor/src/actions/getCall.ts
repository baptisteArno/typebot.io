import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { getCallResponseItems } from "../constants";

export const getCall = createAction({
  name: "Get call",
  auth,
  options: option.object({
    callId: option.string.meta({
      layout: {
        label: "Call ID",
        isRequired: true,
        placeholder: "Call ID from Start call",
        helperText: "Reads status, transcript and summary for this call.",
      },
    }),
    responseMapping: option.saveResponseArray(getCallResponseItems).meta({
      layout: { accordion: "Save response" },
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((mapping) => mapping.variableId).filter(isDefined) ??
    [],
});
