import { createFetcherHandler } from "@typebot.io/forge";
import ky from "ky";
import {
  knowledgeBasesFetcher,
  queryKnowledgeBase,
} from "../actions/queryKnowledgeBase";
import { defaultBaseUrl } from "../constants";
import type { ListKnowledgeBasesResponse } from "../types";
import { createChatMessageHandler } from "./createChatMessageHandler";
import { queryKnowledgeBaseHandler } from "./queryKnowledgeBaseHandler";

export default [
  createChatMessageHandler,
  queryKnowledgeBaseHandler,
  createFetcherHandler(
    queryKnowledgeBase,
    knowledgeBasesFetcher.id,
    async ({ credentials: { knowledgeApiKey, apiEndpoint } = {} }) => {
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
  ),
];
