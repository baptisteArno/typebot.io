import {
  handleStartChatPreview,
  handleStartTemplatePreviewChat,
  prisma,
  startPreviewChatInputSchema,
  startTemplatePreviewChatInputSchema,
  state,
} from "./fixture";

const victim = await prisma.chatSession.create({
  data: {
    state: {
      ...state,
      workspaceId: "synthetic-victim",
      victimMarker: "preserve me",
    },
    isReplying: true,
  },
});

Bun.serve({
  hostname: "127.0.0.1",
  port: 55440,
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET") {
      const currentVictim = await prisma.chatSession.findUniqueOrThrow({
        where: { id: victim.id },
      });
      return Response.json({
        description:
          "Worktree preview-session QA. Synthetic bot lookup, real engine and PostgreSQL. No application authentication.",
        victimIntact: JSON.stringify(currentVictim) === JSON.stringify(victim),
        victim: currentVictim,
        endpoints: ["POST /preview", "POST /template"],
        exampleBody: {
          typebotId: "synthetic-attacker-bot",
          sessionId: victim.id,
        },
      });
    }
    if (request.method !== "POST") return new Response(null, { status: 405 });
    try {
      const input = await request.json();
      if (path === "/preview")
        return Response.json(
          await handleStartChatPreview({
            input: startPreviewChatInputSchema.parse(input),
            context: { user: { id: "synthetic-attacker" } },
          }),
        );
      if (path === "/template")
        return Response.json(
          await handleStartTemplatePreviewChat({
            input: startTemplatePreviewChatInputSchema.parse(input),
          }),
        );
      return new Response(null, { status: 404 });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 400 });
    }
  },
});
console.log("Worktree QA API: http://localhost:55440");
