import { createActionHandler } from "@typebot.io/forge";
import { safeKy } from "@typebot.io/lib/ky";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { ClientOptions } from "openai";
import OpenAI, { toFile } from "openai";
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

      try {
        const audioResponse = await safeKy.get(options.url);
        const contentType = parseContentType(
          audioResponse.headers.get("content-type"),
        );
        const file = await toFile(
          audioResponse,
          createOpenAITranscriptionFileName({
            contentType,
            url: options.url,
          }),
          contentType ? { type: contentType } : undefined,
        );

        const result = await openai.audio.transcriptions.create({
          file,
          model: isNotEmpty(options.model) ? options.model : "whisper-1",
          ...(isNotEmpty(options.prompt) ? { prompt: options.prompt } : {}),
        });

        variables.set([
          { id: options.transcriptionVariableId, value: result.text },
        ]);
      } catch (err) {
        return logs.add(
          await parseUnknownError({
            err,
            context: "While creating OpenAI transcription",
          }),
        );
      }
    },
  },
);

const openAITranscriptionExtensions = new Set([
  "flac",
  "m4a",
  "mp3",
  "mp4",
  "mpeg",
  "mpga",
  "oga",
  "ogg",
  "wav",
  "webm",
]);

const openAITranscriptionExtensionFromContentType = new Map([
  ["audio/flac", "flac"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
  ["audio/mp3", "mp3"],
  ["audio/mpeg", "mp3"],
  ["audio/mpga", "mpga"],
  ["audio/ogg", "ogg"],
  ["application/ogg", "ogg"],
  ["audio/wav", "wav"],
  ["audio/wave", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/webm", "webm"],
  ["video/mp4", "mp4"],
  ["video/mpeg", "mpeg"],
  ["video/webm", "webm"],
]);

export const createOpenAITranscriptionFileName = ({
  contentType,
  url,
}: {
  contentType?: string;
  url: string;
}) =>
  `audio.${parseOpenAITranscriptionFileExtension({
    contentType,
    url,
  })}`;

const parseOpenAITranscriptionFileExtension = ({
  contentType,
  url,
}: {
  contentType?: string;
  url: string;
}) => {
  if (contentType) {
    const extension =
      openAITranscriptionExtensionFromContentType.get(contentType);
    if (extension) return extension;
  }

  const extensionFromUrl = parseUrlExtension(url);

  if (extensionFromUrl === "weba") return "webm";

  if (extensionFromUrl && openAITranscriptionExtensions.has(extensionFromUrl))
    return extensionFromUrl;

  return "webm";
};

const parseContentType = (contentType: string | null) =>
  contentType?.split(";")[0]?.trim().toLowerCase();

const parseUrlExtension = (url: string) => {
  const pathname = parseUrlPathname(url);
  const filename = pathname.split("/").pop();
  const extension = filename?.split(".").pop()?.toLowerCase();

  return extension === filename ? undefined : extension;
};

const parseUrlPathname = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0] ?? url;
  }
};
