import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";

export const knowledgeBasesFetcher = {
  id: "fetchKnowledgeBases",
} as const;

export const queryKnowledgeBase = createAction({
  name: "Query Knowledge Base",
  auth,
  fetchers: [knowledgeBasesFetcher],
  options: option.object({
    datasetId: option.string.meta({
      layout: {
        label: "Knowledge Base ID",
        isRequired: true,
        fetcher: knowledgeBasesFetcher.id,
      },
    }),
    query: option.string.meta({
      layout: {
        label: "Query",
        isRequired: true,
        inputType: "textarea",
      },
    }),
    responseMapping: option
      .saveResponseArray(["Retrieved chunks"] as const)
      .meta({
        layout: {
          accordion: "Save response",
        },
      }),
  }),
  getSetVariableIds: (options) =>
    options.responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
});
