import { createHandler } from "@typebot.io/forge";
import { createId } from "@typebot.io/lib/createId";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { ClientOptions } from "openai";
import OpenAI from "openai";
import { createSpeech } from "../actions/createSpeech";
import { defaultOpenAIOptions } from "../constants";

export const createSpeechHandler = createHandler(createSpeech, {
  server: async ({ credentials: { apiKey }, options, variables, logs }) => {
    if (!options.input) return logs.add("Create speech input is empty");
    if (!options.voice) return logs.add("Create speech voice is empty");
    if (!options.saveUrlInVariableId)
      return logs.add("Create speech save variable is empty");

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

    const model = options.model ?? defaultOpenAIOptions.voiceModel;

    try {
      const rawAudio = (await openai.audio.speech.create({
        input: options.input,
        voice: options.voice,
        model,
        instructions: options.instructions,
      })) as any;
      const url = await uploadFileToBucket({
        file: Buffer.from((await rawAudio.arrayBuffer()) as ArrayBuffer),
        key: `tmp/openai/audio/${createId() + createId()}.mp3`,
        mimeType: "audio/mpeg",
      });

      variables.set([{ id: options.saveUrlInVariableId, value: url }]);
    } catch (err) {
      logs.add(
        await parseUnknownError({
          err,
          context: "While generating speech",
        }),
      );
    }
  },
});
