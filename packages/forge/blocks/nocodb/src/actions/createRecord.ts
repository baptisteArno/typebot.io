import { createAction, option } from "@typebot.io/forge";
import ky, { HTTPError } from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";
import { parseErrorResponse } from "../helpers/parseErrorResponse";
import { parseRecordsCreateBody } from "../helpers/parseRecordCreateBody";

export const createRecord = createAction({
  auth,
  name: "Create Record",
  options: option.object({
    tableId: option.string.layout({
      label: "Table ID",
      isRequired: true,
      helperText: "Identifier of the table to create records in.",
    }),
    fields: option
      .array(
        option.object({
          key: option.string.layout({
            label: "Field",
            isRequired: true,
          }),
          value: option.string.layout({
            label: "Value",
            isRequired: true,
          }),
        }),
      )
      .layout({
        itemLabel: "field",
      }),
  }),
  run: {
    server: async ({
      credentials: { baseUrl, apiKey },
      options: { tableId, fields },
      logs,
    }) => {
      try {
        if (!fields || fields.length === 0) return;
        await ky.post(
          `${baseUrl ?? defaultBaseUrl}/api/v2/tables/${tableId}/records`,
          {
            headers: {
              "xc-token": apiKey,
            },
            json: parseRecordsCreateBody(fields),
          },
        );
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
