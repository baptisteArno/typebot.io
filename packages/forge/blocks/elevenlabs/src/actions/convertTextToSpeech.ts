import { createAction, option } from "@typebot.io/forge";
import { createId } from "@typebot.io/lib/createId";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import got from "ky";
import { auth } from "../auth";
import { baseUrl } from "../constants";
import type { ModelsResponse, VoicesResponse } from "../type";

export const convertTextToSpeech = createAction({
  name: "Convert text to speech",
  auth,
  options: option.object({
    text: option.string.layout({
      label: "Text",
      inputType: "textarea",
      placeholder: "Enter the text to convert to speech",
    }),
    voiceId: option.string.layout({
      fetcher: "fetchVoices",
      label: "Voice",
      placeholder: "Select a voice",
    }),
    modelId: option.string.layout({
      fetcher: "fetchModels",
      label: "Model",
      placeholder: "Select a model",
    }),
    saveUrlInVariableId: option.string.layout({
      label: "Save audio URL in variable",
      placeholder: "Select a variable",
      inputType: "variableDropdown",
    }),
  }),
  getSetVariableIds: ({ saveUrlInVariableId }) =>
    saveUrlInVariableId ? [saveUrlInVariableId] : [],
  fetchers: [
    {
      id: "fetchVoices",
      fetch: async ({ credentials }) => {
        if (!credentials?.apiKey)
          return {
            data: [],
          };

        try {
          const response = await got
            .get(baseUrl + "/v1/voices", {
              headers: {
                "xi-api-key": credentials.apiKey,
              },
            })
            .json<VoicesResponse>();

          return {
            data: response.voices.map((voice) => ({
              value: voice.voice_id,
              label: voice.name,
            })),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({ err }),
          };
        }
      },
      dependencies: [],
    },
    {
      id: "fetchModels",
      fetch: async ({ credentials }) => {
        if (!credentials?.apiKey)
          return {
            data: [],
          };

        try {
          const response = await got
            .get(baseUrl + "/v1/models", {
              headers: {
                "xi-api-key": credentials.apiKey,
              },
            })
            .json<ModelsResponse>();

          return {
            data: response
              .filter((model) => model.can_do_text_to_speech)
              .map((model) => ({
                value: model.model_id,
                label: model.name,
              })),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({ err }),
          };
        }
      },
      dependencies: [],
    },
  ],
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      if (!options.voiceId) return logs.add("Voice ID is missing");
      if (!options.text) return logs.add("Text is missing");
      if (!options.saveUrlInVariableId)
        return logs.add("Save variable is missing");

      try {
        const response = await got
          .post(baseUrl + "/v1/text-to-speech/" + options.voiceId, {
            headers: {
              Accept: "audio/mpeg",
              "xi-api-key": credentials.apiKey,
            },
            json: {
              model_id: options.modelId,
              text: options.text,
            },
            timeout: false,
          })
          .arrayBuffer();

        const url = await uploadFileToBucket({
          file: Buffer.from(response),
          key: `tmp/elevenlabs/audio/${createId() + createId()}.mp3`,
          mimeType: "audio/mpeg",
        });

        variables.set([{ id: options.saveUrlInVariableId, value: url }]);
      } catch (err) {
        return logs.add(
          await parseUnknownError({
            err,
            context: "While converting text to ElevenLabs speech",
          }),
        );
      }
    },
  },
});
