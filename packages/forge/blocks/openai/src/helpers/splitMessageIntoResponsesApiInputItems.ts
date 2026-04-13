import { safeKy } from "@typebot.io/lib/ky";
import { HTTPError } from "ky";
import type { Responses } from "openai/resources/responses/responses";

type InputContent = Responses.ResponseInputText | Responses.ResponseInputImage;

export const splitMessageIntoResponsesApiInputItems = async (
  input: string,
): Promise<string | InputContent[]> => {
  const parts = input.split("\n\n");
  let contents: InputContent[] = [];
  for (const part of parts) {
    if (part.startsWith("http") || part.startsWith('["http')) {
      const urls: string[] = part.startsWith("[") ? JSON.parse(part) : [part];
      for (const url of urls) {
        const cleanUrl = url.trim();
        try {
          const response = await safeKy.get(cleanUrl);
          if (
            !response.ok ||
            !response.headers.get("content-type")?.startsWith("image/")
          ) {
            contents.push({ type: "input_text", text: cleanUrl });
          } else {
            contents.push({
              type: "input_image",
              image_url: cleanUrl,
              detail: "auto",
            });
          }
        } catch (err) {
          if (err instanceof HTTPError)
            console.log(err.response.status, await err.response.text());
          else console.error(err);
        }
      }
    } else {
      const lastContent = contents.at(-1);
      if (lastContent?.type === "input_text") {
        contents = contents.slice(0, -1);
        contents.push({
          type: "input_text",
          text: `${lastContent.text}\n\n${part}`,
        });
      } else {
        contents.push({ type: "input_text", text: part });
      }
    }
  }
  return contents;
};
