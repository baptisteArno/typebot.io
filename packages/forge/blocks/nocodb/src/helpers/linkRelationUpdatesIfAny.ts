import { isDefined } from "@typebot.io/lib/utils";
import ky from "ky";
import { defaultBaseUrl } from "../constants";
import type { TableMetaResponse } from "../types";

type Params = {
  baseUrl: string | undefined;
  apiKey: string;
  tableId: string;
  updates: { fieldName?: string; value?: string }[];
  recordIdsToUpdate: number[];
};
export const linkRelationUpdatesIfAny = async ({
  baseUrl,
  apiKey,
  tableId,
  updates,
  recordIdsToUpdate,
}: Params) => {
  const tableMeta = await ky
    .get(`${baseUrl ?? defaultBaseUrl}/api/v2/meta/tables/${tableId}`, {
      headers: {
        "xc-token": apiKey,
      },
    })
    .json<TableMetaResponse>();

  const relationUpdates = tableMeta.columns
    .filter((col) => col.uidt === "LinkToAnotherRecord")
    .map((col) => ({
      id: col.id,
      value: transformValToArray(
        updates.find((update) => update.fieldName === col.title)?.value,
      ),
    }))
    .filter((update) => isDefined(update.value));

  for (const relationUpdate of relationUpdates) {
    for (const record of recordIdsToUpdate) {
      console.log(relationUpdate);
      await ky
        .post(
          `${baseUrl ?? defaultBaseUrl}/api/v2/tables/${tableId}/links/${relationUpdate.id}/records/${record}`,
          {
            headers: {
              "xc-token": apiKey,
            },
            json: relationUpdate.value!.map((id) => ({ Id: id })),
          },
        )
        .json();
    }
  }
};

const transformValToArray = (val: string | undefined): string[] | undefined => {
  if (!val) return;
  if (val.startsWith("[") && val.endsWith("]")) {
    try {
      return JSON.parse(val);
    } catch (error) {
      console.error("Failed to parse JSON value:", val, error);
      return [val]; // Fallback to treating as single value
    }
  }
  return [val];
};
