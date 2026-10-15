import { createActionHandler } from "@typebot.io/forge";
import type { VariableStore } from "@typebot.io/forge/types";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import { HTTPError } from "ky";
import { sendChatMessage } from "../actions/sendChatMessage";
import { createBlinkChatClient } from "../helpers/createBlinkChatClient";
import { parseUserIds } from "../helpers/parseUserIds";

export const sendChatMessageHandler = createActionHandler(sendChatMessage, {
  server: async ({ credentials, options, variables, logs }) => {
    const userIds = parseUserIds(options.userIds);
    const setNothingSentVariables = () =>
      setResultVariables({
        variables,
        responseMapping: options.responseMapping,
        sentCount: 0,
        notSentUserIds: userIds,
      });

    if (!credentials?.clientId || !credentials.clientSecret) {
      setNothingSentVariables();
      return logs.add(
        "Send Chat Message needs Blink credentials created from an App Identity (client ID and client secret).",
      );
    }

    if (userIds.length === 0) {
      setNothingSentVariables();
      return logs.add("No recipient user ID provided.");
    }

    const message = options.message?.trim();
    if (!message) {
      setNothingSentVariables();
      return logs.add("No message provided.");
    }

    let chatClient: Awaited<ReturnType<typeof createBlinkChatClient>>;
    try {
      chatClient = await createBlinkChatClient({
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
      });
    } catch (err) {
      setNothingSentVariables();
      return logs.add(
        await parseUnknownError({
          err,
          context: "While authenticating Blink App Identity",
        }),
      );
    }

    const sentUserIds = new Set<string>();
    let failedCount = 0;
    let firstError: unknown;
    for (const userId of userIds) {
      try {
        const chatId = await chatClient.openDirectChat(userId);
        await chatClient.sendMarkdownMessage({
          chatId,
          markdown: message,
          unfurlLinks: options.unfurlLinks ?? true,
        });
        sentUserIds.add(userId);
      } catch (err) {
        failedCount++;
        firstError ??= err;
        if (err instanceof HTTPError && err.response.status === 401) break;
      }
    }

    const notSentUserIds = userIds.filter((userId) => !sentUserIds.has(userId));
    const notAttemptedCount = notSentUserIds.length - failedCount;

    if (sentUserIds.size > 0)
      logs.add({
        status: "success",
        description: `Blink chat message sent to ${sentUserIds.size} of ${userIds.length} users.`,
      });

    if (firstError) {
      const parsedError = await parseUnknownError({
        err: firstError,
        context: `While sending Blink chat message (${failedCount} failed${notAttemptedCount > 0 ? `, ${notAttemptedCount} not attempted` : ""})`,
      });
      logs.add({
        ...parsedError,
        details: [
          parsedError.details,
          `Not sent to: ${notSentUserIds.join(", ")}`,
        ]
          .filter(isDefined)
          .join("\n\n"),
      });
    }

    setResultVariables({
      variables,
      responseMapping: options.responseMapping,
      sentCount: sentUserIds.size,
      notSentUserIds,
    });
  },
});

const setResultVariables = ({
  variables,
  responseMapping,
  sentCount,
  notSentUserIds,
}: {
  variables: VariableStore;
  responseMapping: { item?: string; variableId?: string }[] | undefined;
  sentCount: number;
  notSentUserIds: string[];
}) => {
  const variablesToSet = responseMapping
    ?.map((mapping) => {
      if (!mapping.variableId) return;
      if (mapping.item === "Sent count")
        return { id: mapping.variableId, value: sentCount };
      if (mapping.item === "Failed user IDs")
        return { id: mapping.variableId, value: notSentUserIds };
    })
    .filter(isDefined);

  if (variablesToSet && variablesToSet.length > 0)
    variables.set(variablesToSet);
};
