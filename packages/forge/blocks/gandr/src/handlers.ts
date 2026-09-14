import { createActionHandler } from "@typebot.io/forge";
import { createId } from "@typebot.io/lib/createId";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import got from "ky";
import { convertTextToSpeech } from "./actions/convertTextToSpeech";
import { baseUrl } from "./constants";

const MAX_INPUT_LENGTH = 2000;

const mimeTypeByResponseFormat = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  // pcm is raw signed 16 bit little endian mono audio at 24000 Hz, no container
  pcm: "application/octet-stream",
} as const;

export default [
  createActionHandler(convertTextToSpeech, {
    server: async ({ credentials, options, variables, logs }) => {
      if (!options.voice) return logs.add("Voice is missing");
      if (!options.text) return logs.add("Text is missing");
      if (!options.saveUrlInVariableId)
        return logs.add("Save variable is missing");
      if (options.text.length > MAX_INPUT_LENGTH)
        return logs.add("Text must be 2000 characters or fewer");

      try {
        const response = await got
          .post(`${baseUrl}/v1/audio/speech`, {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
            },
            json: {
              model: "tts-1",
              input: options.text,
              voice: options.voice,
              response_format: options.responseFormat ?? "mp3",
            },
            timeout: false,
          })
          .arrayBuffer();

        const format = options.responseFormat ?? "mp3";

        const url = await uploadFileToBucket({
          file: Buffer.from(response),
          key: `tmp/gandr/audio/${createId() + createId()}.${format}`,
          mimeType: mimeTypeByResponseFormat[format],
        });

        variables.set([{ id: options.saveUrlInVariableId, value: url }]);
      } catch (err) {
        return logs.add(
          await parseUnknownError({
            err,
            context: "While converting text to Gandr speech",
          }),
        );
      }
    },
  }),
];
