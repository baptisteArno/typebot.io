import { Effect } from "effect";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { Redacted } from "effect";

export interface MarkMessageAsReadInput {
  readonly phoneNumberId: string;
  readonly messageId: string;
  readonly accessToken: Redacted.Redacted<string>;
}

export const markMessageAsRead = (
  input: MarkMessageAsReadInput
): Effect.Effect<void, Error, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    
    const response = yield* client.execute(
      HttpClientRequest.post(
        `https://graph.facebook.com/v18.0/${input.phoneNumberId}/messages`
      ).pipe(
        HttpClientRequest.setHeader("Authorization", `Bearer ${Redacted.value(input.accessToken)}`),
        HttpClientRequest.setHeader("Content-Type", "application/json"),
        HttpClientRequest.bodyJson({
          messaging_product: "whatsapp",
          status: "read",
          message_id: input.messageId,
        })
      )
    );

    if (response.status < 200 || response.status >= 300) {
      return yield* Effect.fail(
        new Error(`Failed to mark message as read: HTTP ${response.status}`)
      );
    }

    return void 0;
  });
