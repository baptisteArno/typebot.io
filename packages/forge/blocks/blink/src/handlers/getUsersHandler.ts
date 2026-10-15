import { createActionHandler } from "@typebot.io/forge";
import { ky } from "@typebot.io/lib/ky";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import { HTTPError } from "ky";
import { getUsers } from "../actions/getUsers";
import { baseUrl, responseDataLabels } from "../constants";

const allUsersPageSize = 100;

type BlinkUser = {
  [key in keyof typeof responseDataLabels]: string;
};

export const getUsersHandler = createActionHandler(getUsers, {
  server: async ({ credentials, options, variables, logs }) => {
    if (!credentials?.apiKey)
      return logs.add(
        "Get Users needs Blink credentials created from a Legacy app token.",
      );

    try {
      const filterSearchParams =
        options.filter?.type === "Employee ID" && options.filter.employeeId
          ? { employeeId: options.filter.employeeId }
          : options.filter?.type === "User ID" && options.filter.userId
            ? { userId: options.filter.userId }
            : undefined;

      const users = filterSearchParams
        ? await fetchFilteredUsers({
            apiKey: credentials.apiKey,
            searchParams: filterSearchParams,
          })
        : await fetchAllUsers(credentials.apiKey);

      const variablesToSet = options.responseMapping
        ?.map((mapping) => {
          if (!mapping.variableId) return;

          const itemKey = Object.keys(responseDataLabels).find(
            (key) =>
              responseDataLabels[key as keyof typeof responseDataLabels] ===
              mapping.item,
          ) as keyof typeof responseDataLabels | undefined;

          if (!itemKey) return;

          const list = users.flatMap((user) => user[itemKey]);
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

const fetchFilteredUsers = async ({
  apiKey,
  searchParams,
}: {
  apiKey: string;
  searchParams: { employeeId: string } | { userId: string };
}) => {
  const { data } = await ky
    .get(`${baseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      searchParams,
    })
    .json<{ data: BlinkUser[] }>();
  return data;
};

const fetchAllUsers = async (apiKey: string) => {
  const users: BlinkUser[] = [];
  for (let page = 1; ; page++) {
    const { data, meta } = await ky
      .get(`${baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        searchParams: { page, limit: allUsersPageSize },
        retry: { limit: 3, statusCodes: [429], delay: () => 1000 },
      })
      .json<{ data: BlinkUser[]; meta?: { has_more?: boolean } }>();
    users.push(...data);
    if (!meta?.has_more || data.length === 0) return users;
  }
};
