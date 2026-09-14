// Loopback-only regression review harness. Executes this worktree's tests, never
// connects to a database or sends a WhatsApp message.
let running = false;
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 5216,
  async fetch(request) {
    if (new URL(request.url).pathname === "/")
      return new Response(
        "WhatsApp session access — worktree regression harness\n\nPOST /run to execute the synthetic negative and positive scenarios.\n\ncurl -X POST http://127.0.0.1:5216/run\n\nUses real handlers with mocked persistence, engine and providers. This is not a full viewer deployment or a Meta end-to-end test.\n",
      );
    if (request.method !== "POST" || new URL(request.url).pathname !== "/run")
      return new Response("Not found", { status: 404 });
    if (running) return new Response("Tests already running", { status: 409 });
    running = true;
    try {
      const process = Bun.spawn(
        ["bunx", "nx", "test-whatsapp-session-access", "--skipNxCache"],
        {
          cwd: new URL("../../", import.meta.url).pathname,
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(process.stdout).text(),
        new Response(process.stderr).text(),
        process.exited,
      ]);
      return new Response(`${stdout}\n${stderr}`, {
        status: exitCode === 0 ? 200 : 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } finally {
      running = false;
    }
  },
});
console.log(`Regression harness: ${server.url}`);
