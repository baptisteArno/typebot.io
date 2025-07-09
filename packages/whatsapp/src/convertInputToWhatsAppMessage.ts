import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { env } from "@typebot.io/env";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import { defaultSystemMessages } from "@typebot.io/settings/constants";
import type { SystemMessages } from "@typebot.io/settings/schemas";
import type { WhatsAppSendingMessage } from "./schemas";

export const convertInputToWhatsAppMessages = (
  input: NonNullable<ContinueChatResponse["input"]>,
  lastMessage: ContinueChatResponse["messages"][number] | undefined,
  systemMessages?: Pick<SystemMessages, "whatsAppPictureChoiceSelectLabel">,
): WhatsAppSendingMessage[] => {
  const lastMessageText =
    lastMessage?.type === BubbleBlockType.TEXT &&
    lastMessage.content.type === "richText"
      ? convertRichTextToMarkdown(lastMessage.content.richText ?? [], {
          flavour: "whatsapp",
        })
      : undefined;
  switch (input.type) {
    case InputBlockType.DATE:
    case InputBlockType.TIME:
    case InputBlockType.EMAIL:
    case InputBlockType.FILE:
    case InputBlockType.NUMBER:
    case InputBlockType.PHONE:
    case InputBlockType.URL:
    case InputBlockType.PAYMENT:
    case InputBlockType.RATING:
    case InputBlockType.TEXT:
      return [];
    case InputBlockType.PICTURE_CHOICE: {
      if (
        input.options?.isMultipleChoice ??
        defaultPictureChoiceOptions.isMultipleChoice
      )
        return input.items.flatMap((item, idx) => {
          let bodyText = "";
          if (item.title) bodyText += `*${item.title}*`;
          if (item.description) {
            if (item.title) bodyText += "\n\n";
            bodyText += item.description;
          }
          const imageMessage = item.pictureSrc
            ? ({
                type: "image",
                image: {
                  link: item.pictureSrc ?? "",
                },
              } as const)
            : undefined;
          const textMessage = {
            type: "text",
            text: {
              body: `${idx + 1}. ${bodyText}`,
            },
          } as const;
          return imageMessage ? [imageMessage, textMessage] : textMessage;
        });
      return input.items.map((item) => {
        let bodyText = "";
        if (item.title) bodyText += `*${item.title}*`;
        if (item.description) {
          if (item.title) bodyText += "\n\n";
          bodyText += item.description;
        }
        return {
          type: "interactive",
          interactive: {
            type: "button",
            header: item.pictureSrc
              ? {
                  type: "image",
                  image: {
                    link: item.pictureSrc,
                  },
                }
              : undefined,
            body: isEmpty(bodyText) ? undefined : { text: bodyText },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: item.id,
                    title:
                      systemMessages?.whatsAppPictureChoiceSelectLabel ??
                      defaultSystemMessages.whatsAppPictureChoiceSelectLabel,
                  },
                },
              ],
            },
          },
        };
      });
    }
    case InputBlockType.CHOICE: {
      if (
        input.options?.isMultipleChoice ??
        defaultChoiceInputOptions.isMultipleChoice
      )
        return [
          {
            type: "text",
            text: {
              body:
                `${lastMessageText}\n\n` +
                input.items
                  .map((item, idx) => `${idx + 1}. ${item.content}`)
                  .join("\n"),
            },
          },
        ];
      const items = groupArrayByArraySize(
        input.items.filter((item) => isDefined(item.content)),
        env.WHATSAPP_INTERACTIVE_GROUP_SIZE,
      ) as ButtonItem[][];
      return items.map((items, idx) => ({
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: idx === 0 ? (lastMessageText ?? "―") : "―",
          },
          action: {
            buttons: (() => {
              const nonEmptyItems = items.filter((item) => item.content);
              const buttonTexts = nonEmptyItems.map(
                (item) => item.content as string,
              );
              const uniqueTitles = getUniqueButtonTitles(buttonTexts);

              return nonEmptyItems.map((item, index) => ({
                type: "reply",
                reply: {
                  id: item.id,
                  title: uniqueTitles[index],
                },
              }));
            })(),
          },
        },
      }));
    }
    case InputBlockType.CARDS: {
      return input.items.map((item) => {
        let bodyText = "";
        if (item.title) bodyText += `*${item.title}*`;
        if (item.description) {
          if (item.title) bodyText += "\n\n";
          bodyText += item.description;
        }
        return {
          type: "interactive",
          interactive: {
            type: "button",
            header: item.imageUrl
              ? {
                  type: "image",
                  image: {
                    link: item.imageUrl,
                  },
                }
              : undefined,
            body: isEmpty(bodyText) ? undefined : { text: bodyText },
            action: {
              buttons: (() => {
                const paths = (item.paths ?? []).slice(0, 3);
                const buttonTexts = paths.map((path) => path.text ?? "");
                const uniqueTitles = getUniqueButtonTitles(buttonTexts);

                return paths.map((path, index) => ({
                  type: "reply",
                  reply: {
                    id: path.id,
                    title: uniqueTitles[index],
                  },
                }));
              })(),
            },
          },
        };
      });
    }
  }
};

const trimTextTo20Chars = (
  text: string,
  existingTitles: string[] = [],
): string => {
  const baseTitle = text.length > 20 ? `${text.slice(0, 18)}..` : text;

  if (!existingTitles.includes(baseTitle)) return baseTitle;

  let counter = 1;
  let uniqueTitle = "";

  do {
    const suffix = `(${counter})`;
    const availableChars = 20 - suffix.length - 3; // 3 for ".." and a space
    uniqueTitle = `${text.slice(0, availableChars)} ${suffix}..`;
    counter++;
  } while (existingTitles.includes(uniqueTitle));

  return uniqueTitle;
};

const getUniqueButtonTitles = (texts: string[]): string[] => {
  const uniqueTitles: string[] = [];

  return texts.map((text) => {
    const uniqueTitle = trimTextTo20Chars(text, uniqueTitles);
    uniqueTitles.push(uniqueTitle);
    return uniqueTitle;
  });
};

const groupArrayByArraySize = (arr: any[], n: number) =>
  arr.reduce(
    (r, e, i) => (i % n ? r[r.length - 1].push(e) : r.push([e])) && r,
    [],
  );
