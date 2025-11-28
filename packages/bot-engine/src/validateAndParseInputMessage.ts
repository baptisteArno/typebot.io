import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultFileInputOptions } from "@typebot.io/blocks-inputs/file/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { InputMessage } from "@typebot.io/chat-api/schemas";
import { env } from "@typebot.io/env";
import { parseAllowedFileTypesMetadata } from "@typebot.io/lib/extensionFromMimeType";
import { isURL } from "@typebot.io/lib/isURL";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";
import { parseCardsReply } from "./blocks/cards/parseCardsReply";
import { injectVariableValuesInButtonsInputBlock } from "./blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock";
import { parseMultipleChoiceReply } from "./blocks/inputs/buttons/parseMultipleChoiceReply";
import { parseSingleChoiceReply } from "./blocks/inputs/buttons/parseSingleChoiceReply";
import { parseDateReply } from "./blocks/inputs/date/parseDateReply";
import { formatEmail } from "./blocks/inputs/email/formatEmail";
import { parseNumber } from "./blocks/inputs/number/parseNumber";
import { formatPhoneNumber } from "./blocks/inputs/phone/formatPhoneNumber";
import { injectVariableValuesInPictureChoiceBlock } from "./blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock";
import { validateRatingReply } from "./blocks/inputs/rating/validateRatingReply";
import { parseTime } from "./blocks/inputs/time/parseTime";
import type { ParsedReply } from "./types";

export const validateAndParseInputMessage = (
  message: InputMessage | undefined,
  {
    sessionStore,
    variables,
    block,
    skipValidation,
  }: {
    sessionStore: SessionStore;
    variables: Variable[];
    block: InputBlock;
    skipValidation?: boolean;
  },
): ParsedReply => {
  switch (block.type) {
    case InputBlockType.EMAIL: {
      if (!message || message.type !== "text") return { status: "fail" };
      const formattedEmail = formatEmail(message.text);
      if (!formattedEmail) return { status: "fail" };
      return { status: "success", content: formattedEmail };
    }
    case InputBlockType.PHONE: {
      if (!message || message.type !== "text") return { status: "fail" };
      const formattedPhone = formatPhoneNumber(
        message.text,
        block.options?.defaultCountryCode,
      );
      if (!formattedPhone) return { status: "fail" };
      return { status: "success", content: formattedPhone };
    }
    case InputBlockType.URL: {
      if (!message || message.type !== "text") return { status: "fail" };
      const isValid = isURL(message.text, { require_protocol: false });
      if (!isValid) return { status: "fail" };
      return { status: "success", content: message.text };
    }
    case InputBlockType.CHOICE: {
      if (!message || message.type !== "text") return { status: "fail" };
      if (block.options?.dynamicVariableId && skipValidation) {
        return {
          status: "success",
          content: message.text,
        };
      }
      const displayedItems = injectVariableValuesInButtonsInputBlock(block, {
        variables,
        sessionStore,
      }).items;
      if (block.options?.isMultipleChoice)
        return parseMultipleChoiceReply(message.text, {
          items: displayedItems,
        });
      return parseSingleChoiceReply(message.text, {
        replyId: message.metadata?.replyId,
        items: displayedItems,
      });
    }
    case InputBlockType.NUMBER: {
      if (!message || message.type !== "text") return { status: "fail" };
      return parseNumber(message.text, {
        options: block.options,
        variables,
        sessionStore,
      });
    }
    case InputBlockType.DATE: {
      if (!message || message.type !== "text") return { status: "fail" };
      return parseDateReply(message.text, block);
    }
    case InputBlockType.TIME: {
      if (!message || message.type !== "text") return { status: "fail" };
      return parseTime(message.text, block.options);
    }
    case InputBlockType.FILE: {
      if (!message)
        return (block.options?.isRequired ?? defaultFileInputOptions.isRequired)
          ? { status: "fail" }
          : { status: "skip" };

      const replyValue = message.type === "audio" ? message.url : message.text;
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
              (metadata) =>
                metadata.extension.toLowerCase() === extension.toLowerCase(),
            );
          })
        : true;

      const status = hasValidUrls && allFilesAreAllowed ? "success" : "fail";
      if (!block.options?.isMultipleAllowed && urls.length > 1)
        return { status, content: replyValue.split(",")[0] };
      return { status, content: replyValue };
    }
    case InputBlockType.PAYMENT: {
      if (!message || message.type !== "text") return { status: "fail" };
      if (message.text === "fail") return { status: "fail" };
      return { status: "success", content: message.text };
    }
    case InputBlockType.RATING: {
      if (!message || message.type !== "text") return { status: "fail" };
      const isValid = validateRatingReply(message.text, block);
      if (!isValid) return { status: "fail" };
      return { status: "success", content: message.text };
    }
    case InputBlockType.PICTURE_CHOICE: {
      if (!message || message.type !== "text") return { status: "fail" };
      if (
        block.options?.dynamicItems?.pictureSrcsVariableId &&
        skipValidation
      ) {
        return {
          status: "success",
          content: message.text,
        };
      }
      const displayedItems = injectVariableValuesInPictureChoiceBlock(block, {
        variables,
        sessionStore,
      }).items;
      if (block.options?.isMultipleChoice)
        return parseMultipleChoiceReply(message.text, {
          items: displayedItems,
        });
      return parseSingleChoiceReply(message.text, {
        items: displayedItems,
        replyId: message.metadata?.replyId,
      });
    }
    case InputBlockType.TEXT: {
      if (!message) return { status: "fail" };
      return {
        status: "success",
        content: message.type === "audio" ? message.url : message.text,
      };
    }
    case InputBlockType.CARDS: {
      if (!message || message.type !== "text") return { status: "fail" };
      return parseCardsReply(message.text, {
        block,
        variables,
        sessionStore,
        replyId: message.metadata?.replyId,
      });
    }
  }
};
