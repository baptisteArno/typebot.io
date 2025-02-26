import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";
import type {
  ListKnowledgeBasesResponse,
  RetrieveKnowledgeBaseResponse,
} from "../types";

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
  run: {
    server: async ({
      credentials: { knowledgeApiKey, apiEndpoint },
      options,
      variables,
      logs,
    }) => {
      if (!options.datasetId) return logs.add("Knowledge Base ID is empty");
      if (!options.query) return logs.add("Query is empty");
      if (!options.responseMapping) return logs.add("Missing result variable");
      try {
        const response = await ky
          .post(
            `${apiEndpoint ?? defaultBaseUrl}/v1/datasets/${options.datasetId}/retrieve`,
            {
              headers: { Authorization: `Bearer ${knowledgeApiKey}` },
              json: { query: options.query },
            },
          )
          .json<RetrieveKnowledgeBaseResponse>();
        options.responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;
          if (!mapping.item || mapping.item === "Retrieved chunks")
            variables.set([
              {
                id: mapping.variableId,
                value: response.records.map((r) => r.segment.content),
              },
            ]);
        });
      } catch (err) {
        return logs.add(
          await parseUnknownError({
            err,
            context: "While querying Dify knowledge base",
          }),
        );
      }
    },
  },
});
