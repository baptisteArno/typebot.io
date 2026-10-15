import { signWebhookToken } from "@typebot.io/lib/signWebhookToken";
import { verifyWebhookToken } from "@typebot.io/lib/verifyWebhookToken";
import { Server } from "partyserver";

type Env = {
  PARTYKIT_DURABLE: DurableObjectNamespace<PartyKitDurable>;
  WEBHOOK_RELAY_SECRET?: string;
  // Set by `partykit env`, which prefixed every variable.
  "pkvar-WEBHOOK_RELAY_SECRET"?: string;
};

// Keeps the class and binding names created by `partykit deploy` so existing
// rooms resolve to the same Durable Objects.
export class PartyKitDurable extends Server<Env> {
  static override options = { hibernate: true };

  override async onRequest(request: Request) {
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405 });
    const secret = getSecret(this.env);
    const publication = await verifyWebhookToken(await request.text(), secret);
    if (
      !publication ||
      publication.purpose !== "publish" ||
      encodeURIComponent(publication.room) !== this.name ||
      publication.payload === undefined
    )
      return new Response("Unauthorized", { status: 401 });

    // Claim durably before delivery: a replay must never be re-signed for a
    // later wait. Transactions also serialize concurrent copies of a POST.
    const claimed = await this.ctx.storage.transaction(async (storage) => {
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
    let delivered = 0;
    for (const connection of this.getConnections()) {
      const subscription = await verifyWebhookToken(
        getToken(connection.uri),
        secret,
      );
      if (
        !subscription ||
        subscription.purpose !== "subscribe" ||
        encodeURIComponent(subscription.room) !== this.name
      ) {
        connection.close(1008, "Expired subscription");
        continue;
      }
      if (
        subscription.blockId !== publication.blockId ||
        (publication.waitNonce !== undefined &&
          subscription.nonce !== publication.waitNonce)
      )
        continue;
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
      delivered++;
    }
    if (delivered === 0)
      return new Response("No matching webhook listener; retry the callback", {
        status: 503,
      });
    return new Response("OK");
  }
}

export default {
  async fetch(request, env) {
    // PartySocket clients address `/parties/main/:room`. The room stays the raw
    // path segment, as PartyKit used it for `idFromName`.
    const [, prefix, party, room] = new URL(request.url).pathname.split("/");
    if (prefix !== "parties" || party !== "main" || !room)
      return new Response("Not found", { status: 404 });

    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      const claims = await verifyWebhookToken(
        getToken(request.url),
        getSecret(env),
      );
      if (
        !claims ||
        claims.purpose !== "subscribe" ||
        encodeURIComponent(claims.room) !== room
      )
        return new Response("Unauthorized", { status: 401 });
    }

    return env.PARTYKIT_DURABLE.getByName(room).fetch(request);
  },
} satisfies ExportedHandler<Env>;

const getToken = (url: string | null) =>
  url ? new URL(url).searchParams.get("token") : null;

const getSecret = (env: Env) =>
  env.WEBHOOK_RELAY_SECRET ?? env["pkvar-WEBHOOK_RELAY_SECRET"];
