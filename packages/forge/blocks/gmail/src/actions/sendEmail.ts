import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined, isNotEmpty } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { buildEmail } from "../helpers/buildEmail";
import { createGmailClient } from "../helpers/createGmailClient";
import { parseFrom } from "../helpers/parseFrom";

export const sendEmail = createAction({
  auth,
  name: "Send email",
  options: option.object({
    to: option.string.layout({
      label: "To",
    }),
    subject: option.string.layout({
      label: "Subject",
    }),
    body: option.string.layout({
      label: "Body",
      inputType: "textarea",
    }),
    attachments: option.string.layout({
      inputType: "variableDropdown",
      label: "Attachments",
      moreInfoTooltip:
        "File URLs to attach. Note: Gmail has a 25MB total attachment limit.",
    }),
    label: option.string.layout({
      label: "Label",
      fetcher: "fetchLabels",
      withVariableButton: false,
      accordion: "Advanced configuration",
    }),
    from: option.string.layout({
      label: "From",
      accordion: "Advanced configuration",
      placeholder: "John Doe <john.doe@gmail.com>",
    }),
    threadId: option.string.layout({
      label: "Thread ID",
      accordion: "Advanced configuration",
      moreInfoTooltip:
        "If provided, the email will be sent as a reply of that specified thread.",
    }),
    replyTo: option.string.layout({
      label: "Reply to",
      accordion: "Advanced configuration",
      placeholder: "john.doe@gmail.com",
      moreInfoTooltip:
        "If provided, the reply to this email will be set to the provided email address",
      isHidden: ({ threadId }) => isNotEmpty(threadId),
    }),
    responseMapping: option.saveResponseArray(["Thread ID"]).layout({
      accordion: "Save response",
    }),
  }),
  fetchers: [
    {
      id: "fetchLabels",
      dependencies: [],
      fetch: async ({ credentials }) => {
        if (!credentials)
          return {
            data: [],
          };

        try {
          const gmailClient = createGmailClient(credentials.accessToken);

          const response = await gmailClient.users.labels.list({
            userId: "me",
          });

          return {
            data:
              response.data.labels
                ?.filter((label) => label.type === "user")
                .map((label) => ({
                  value: label.id ?? "",
                  label: label.name ?? "",
                })) ?? [],
          };
        } catch (err) {
          const parsedError = await parseUnknownError({
            err,
            context: "While fetching Gmail labels",
          });
          return {
            error: parsedError,
          };
        }
      },
    },
  ],
  getSetVariableIds: (options) =>
    options.responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({ credentials, options, logs, variables }) => {
      if (!credentials.accessToken) {
        logs.add("No access token available");
        return;
      }
      const gmailClient = createGmailClient(credentials.accessToken);

      const attachmentsVariableValue = options.attachments
        ? variables.get(options.attachments)
        : undefined;
      const attachmentUrls = Array.isArray(attachmentsVariableValue)
        ? attachmentsVariableValue
        : attachmentsVariableValue
          ? [attachmentsVariableValue]
          : undefined;

      try {
        const from = await parseFrom(options.from, {
          accessToken: credentials.accessToken,
        });

        const email = await buildEmail({
          to: options.to,
          from,
          subject: options.subject,
          body: options.body,
          attachmentUrls: attachmentUrls?.filter(isDefined),
        });

        // Gmail expects the message in base64 **URL-safe** form
        const encodedEmail = email
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const message = await gmailClient.users.messages.send({
          userId: "me",
          requestBody: {
            threadId: options.threadId,
            raw: encodedEmail,
          },
        });

        if (options.label && message.data.id) {
          try {
            await gmailClient.users.messages.modify({
              userId: "me",
              id: message.data.id,
              requestBody: {
                addLabelIds: [options.label],
              },
            });
          } catch (labelError) {
            console.error(labelError);
            logs.add(`Failed to apply label: ${labelError}`);
          }
        }

        options.responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;

          const item = mapping.item ?? "Message ID";
          if (item === "Message ID")
            variables.set([{ id: mapping.variableId, value: message.data.id }]);

          if (item === "Thread ID")
            variables.set([
              { id: mapping.variableId, value: message.data.threadId },
            ]);
        });
      } catch (error) {
        const parsedError = await parseUnknownError({
          err: error,
          context: "While sending email with Gmail",
        });
        logs.add(parsedError);
      }
    },
  },
});
