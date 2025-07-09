import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { CardsItem } from "@typebot.io/blocks-inputs/cards/schema";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { describe, expect, it } from "vitest";
import { convertInputToWhatsAppMessages } from "./convertInputToWhatsAppMessage";
import type { WhatsAppSendingMessage } from "./schemas";

describe("Simple input types", () => {
  it("should return empty array for simple input types", () => {
    const simpleInputTypes = [
      InputBlockType.DATE,
      InputBlockType.TIME,
      InputBlockType.EMAIL,
      InputBlockType.FILE,
      InputBlockType.NUMBER,
      InputBlockType.PHONE,
      InputBlockType.URL,
      InputBlockType.PAYMENT,
      InputBlockType.RATING,
      InputBlockType.TEXT,
    ];

    simpleInputTypes.forEach((type) => {
      const input = {
        type,
        id: "input1",
        options: {},
      } as NonNullable<ContinueChatResponse["input"]>;

      const result = convertInputToWhatsAppMessages(input, undefined);
      expect(result).toEqual([]);
    });
  });
});

describe("Choice input", () => {
  it("should return text message for multiple choice", () => {
    const input = createMockButtonsInput(
      [
        { id: "choice1", content: "Option 1" },
        { id: "choice2", content: "Option 2" },
      ],
      true,
    );
    const lastMessage = createMockTextMessage("Choose your options:");

    const result = convertInputToWhatsAppMessages(input, lastMessage);

    expect(result).toEqual([
      {
        type: "text",
        text: {
          body: "Choose your options:\n\n1. Option 1\n2. Option 2",
        },
      },
    ]);
  });

  it("should return interactive buttons for single choice", () => {
    const input = createMockButtonsInput([
      { id: "choice1", content: "Option 1" },
      { id: "choice2", content: "Option 2" },
    ]);
    const lastMessage = createMockTextMessage("Choose one:");

    const result = convertInputToWhatsAppMessages(input, lastMessage);

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Choose one:",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "choice1",
                  title: "Option 1",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "choice2",
                  title: "Option 2",
                },
              },
            ],
          },
        },
      } satisfies WhatsAppSendingMessage,
    ]);
  });

  it("should handle choice buttons with long text", () => {
    const input = createMockButtonsInput([
      {
        id: "choice1",
        content: "This is a very long option that exceeds 20 characters",
      },
      { id: "choice2", content: "Short option" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    // Type guard to ensure interactive message
    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.action.buttons[0].reply.title).toBe(
      "This is a very lon..",
    );
    expect(interactiveMessage.interactive.action.buttons[1].reply.title).toBe(
      "Short option",
    );
  });

  it("should handle duplicate button titles", () => {
    const input = createMockButtonsInput([
      { id: "choice1", content: "Option" },
      { id: "choice2", content: "Option" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.action.buttons[0].reply.title).toBe(
      "Option",
    );
    expect(interactiveMessage.interactive.action.buttons[1].reply.title).toBe(
      "Option (1)..",
    );
  });

  it("should group buttons when exceeding group size", () => {
    const input = createMockButtonsInput([
      { id: "choice1", content: "Option 1" },
      { id: "choice2", content: "Option 2" },
      { id: "choice3", content: "Option 3" },
      { id: "choice4", content: "Option 4" },
    ]);
    const lastMessage = createMockTextMessage("Choose:");

    const result = convertInputToWhatsAppMessages(input, lastMessage);

    expect(result).toHaveLength(2);
    const firstMessage = expectInteractiveMessage(result[0]);
    const secondMessage = expectInteractiveMessage(result[1]);
    expect(firstMessage.interactive.body?.text).toBe("Choose:");
    expect(secondMessage.interactive.body?.text).toBe("―");
  });

  it("should filter out items with no content", () => {
    const input = createMockButtonsInput([
      { id: "choice1", content: "Option 1" },
      { id: "choice2", content: "" },
      { id: "choice3", content: "Option 3" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.action.buttons).toHaveLength(2);
    expect(interactiveMessage.interactive.action.buttons[0].reply.title).toBe(
      "Option 1",
    );
    expect(interactiveMessage.interactive.action.buttons[1].reply.title).toBe(
      "Option 3",
    );
  });
});

describe("Picture choice input", () => {
  it("should return numbered list for multiple choice", () => {
    const input = createMockPictureChoiceInput(
      [
        {
          id: "pic1",
          title: "Picture 1",
          description: "Description 1",
          pictureSrc: "https://example.com/pic1.jpg",
        },
        { id: "pic2", title: "Picture 2", description: "Description 2" },
      ],
      true,
    );

    const result = convertInputToWhatsAppMessages(input, undefined);

    expect(result).toEqual([
      {
        type: "image",
        image: {
          link: "https://example.com/pic1.jpg",
        },
      },
      {
        type: "text",
        text: {
          body: "1. *Picture 1*\n\nDescription 1",
        },
      },
      {
        type: "text",
        text: {
          body: "2. *Picture 2*\n\nDescription 2",
        },
      },
    ]);
  });

  it("should return interactive buttons for single choice", () => {
    const input = createMockPictureChoiceInput([
      {
        id: "pic1",
        title: "Picture 1",
        description: "Description 1",
        pictureSrc: "https://example.com/pic1.jpg",
      },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    expect(result).toEqual([
      {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: {
              link: "https://example.com/pic1.jpg",
            },
          },
          body: {
            text: "*Picture 1*\n\nDescription 1",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "pic1",
                  title: "Select",
                },
              },
            ],
          },
        },
      },
    ]);
  });

  it("should handle picture choice without image", () => {
    const input = createMockPictureChoiceInput([
      { id: "pic1", title: "Picture 1", description: "Description 1" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.header).toBeUndefined();
    expect(interactiveMessage.interactive.body?.text).toBe(
      "*Picture 1*\n\nDescription 1",
    );
  });

  it("should handle picture choice with custom system message", () => {
    const input = createMockPictureChoiceInput([
      { id: "pic1", title: "Picture 1" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined, {
      whatsAppPictureChoiceSelectLabel: "Choose this",
    });

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.action.buttons[0].reply.title).toBe(
      "Choose this",
    );
  });

  it("should handle empty title and description", () => {
    const input = createMockPictureChoiceInput([
      { id: "pic1", pictureSrc: "https://example.com/pic1.jpg" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.body).toBeUndefined();
  });
});

describe("Cards input", () => {
  it("should return interactive buttons for each card", () => {
    const input = createMockCardsInput([
      {
        id: "card1",
        title: "Card 1",
        description: "Description 1",
        imageUrl: "https://example.com/card1.jpg",
        paths: [
          { id: "path1", text: "Action 1" },
          { id: "path2", text: "Action 2" },
        ],
      },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    expect(result).toEqual([
      {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: {
              link: "https://example.com/card1.jpg",
            },
          },
          body: {
            text: "*Card 1*\n\nDescription 1",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "path1",
                  title: "Action 1",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "path2",
                  title: "Action 2",
                },
              },
            ],
          },
        },
      },
    ]);
  });

  it("should limit paths to 3 buttons", () => {
    const input = createMockCardsInput([
      {
        id: "card1",
        title: "Card 1",
        paths: [
          { id: "path1", text: "Action 1" },
          { id: "path2", text: "Action 2" },
          { id: "path3", text: "Action 3" },
          { id: "path4", text: "Action 4" },
        ],
      },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.action.buttons).toHaveLength(3);
  });

  it("should handle cards without image", () => {
    const input = createMockCardsInput([
      {
        id: "card1",
        title: "Card 1",
        description: "Description 1",
        paths: [{ id: "path1", text: "Action 1" }],
      },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.header).toBeUndefined();
  });

  it("should handle empty paths array", () => {
    const input = createMockCardsInput([
      {
        id: "card1",
        title: "Card 1",
        paths: [],
      },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.action.buttons).toEqual([]);
  });
});

describe("Edge cases", () => {
  it("should handle undefined lastMessage", () => {
    const input = createMockButtonsInput([
      { id: "choice1", content: "Option 1" },
    ]);

    const result = convertInputToWhatsAppMessages(input, undefined);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.body?.text).toBe("―");
  });

  it("should handle non-richText lastMessage", () => {
    const lastMessage = {
      id: "msg1",
      type: BubbleBlockType.TEXT,
      content: {
        type: "markdown",
        markdown: "Simple text",
      },
    } as ContinueChatResponse["messages"][number];

    const input = createMockButtonsInput([
      { id: "choice1", content: "Option 1" },
    ]);

    const result = convertInputToWhatsAppMessages(input, lastMessage);

    const interactiveMessage = expectInteractiveMessage(result[0]);
    expect(interactiveMessage.interactive.body?.text).toBe("―");
  });
});

const expectInteractiveMessage = (
  message: WhatsAppSendingMessage,
): Extract<WhatsAppSendingMessage, { type: "interactive" }> => {
  if (message.type !== "interactive") {
    throw new Error(`Expected interactive message, got ${message.type}`);
  }
  return message;
};

const createMockTextMessage = (
  content: string,
): ContinueChatResponse["messages"][number] => ({
  id: "msg1",
  type: BubbleBlockType.TEXT,
  content: {
    type: "richText",
    richText: [{ type: "p", children: [{ text: content }] }],
  },
});

const createMockButtonsInput = (
  items: ButtonItem[],
  isMultipleChoice = false,
): NonNullable<ContinueChatResponse["input"]> => ({
  type: InputBlockType.CHOICE,
  id: "input1",
  options: {
    isMultipleChoice,
  },
  items: items.map((item) => ({
    id: item.id,
    content: item.content,
    outgoingEdgeId: "edge1",
  })),
});

const createMockPictureChoiceInput = (
  items: PictureChoiceItem[],
  isMultipleChoice = false,
): NonNullable<ContinueChatResponse["input"]> => ({
  type: InputBlockType.PICTURE_CHOICE,
  id: "input1",
  options: {
    isMultipleChoice,
    buttonLabel: "Submit",
    searchInputPlaceholder: "Search...",
    isSearchable: false,
  },
  items: items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    pictureSrc: item.pictureSrc,
    outgoingEdgeId: "edge1",
  })),
});

const createMockCardsInput = (
  items: CardsItem[],
): NonNullable<ContinueChatResponse["input"]> => ({
  type: InputBlockType.CARDS,
  id: "input1",
  options: {},
  items: items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    paths: item.paths,
    outgoingEdgeId: "edge1",
  })),
});
