import { createActionHandler, createFetcherHandler } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import { labelsFetcher, sendEmail } from "./actions/sendEmail";
import { buildEmail } from "./helpers/buildEmail";
import { createGmailClient } from "./helpers/createGmailClient";
import { parseFrom } from "./helpers/parseFrom";

export default [
  createFetcherHandler(sendEmail, labelsFetcher.id, async ({ credentials }) => {
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
  }),
  createActionHandler(sendEmail, {
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
  }),
];
