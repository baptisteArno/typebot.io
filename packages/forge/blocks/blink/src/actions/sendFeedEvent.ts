import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";

export const sectionItem = option.discriminatedUnion("type", [
  option.object({
    type: option.literal("Header"),
    title: option.string,
    iconUrl: option.string.meta({
      layout: {
        label: "Icon URL",
        placeholder: "https://example.com/icon.png",
      },
    }),
  }),

  option.object({
    type: option.literal("Text"),
    value: option.string.meta({
      layout: {
        inputType: "textarea",
      },
    }),
  }),

  option.object({
    type: option.literal("Labelled Text"),
    label: option.string.meta({ layout: { label: "Label" } }),
    value: option.string.meta({
      layout: {
        label: "Value",
        inputType: "textarea",
      },
    }),
    iconUrl: option.string.meta({
      layout: {
        label: "Icon URL",
        placeholder: "https://example.com/icon.png",
      },
    }),
  }),

  option.object({
    type: option.literal("Image"),
    imageUrl: option.string.meta({
      layout: {
        placeholder: "https://example.com/image.jpg",
      },
    }),
    fitImage: option.boolean.meta({ layout: { label: "Fit Image" } }),
    width: option.number.meta({
      layout: { label: "Width (px)", direction: "row" },
    }),
    height: option.number.meta({
      layout: { label: "Height (px)", direction: "row" },
    }),
  }),

  option.object({
    type: option.literal("Image gallery"),
    imageUrls: option.array(option.string).meta({
      layout: {
        label: "URLs",
        itemLabel: "Image URL",
      },
    }),
  }),

  option.object({
    type: option.literal("YouTube"),
    link: option.string.meta({
      layout: {
        placeholder: "i.e. https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    }),
  }),

  option.object({
    type: option.literal("Link"),
    url: option.string.meta({ layout: { placeholder: "https://example.com" } }),
    title: option.string.meta({ layout: { label: "Title" } }),
    description: option.string.meta({ layout: { label: "Description" } }),
    imageUrl: option.string.meta({ layout: { label: "Image URL" } }),
    imagePlacement: option
      .enum(["left", "right", "top"])
      .meta({ layout: { label: "Image Placement", defaultValue: "left" } }),
  }),

  option.object({
    type: option.literal("Buttons"),
    buttons: option.array(
      option.object({
        clientAction: option.discriminatedUnion("type", [
          option.object({
            type: option.literal("Open Link"),
            url: option.string.meta({
              layout: { placeholder: "https://example.com" },
            }),
          }),
          option.object({
            type: option.literal("Open Webview"),
            url: option.string.meta({
              layout: {
                placeholder: "https://example.com",
              },
            }),
          }),
        ]),
        label: option.string.meta({ layout: { label: "Label" } }),
        iconUrl: option.string.meta({ layout: { label: "Icon URL" } }),
      }),
    ),
  }),

  option.object({
    type: option.literal("Attachment"),
    url: option.string.meta({
      layout: {
        placeholder: "https://example.com",
      },
    }),
  }),

  option.object({
    type: option.literal("Event"),
    title: option.string.meta({ layout: { label: "Title" } }),
    description: option.string.meta({
      layout: {
        label: "Description",
        inputType: "textarea",
      },
    }),
    start: option.string.meta({
      layout: {
        label: "Start Date",
        placeholder: "2025-01-01T00:00:00Z",
      },
    }),
    end: option.string.meta({
      layout: {
        label: "End Date",
        placeholder: "2025-01-01T08:00:00Z",
      },
    }),
    allDay: option.boolean.meta({ layout: { label: "All‑day Event" } }),
  }),

  option.object({
    type: option.literal("Horizontal Bar Chart"),
    total: option.number.meta({ layout: { label: "Global Total" } }),
    data: option
      .array(
        option.object({
          name: option.string.meta({ layout: { label: "Name" } }),
          value: option.number.meta({ layout: { label: "Total" } }),
          label: option.string.meta({ layout: { label: "Total label" } }),
        }),
      )
      .meta({
        layout: {
          itemLabel: "bar",
        },
      }),
  }),
]);

export const sendFeedEvent = createAction({
  name: "Send Feed Event",
  auth,
  options: option.object({
    categoryId: option.string.meta({ layout: { label: "Category ID" } }),

    // Card Content
    ribbonColor: option.string.meta({
      layout: {
        label: "Ribbon Color",
        placeholder: "#FF0000",
        accordion: "Card Content",
      },
    }),

    sections: option.array(sectionItem).meta({
      layout: {
        accordion: "Card Content",
        isOrdered: true,
      },
    }),

    // Options
    allowComments: option.boolean.meta({
      layout: {
        label: "Allow Comments",
        accordion: "Options",
      },
    }),
    allowReactions: option.boolean.meta({
      layout: {
        label: "Allow Reactions",
        accordion: "Options",
      },
    }),

    // Send to
    userIds: option.array(option.string).meta({
      layout: {
        label: "User IDs",
        accordion: "Send to",
      },
    }),
    groupIds: option.array(option.string).meta({
      layout: {
        label: "Group IDs",
        accordion: "Send to",
      },
    }),

    pushNotification: option
      .object({
        title: option.string.meta({
          layout: {
            label: "Title",
            accordion: "Push Notification",
          },
        }),
        text: option.string.meta({
          layout: {
            label: "Text",
            accordion: "Push Notification",
          },
        }),
      })
      .optional(),

    responseMapping: option
      .saveResponseArray(["Event ID"])
      .optional()
      .meta({
        layout: {
          accordion: "Save in variables",
        },
      }),
  }),
  getSetVariableIds: (o) =>
    o.responseMapping?.map((v) => v.variableId).filter(isDefined) ?? [],
});
