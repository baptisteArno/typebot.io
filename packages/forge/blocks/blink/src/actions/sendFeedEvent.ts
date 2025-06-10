import { parseVideoUrl } from "@typebot.io/blocks-bubbles/video/helpers";
import { createAction, option } from "@typebot.io/forge";
import { extensionFromMimeType } from "@typebot.io/lib/extensionFromMimeType";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import ky, { HTTPError } from "ky";
import { auth } from "../auth";
import { baseUrl } from "../constants";

export const sectionItem = option.discriminatedUnion("type", [
  option.object({
    type: option.literal("Header"),
    title: option.string,
    iconUrl: option.string.layout({
      label: "Icon URL",
      placeholder: "https://example.com/icon.png",
    }),
  }),

  option.object({
    type: option.literal("Text"),
    value: option.string.layout({
      inputType: "textarea",
    }),
  }),

  option.object({
    type: option.literal("Labelled Text"),
    label: option.string.layout({ label: "Label" }),
    value: option.string.layout({
      label: "Value",
      inputType: "textarea",
    }),
    iconUrl: option.string.layout({
      label: "Icon URL",
      placeholder: "https://example.com/icon.png",
    }),
  }),

  option.object({
    type: option.literal("Image"),
    imageUrl: option.string.layout({
      placeholder: "https://example.com/image.jpg",
    }),
    fitImage: option.boolean.layout({ label: "Fit Image" }),
    width: option.number.layout({ label: "Width (px)", direction: "row" }),
    height: option.number.layout({ label: "Height (px)", direction: "row" }),
  }),

  option.object({
    type: option.literal("Image gallery"),
    imageUrls: option.array(option.string).layout({
      label: "URLs",
      itemLabel: "Image URL",
    }),
  }),

  option.object({
    type: option.literal("YouTube"),
    link: option.string.layout({
      placeholder: "i.e. https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }),
  }),

  option.object({
    type: option.literal("Link"),
    url: option.string.layout({ placeholder: "https://example.com" }),
    title: option.string.layout({ label: "Title" }),
    description: option.string.layout({ label: "Description" }),
    imageUrl: option.string.layout({ label: "Image URL" }),
    imagePlacement: option
      .enum(["left", "right", "top"])
      .layout({ label: "Image Placement", defaultValue: "left" }),
  }),

  option.object({
    type: option.literal("Buttons"),
    buttons: option.array(
      option.object({
        clientAction: option.discriminatedUnion("type", [
          option.object({
            type: option.literal("Open Link"),
            url: option.string.layout({ placeholder: "https://example.com" }),
          }),
          option.object({
            type: option.literal("Open Webview"),
            url: option.string.layout({
              placeholder: "https://example.com",
            }),
          }),
        ]),
        label: option.string.layout({ label: "Label" }),
        iconUrl: option.string.layout({ label: "Icon URL" }),
      }),
    ),
  }),

  option.object({
    type: option.literal("Attachment"),
    url: option.string.layout({
      placeholder: "https://example.com",
    }),
  }),

  option.object({
    type: option.literal("Event"),
    title: option.string.layout({ label: "Title" }),
    description: option.string.layout({
      label: "Description",
      inputType: "textarea",
    }),
    start: option.string.layout({
      label: "Start Date",
      placeholder: "2025-01-01T00:00:00Z",
    }),
    end: option.string.layout({
      label: "End Date",
      placeholder: "2025-01-01T08:00:00Z",
    }),
    allDay: option.boolean.layout({ label: "All‑day Event" }),
  }),

  option.object({
    type: option.literal("Horizontal Bar Chart"),
    total: option.number.layout({ label: "Global Total" }),
    data: option
      .array(
        option.object({
          name: option.string.layout({ label: "Name" }),
          value: option.number.layout({ label: "Total" }),
          label: option.string.layout({ label: "Total label" }),
        }),
      )
      .layout({
        itemLabel: "bar",
      }),
  }),
]);

export const sendFeedEvent = createAction({
  name: "Send Feed Event",
  auth,
  options: option.object({
    categoryId: option.string.layout({ label: "Category ID" }),

    // Card Content
    ribbonColor: option.string.layout({
      label: "Ribbon Color",
      placeholder: "#FF0000",
      accordion: "Card Content",
    }),

    sections: option.array(sectionItem).layout({
      accordion: "Card Content",
      isOrdered: true,
    }),

    // Options
    allowComments: option.boolean.layout({
      label: "Allow Comments",
      accordion: "Options",
    }),
    allowReactions: option.boolean.layout({
      label: "Allow Reactions",
      accordion: "Options",
    }),

    // Send to
    userIds: option.array(option.string).layout({
      label: "User IDs",
      accordion: "Send to",
    }),
    groupIds: option.array(option.string).layout({
      label: "Group IDs",
      accordion: "Send to",
    }),

    pushNotification: option
      .object({
        title: option.string.layout({
          label: "Title",
          accordion: "Push Notification",
        }),
        text: option.string.layout({
          label: "Text",
          accordion: "Push Notification",
        }),
      })
      .optional(),

    responseMapping: option.saveResponseArray(["Event ID"]).optional().layout({
      accordion: "Save in variables",
    }),
  }),
  getSetVariableIds: (o) =>
    o.responseMapping?.map((v) => v.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      if (!credentials?.apiKey) return logs.add("No API key provided.");

      if (!options.userIds && !options.groupIds)
        return logs.add("You must supply at least one user ID or group ID.");

      if (!options.sections || options.sections.length === 0)
        return logs.add("No card content provided.");

      const sections = (
        await Promise.all(
          options.sections.map(async (section) => {
            switch (section.type) {
              case "Header":
                return {
                  type: "header",
                  title: section.title,
                  icon_url: section.iconUrl,
                };

              case "Text":
                return {
                  type: "text",
                  value: section.value,
                  is_markdown: true,
                };

              case "Labelled Text":
                return {
                  type: "labelled_text",
                  label: section.label,
                  value: section.value,
                  icon_url: section.iconUrl,
                  is_markdown: true,
                };

              case "Image":
                return {
                  type: "image",
                  image_url: section.imageUrl,
                  fit_image: section.fitImage,
                  width: section.width,
                  height: section.height,
                };

              case "Image gallery":
                return {
                  type: "gallery",
                  data: section.imageUrls?.map((imageUrl) => ({
                    type: "gallery_image",
                    image_url: imageUrl,
                  })),
                };

              case "YouTube":
                if (!section.link) return;
                const { id } = parseVideoUrl(section.link);
                if (!id) return logs.add("Invalid YouTube URL.");
                return {
                  type: "youtube",
                  video_id: id,
                };

              case "Link":
                return {
                  type: "link",
                  title: section.title,
                  url: section.url,
                  subtitle: section.description,
                  image_url: section.imageUrl,
                  image_placement: section.imagePlacement,
                };

              case "Buttons":
                return {
                  type: "buttons",
                  data: section.buttons
                    ?.map((button) => {
                      if (!button.clientAction.url) return;
                      const encodedUrl = btoa(button.clientAction.url);
                      let clientAction = "";
                      if (button.clientAction.type === "Open Link")
                        clientAction = `blink:link?url=${encodedUrl}&action=open`;
                      if (button.clientAction.type === "Open Webview")
                        clientAction = `blink:webview?url=${encodedUrl}&action=open`;
                      return {
                        label: button.label,
                        client_action: clientAction,
                        icon_url: button.iconUrl,
                      };
                    })
                    .filter(isDefined),
                };

              case "Attachment": {
                if (!section.url) return;
                const { headers } = await ky.head(section.url);
                const extension =
                  extensionFromMimeType[headers.get("content-type") ?? ""];
                const fileName =
                  headers.get("content-disposition")?.split("filename=")[1] ??
                  section.url.split("/").pop();
                const fileSize = Number(headers.get("content-length"));
                if (!fileName || !extension || !fileSize || isNaN(fileSize))
                  return logs.add(
                    "Could not get proper file attachement metadata.",
                  );
                return {
                  type: "attachment",
                  file_name: fileName,
                  file_ext: extension,
                  file_size: fileSize,
                  download_url: section.url,
                  open_url: section.url,
                };
              }

              case "Event":
                return {
                  type: "event",
                  title: section.title,
                  start: section.start,
                  end: section.end,
                  subtitle: section.description,
                  all_day: section.allDay,
                };

              case "Horizontal Bar Chart":
                return {
                  type: "horizontal_bar_chart",
                  total_raw_value: section.total,
                  data: section.data?.map((d) => ({
                    name: d.name,
                    raw_value: d.value,
                    display_value: d.label,
                  })),
                };
            }
          }),
        )
      ).filter(isDefined);

      const payload = {
        body: {
          ribbon_color: options.ribbonColor,
          sections,
        },
        category: options.categoryId,
        user_ids: options.userIds,
        group_ids: options.groupIds,
        notification_title: options.pushNotification?.title,
        notification_text: options.pushNotification?.text,
        allow_comments: options.allowComments,
        allow_reactions: options.allowReactions,
      };

      try {
        const { data } = await ky
          .post(`${baseUrl}/feed/events`, {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
              "Content-Type": "application/json",
            },
            json: payload,
          })
          .json<{ data: { event_id: string } }>();

        options.responseMapping
          ?.filter((m): m is { variableId: string; item: "eventId" } =>
            isDefined(m.variableId),
          )
          .forEach((m) =>
            variables.set([{ id: m.variableId, value: data.event_id }]),
          );
      } catch (err: unknown) {
        if (err instanceof HTTPError) {
          logs.add(
            await parseUnknownError({
              err,
              context: "While sending Blink feed event",
            }),
          );
        } else if (err instanceof SyntaxError) {
          logs.add("Invalid JSON provided for the body.");
        } else {
          console.error(err);
          logs.add("Unexpected error. Check function logs for details.");
        }
      }
    },
  },
});
