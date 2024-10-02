import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  };

  constructor(readonly room: Party.Room) {}

  async onRequest(request: Party.Request) {
    if (request.method === "POST") {
      const payload = await request.json<unknown>();
      if (typeof payload !== "object")
        return new Response("Invalid payload, please send JSON body", {
          status: 400,
        });
      this.room.broadcast(JSON.stringify({ data: payload }));
      return new Response("OK");
    }

    return new Response("Method not allowed", { status: 405 });
  }
}

Server satisfies Party.Worker;
