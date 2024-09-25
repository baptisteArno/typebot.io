import ky, { HTTPError } from "ky";
import type OpenAI from "openai";

export const splitUserTextMessageIntoOpenAIBlocks = async (
  input: string,
): Promise<string | OpenAI.Chat.ChatCompletionContentPart[]> => {
  const splittedInput = input.split("\n\n");
  let parts: OpenAI.Chat.ChatCompletionContentPart[] = [];
  for (const part of splittedInput) {
    if (part.startsWith("http") || part.startsWith('["http')) {
      const urls = part.startsWith("[") ? JSON.parse(part) : [part];
      for (const url of urls) {
        const cleanUrl = url.trim();
        try {
          const response = await ky.get(cleanUrl);
          if (
            !response.ok ||
            !response.headers.get("content-type")?.startsWith("image/")
          ) {
            parts.push({ type: "text", text: cleanUrl });
          } else {
            parts.push({
              type: "image_url",
              image_url: url.trim(),
            });
          }
        } catch (err) {
          if (err instanceof HTTPError) {
            console.log(err.response.status, await err.response.text());
          } else {
            console.error(err);
          }
        }
      }
    } else {
      if (parts.at(-1)?.type === "text") {
        const lastText = parts.at(-1) as OpenAI.ChatCompletionContentPartText;
        parts = parts.slice(0, -1);
        parts.push({ type: "text", text: lastText.text + "\n\n" + part });
      } else {
        parts.push({ type: "text", text: part });
      }
    }
  }

  return parts;
};
