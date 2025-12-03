import { createActionHandler } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import ky from "ky";
import { queryKnowledgeBase } from "../actions/queryKnowledgeBase";
import { defaultBaseUrl } from "../constants";
import type { RetrieveKnowledgeBaseResponse } from "../types";

export const queryKnowledgeBaseHandler = createActionHandler(
  queryKnowledgeBase,
  {
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
);
