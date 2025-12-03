import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";
import type { ListKnowledgeBasesResponse } from "../types";

export const queryKnowledgeBase = createAction({
  name: "Query Knowledge Base",
  auth,
  fetchers: [
    {
      id: "fetchKnowledgeBases",
      dependencies: [],
      fetch: async ({ credentials: { knowledgeApiKey, apiEndpoint } = {} }) => {
        if (!knowledgeApiKey)
          return {
            data: [],
          };
        const response = await ky
          .get(`${apiEndpoint ?? defaultBaseUrl}/v1/datasets`, {
            headers: { Authorization: `Bearer ${knowledgeApiKey}` },
            searchParams: {
              limit: 100,
            },
          })
          .json<ListKnowledgeBasesResponse>();
        return {
          data: response.data
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            .map(({ id, name }) => ({
              label: name,
              value: id,
            })),
        };
      },
    },
  ],
  options: option.object({
    datasetId: option.string.layout({
      label: "Knowledge Base ID",
      isRequired: true,
      fetcher: "fetchKnowledgeBases",
    }),
    query: option.string.layout({
      label: "Query",
      isRequired: true,
      inputType: "textarea",
    }),
    responseMapping: option
      .saveResponseArray(["Retrieved chunks"] as const)
      .layout({
        accordion: "Save response",
      }),
  }),
  getSetVariableIds: (options) =>
    options.responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
});
