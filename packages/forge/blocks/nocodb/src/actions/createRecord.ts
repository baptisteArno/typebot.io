import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";
import { linkRelationUpdatesIfAny } from "../helpers/linkRelationUpdatesIfAny";
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
        if (!apiKey) return logs.add("API key is required");
        if (!tableId) return logs.add("Table ID is required");

        const response = await ky
          .post(
            `${baseUrl ?? defaultBaseUrl}/api/v2/tables/${tableId}/records`,
            {
              headers: {
                "xc-token": apiKey,
              },
              json: parseRecordsCreateBody(fields),
            },
          )
          .json<{ Id: number }>();
        await linkRelationUpdatesIfAny({
          baseUrl,
          apiKey,
          tableId,
          updates: fields,
          recordIdsToUpdate: [response.Id],
        });
      } catch (error) {
        logs.add(
          await parseUnknownError({
            err: error,
            context: "While creating NocoDB record",
          }),
        );
      }
    },
  },
});
