import { createActionHandler } from "@typebot.io/forge";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { ClientOptions } from "openai";
import OpenAI from "openai";
import { createTranscription } from "../actions/createTranscription";

export const createTranscriptionHandler = createActionHandler(
  createTranscription,
  {
    server: async ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!options.url) return logs.add("Audio URL is empty");
      if (!options.transcriptionVariableId)
        return logs.add("Missing transcription variable");

      const config = {
        apiKey,
        baseURL: options.baseUrl,
        defaultHeaders: {
          "api-key": apiKey,
        },
        defaultQuery: isNotEmpty(options.apiVersion)
          ? {
              "api-version": options.apiVersion,
            }
          : undefined,
      } satisfies ClientOptions;

      const openai = new OpenAI(config);

      const result = await openai.audio.transcriptions.create({
        file: await fetch(options.url),
        model: "whisper-1",
      });

      variables.set([
        { id: options.transcriptionVariableId, value: result.text },
      ]);
    },
  },
);
