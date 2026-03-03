import { Schema } from "effect";

export const Email = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("Email"),
);
export type Email = typeof Email.Type;

export const Name = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("Name"),
);
export type Name = typeof Name.Type;

export const PhoneNumber = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("PhoneNumber"),
);
export type PhoneNumber = typeof PhoneNumber.Type;

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

export const SpaceId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("SpaceId"),
);
export type SpaceId = typeof SpaceId.Type;

export const CampaignId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("CampaignId"),
);
export type CampaignId = typeof CampaignId.Type;

export const TypebotId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("TypebotId"),
);
export type TypebotId = typeof TypebotId.Type;

export const SegmentId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("SegmentId"),
);
export type SegmentId = typeof SegmentId.Type;

export const CredentialsId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("CredentialsId"),
);
export type CredentialsId = typeof CredentialsId.Type;
