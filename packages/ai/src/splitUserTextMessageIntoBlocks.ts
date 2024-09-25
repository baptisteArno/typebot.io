import type { ImagePart, TextPart, UserContent } from "ai";
import ky, { HTTPError } from "ky";

type Props = {
  input: string;
  shouldDownloadImages: boolean;
};
export const splitUserTextMessageIntoBlocks = async ({
  input,
  shouldDownloadImages,
}: Props): Promise<UserContent> => {
  const splittedInput = input.split("\n\n");
  let parts: (TextPart | ImagePart)[] = [];
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
              type: "image",
              image: shouldDownloadImages
                ? await response.arrayBuffer()
                : url.trim(),
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
        const lastText = parts.at(-1) as TextPart;
        parts = parts.slice(0, -1);
        parts.push({ type: "text", text: lastText.text + "\n\n" + part });
      } else {
        parts.push({ type: "text", text: part });
      }
    }
  }

  return parts;
};
