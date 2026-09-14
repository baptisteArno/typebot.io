import { signWebhookToken } from "@typebot.io/lib/signWebhookToken";
import { verifyWebhookToken } from "@typebot.io/lib/verifyWebhookToken";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };
  constructor(readonly room: Party.Room) {}

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const claims = await verifyWebhookToken(
      new URL(request.url).searchParams.get("token"),
      getSecret(lobby.env),
    );
    if (
      !claims ||
      claims.purpose !== "subscribe" ||
      encodeURIComponent(claims.room) !== lobby.id
    )
      return new Response("Unauthorized", { status: 401 });
    return request;
  }

  async onRequest(request: Party.Request) {
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405 });
    const secret = getSecret(this.room.env);
    const publication = await verifyWebhookToken(await request.text(), secret);
    if (
      !publication ||
      publication.purpose !== "publish" ||
      encodeURIComponent(publication.room) !== this.room.id ||
      publication.payload === undefined
    )
      return new Response("Unauthorized", { status: 401 });

    // Claim durably before delivery: a replay must never be re-signed for a
    // later wait. Transactions also serialize concurrent copies of a POST.
    const claimed = await this.room.storage.transaction(async (storage) => {
      const publications = await storage.list<number>({
        prefix: "publication:",
      });
      const key = `publication:${publication.nonce}`;
      if (publications.has(key)) return false;
      const expired = [...publications]
        .filter(([, expiresAt]) => expiresAt <= Date.now())
        .map(([publicationKey]) => publicationKey);
      if (expired.length > 0) await storage.delete(expired);
      await storage.put(key, publication.expiresAt);
      return true;
    });
    if (!claimed)
      return new Response("Publication already used", { status: 409 });

    // Revalidate on delivery, including after hibernation and expiry.
    // Client WebSocket messages never publish data.
    for (const connection of this.room.getConnections()) {
      const subscription = await verifyWebhookToken(
        new URL(connection.uri).searchParams.get("token"),
        secret,
      );
      if (
        !subscription ||
        subscription.purpose !== "subscribe" ||
        encodeURIComponent(subscription.room) !== this.room.id
      ) {
        connection.close(1008, "Expired subscription");
        continue;
      }
      if (subscription.blockId !== publication.blockId) continue;
      connection.send(
        await signWebhookToken(
          {
            ...subscription,
            purpose: "response",
            payload: publication.payload,
          },
          secret,
        ),
      );
    }
    return new Response("OK");
  }
}

const getSecret = (env: Party.Lobby["env"]) =>
  typeof env.WEBHOOK_RELAY_SECRET === "string"
    ? env.WEBHOOK_RELAY_SECRET
    : undefined;

Server satisfies Party.Worker;
