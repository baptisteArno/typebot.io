import { Schema } from "effect";

export const ImageSrc = Schema.String.pipe(
  Schema.filter((value: string) => {
    if (value.startsWith("data:image/svg")) return true;

    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        /\.svg(?:$|[?#])/.test(url.pathname + url.search + url.hash)
      );
    } catch {
      return /\.svg(?:$|[?#])/.test(value);
    }
  }),
  Schema.brand("ImageSrc"),
);

export const Emoji = Schema.String.pipe(
  Schema.filter((value: string) =>
    /^(?:(?:\p{Extended_Pictographic}(?:\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?(?:\p{Emoji_Modifier})?)*)|(?:\p{Regional_Indicator}{2})|(?:[0-9#*]\uFE0F?\u20E3))$/u.test(
      value,
    ),
  ),
  Schema.brand("Emoji"),
);
