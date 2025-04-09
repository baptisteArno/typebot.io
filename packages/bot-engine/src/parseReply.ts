import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultFileInputOptions } from "@typebot.io/blocks-inputs/file/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { parseAllowedFileTypesMetadata } from "@typebot.io/lib/extensionFromMimeType";
import { isURL } from "@typebot.io/lib/isURL";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseCardsReply } from "./blocks/cards/parseCardsReply";
import { parseButtonsReply } from "./blocks/inputs/buttons/parseButtonsReply";
import { parseDateReply } from "./blocks/inputs/date/parseDateReply";
import { formatEmail } from "./blocks/inputs/email/formatEmail";
import { parseNumber } from "./blocks/inputs/number/parseNumber";
import { formatPhoneNumber } from "./blocks/inputs/phone/formatPhoneNumber";
import { parsePictureChoicesReply } from "./blocks/inputs/pictureChoice/parsePictureChoicesReply";
import { validateRatingReply } from "./blocks/inputs/rating/validateRatingReply";
import { parseTime } from "./blocks/inputs/time/parseTime";
import type { InputMessage } from "./schemas/api";
import type { ParsedReply } from "./types";

export const parseReply = async (
  reply: InputMessage | undefined,
  {
    sessionStore,
    state,
    block,
  }: { sessionStore: SessionStore; state: SessionState; block: InputBlock },
): Promise<ParsedReply> => {
  switch (block.type) {
    case InputBlockType.EMAIL: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const formattedEmail = formatEmail(reply.text);
      if (!formattedEmail) return { status: "fail" };
      return { status: "success", content: formattedEmail };
    }
    case InputBlockType.PHONE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const formattedPhone = formatPhoneNumber(
        reply.text,
        block.options?.defaultCountryCode,
      );
      if (!formattedPhone) return { status: "fail" };
      return { status: "success", content: formattedPhone };
    }
    case InputBlockType.URL: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const isValid = isURL(reply.text, { require_protocol: false });
      if (!isValid) return { status: "fail" };
      return { status: "success", content: reply.text };
    }
    case InputBlockType.CHOICE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseButtonsReply(reply.text, {
        block,
        state,
        sessionStore,
      });
    }
    case InputBlockType.NUMBER: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseNumber(reply.text, {
        options: block.options,
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    case InputBlockType.DATE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseDateReply(reply.text, block);
    }
    case InputBlockType.TIME: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseTime(reply.text, block.options);
    }
    case InputBlockType.FILE: {
      if (!reply)
        return (block.options?.isRequired ?? defaultFileInputOptions.isRequired)
          ? { status: "fail" }
          : { status: "skip" };

      const replyValue = reply.type === "audio" ? reply.url : reply.text;
      const urls = replyValue.split(", ");
      const hasValidUrls = urls.some((url) =>
        isURL(url, { require_tld: env.S3_ENDPOINT !== "localhost" }),
      );

      const allowedFileTypesMetadata =
        block.options?.allowedFileTypes?.types &&
        block.options?.allowedFileTypes?.types?.length > 0 &&
        block.options?.allowedFileTypes?.isEnabled
          ? parseAllowedFileTypesMetadata(block.options.allowedFileTypes.types)
          : undefined;
      const allFilesAreAllowed = allowedFileTypesMetadata
        ? urls.every((url) => {
            const extension = url.split(".").pop();
            if (!extension) return false;
            return allowedFileTypesMetadata.some(
              (metadata) => metadata.extension === extension,
            );
          })
        : true;

      const status = hasValidUrls && allFilesAreAllowed ? "success" : "fail";
      if (!block.options?.isMultipleAllowed && urls.length > 1)
        return { status, content: replyValue.split(",")[0] };
      return { status, content: replyValue };
    }
    case InputBlockType.PAYMENT: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      if (reply.text === "fail") return { status: "fail" };
      return { status: "success", content: reply.text };
    }
    case InputBlockType.RATING: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const isValid = validateRatingReply(reply.text, block);
      if (!isValid) return { status: "fail" };
      return { status: "success", content: reply.text };
    }
    case InputBlockType.PICTURE_CHOICE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parsePictureChoicesReply(reply.text, {
        block,
        state,
        sessionStore,
      });
    }
    case InputBlockType.TEXT: {
      if (!reply) return { status: "fail" };
      return {
        status: "success",
        content: reply.type === "audio" ? reply.url : reply.text,
      };
    }
    case InputBlockType.CARDS: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseCardsReply(reply.text, {
        block,
        state,
        sessionStore,
      });
    }
  }
};
