import { createActionHandler } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import ky, { HTTPError } from "ky";
import { getUsers } from "../actions/getUsers";
import { baseUrl, responseDataLabels } from "../constants";

export const getUsersHandler = createActionHandler(getUsers, {
  server: async ({ credentials, options, variables, logs }) => {
    if (credentials?.apiKey === undefined)
      return logs.add("No API key provided");

    if (!options.filter) return logs.add("No filter provided");

    try {
      const response = await ky
        .get(`${baseUrl}/user`, {
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
          },
          searchParams:
            options.filter.type === "Employee ID" && options.filter.employeeId
              ? {
                  employeeId: options.filter.employeeId,
                }
              : options.filter.type === "User ID" && options.filter.userId
                ? {
                    userId: options.filter.userId,
                  }
                : undefined,
        })
        .json<{
          data: {
            [key in keyof typeof responseDataLabels]: string;
          }[];
        }>();

      const variablesToSet = options.responseMapping
        ?.map((mapping) => {
          if (!mapping.variableId) return;

          const itemKey = Object.keys(responseDataLabels).find(
            (key) =>
              responseDataLabels[key as keyof typeof responseDataLabels] ===
              mapping.item,
          ) as keyof typeof responseDataLabels | undefined;

          if (!itemKey) return;

          const list = response.data.flatMap((user) => user[itemKey]);
          return {
            id: mapping.variableId,
            value: list.length > 1 ? list : list[0],
          };
        })
        .filter(isDefined);

      if (!variablesToSet) return;

      variables.set(variablesToSet);
    } catch (error) {
      if (error instanceof HTTPError)
        return logs.add(
          await parseUnknownError({
            err: error,
            context: "While searching Blink users",
          }),
        );
      console.error(error);
    }
  },
});
