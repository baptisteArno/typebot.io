const assert = require("node:assert/strict");
const dns = require("node:dns");
const dnsPromises = require("node:dns/promises");
const net = require("node:net");
const tls = require("node:tls");
const { mock } = require("node:test");
const { execFileSync } = require("node:child_process");
const { env } = require("@typebot.io/env");
const {
  handleTestSmtpConfig,
  testSmtpConfigInputSchema,
} = require("../../apps/builder/src/features/blocks/integrations/sendEmail/api/handleTestSmtpConfig.ts");
const {
  resolveSmtpHost,
} = require("../../apps/builder/src/features/blocks/integrations/sendEmail/api/resolveSmtpHost.ts");

// Node, real Nodemailer and real local sockets. All DNS is synthetic. The only
// socket remapping is here, after asserting the actual production destination.
const run = async () => {
  let answers = ["93.184.216.34"];
  let lookups = 0;
  let rebindAfterLookup = false;
  let connections = 0;
  let received = 0;
  let expectedHost = "93.184.216.34";
  const originalConnect = net.connect;
  const originalLookup = dns.lookup;
  const originalTlsConnect = tls.connect;
  const sockets = new Set();
  const servers = [];
  // Disposable key/certificate stay in memory; no trust-store or file changes.
  const cert = execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      "/dev/stdout",
      "-out",
      "/dev/stdout",
      "-days",
      "1",
      "-subj",
      "/CN=smtp.example",
      "-addext",
      "subjectAltName=DNS:smtp.example",
    ],
    { stdio: ["ignore", "pipe", "ignore"] },
  );
  const key = cert;
  const secureContext = tls.createSecureContext({ key, cert });
  let fixturePort;
  let expectedServername = "smtp.example";
  const input = {
    host: "smtp.example",
    port: 2525,
    isTlsEnabled: false,
    username: "fixture",
    password: "fixture",
    from: { email: "sender@example.invalid" },
    to: "recipient@example.invalid",
  };
  const track = (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
    return socket;
  };
  const serve = (socket, starttls = false, greeting = true) => {
    track(socket);
    if (greeting) socket.write("220 fixture ESMTP\r\n");
    let buffer = "";
    let data = false;
    const onData = (chunk) => {
      buffer += chunk.toString();
      while (buffer.includes("\r\n")) {
        const end = buffer.indexOf("\r\n");
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (data) {
          if (line === ".") {
            data = false;
            received++;
            socket.write("250 captured locally\r\n");
          }
        } else if (/^EHLO|^HELO/.test(line))
          socket.write(
            `250-fixture\r\n${starttls ? "250-STARTTLS\r\n" : ""}250 AUTH PLAIN\r\n`,
          );
        else if (line === "STARTTLS" && starttls) {
          socket.removeListener("data", onData);
          socket.write("220 Upgrade\r\n");
          serve(
            new tls.TLSSocket(socket, { isServer: true, secureContext }),
            false,
            false,
          );
          return;
        } else if (/^AUTH PLAIN/.test(line))
          socket.write("235 authenticated\r\n");
        else if (/^MAIL FROM:|^RCPT TO:/.test(line)) socket.write("250 OK\r\n");
        else if (line === "DATA") {
          data = true;
          socket.write("354 End with dot\r\n");
        } else if (line === "QUIT") socket.end("221 Bye\r\n");
        else socket.write("500 Unsupported\r\n");
      }
    };
    socket.on("data", onData);
  };
  const listen = async (server) => {
    servers.push(server);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    return server.address().port;
  };
  mock.method(console, "error", () => {});
  mock.method(dnsPromises, "lookup", async (_hostname, options) => {
    lookups++;
    assert.equal(options.all, true);
    const result = answers.map((address) => ({
      address,
      family: net.isIP(address),
    }));
    if (rebindAfterLookup) answers = ["127.0.0.1"];
    return result;
  });
  // Nodemailer's own resolution/cache/fallback must never be entered.
  for (const method of ["resolve4", "resolve6"])
    mock.method(dns, method, () => {
      throw new Error("Unexpected second DNS resolution");
    });
  mock.method(dns, "lookup", (hostname, ...args) => {
    assert.equal(
      hostname,
      "127.0.0.1",
      "Only the local fixture may use dns.lookup",
    );
    return originalLookup(hostname, ...args);
  });
  mock.method(net, "connect", (options, callback) => {
    connections++;
    assert.equal(options.host, expectedHost);
    assert.equal(options.port, input.port);
    return originalConnect(
      {
        ...options,
        host: "127.0.0.1",
        port: fixturePort,
      },
      callback,
    );
  });
  mock.method(tls, "connect", (options, callback) => {
    assert.equal(options.servername, expectedServername);
    assert.notEqual(options.rejectUnauthorized, false);
    if (!options.socket) {
      connections++;
      assert.equal(options.host, expectedHost);
      assert.equal(options.port, input.port);
    }
    return originalTlsConnect(
      {
        ...options,
        ...(options.socket ? {} : { host: "127.0.0.1", port: fixturePort }),
        ca: cert,
      },
      callback,
    );
  });
  try {
    const plainPort = await listen(net.createServer((socket) => serve(socket)));
    fixturePort = plainPort;
    const blocked = [
      "127.0.0.1",
      "127.1",
      "2130706433",
      "0x7f000001",
      "0177.0.0.1",
      "localhost",
      "LOCALHOST.",
      "169.254.169.254",
      "metadata.google.internal",
      "metadata.google.internal.",
      "metadata.goog",
      "metadata",
      "10.0.0.1",
      "172.16.0.1",
      "192.168.0.1",
      "0.0.0.0",
      "100.100.100.200",
      "192.0.2.1",
      "224.0.0.1",
      "::1",
      "[::1]",
      "::ffff:127.0.0.1",
      "fe80::1",
      "fc00::1",
      "64:ff9b::a9fe:a9fe",
      "2002:7f00:1::",
      "smtp.example:25",
      "smtp.example/path",
      "user@smtp.example",
      "smtp.example#x",
      "",
      " smtp.example",
      "[fe80::1%lo0]",
    ];
    for (const host of blocked) {
      for (const isTlsEnabled of [false, true])
        await assert.rejects(
          handleTestSmtpConfig({ input: { ...input, host, isTlsEnabled } }),
          { code: "INTERNAL_SERVER_ERROR", message: "Failed to send email" },
        );
    }
    assert.equal(connections, 0);
    for (const addresses of [
      [],
      ["127.0.0.1"],
      ["93.184.216.34", "::1"],
      ["10.0.0.1", "93.184.216.34"],
      ["93.184.216.34", "169.254.169.254"],
      ["not-an-ip"],
    ]) {
      answers = addresses;
      await assert.rejects(handleTestSmtpConfig({ input }));
    }
    assert.equal(connections, 0);
    // Allowlisting never grants metadata, localhost or special ranges.
    env.SSRF_ALLOWED_HOSTS = ["smtp.example", ...blocked];
    for (const address of [
      "127.0.0.1",
      "169.254.169.254",
      "100.100.100.200",
      "fc00::1",
      "fe80::1",
      "::ffff:169.254.169.254",
    ]) {
      answers = [address];
      await assert.rejects(handleTestSmtpConfig({ input }));
    }
    assert.equal(connections, 0);
    for (const address of [
      "10.0.0.1",
      "172.16.0.1",
      "192.168.0.1",
      "::ffff:10.0.0.1",
    ]) {
      answers = [address];
      assert.equal((await resolveSmtpHost("SMTP.EXAMPLE.")).host, address);
    }
    expectedHost = "10.0.0.1";
    answers = [expectedHost];
    assert.equal(
      (await handleTestSmtpConfig({ input })).message,
      "Email sent!",
    );
    env.SSRF_ALLOWED_HOSTS = ["other.example"];
    await assert.rejects(handleTestSmtpConfig({ input }));
    env.SSRF_ALLOWED_HOSTS = [];
    expectedHost = "93.184.216.34";
    answers = [expectedHost, "2606:4700:4700::1111"];
    rebindAfterLookup = true;
    const lookupBefore = lookups;
    assert.equal(
      (await handleTestSmtpConfig({ input })).message,
      "Email sent!",
    );
    assert.equal(lookups, lookupBefore + 1);
    // Next invocation resolves afresh; a rebound name is blocked before connect.
    const beforeRebind = connections;
    await assert.rejects(handleTestSmtpConfig({ input }));
    assert.equal(connections, beforeRebind);
    rebindAfterLookup = false;
    answers = [expectedHost];
    fixturePort = await listen(
      tls.createServer({ key, cert }, (socket) => serve(socket)),
    );
    assert.equal(
      (await handleTestSmtpConfig({ input: { ...input, isTlsEnabled: true } }))
        .message,
      "Email sent!",
    );
    fixturePort = await listen(
      net.createServer((socket) => serve(socket, true)),
    );
    assert.equal(
      (await handleTestSmtpConfig({ input })).message,
      "Email sent!",
    );
    // A bad certificate name must still fail, even though the pinned IP connects.
    expectedServername = "wrong.example";
    await assert.rejects(
      handleTestSmtpConfig({ input: { ...input, host: expectedServername } }),
    );
    assert.equal(received, 4);
    // A failed connection must not fall back to the second DNS answer.
    expectedServername = "smtp.example";
    const closedServer = net.createServer();
    fixturePort = await listen(closedServer);
    await new Promise((resolve) => closedServer.close(resolve));
    for (const isTlsEnabled of [false, true]) {
      answers = [expectedHost, "2606:4700:4700::1111"];
      rebindAfterLookup = true;
      const beforeFailure = connections;
      const beforeLookup = lookups;
      await assert.rejects(
        handleTestSmtpConfig({ input: { ...input, isTlsEnabled } }),
      );
      assert.equal(connections, beforeFailure + 1);
      assert.equal(lookups, beforeLookup + 1);
    }
    rebindAfterLookup = false;
    for (const host of [
      "93.184.216.34",
      "2606:4700:4700::1111",
      "[2606:4700:4700::1111]",
    ])
      assert.equal(net.isIP((await resolveSmtpHost(host)).host) > 0, true);
    for (const port of [0, -1, 65536, 25.5, Infinity, NaN])
      assert.equal(
        testSmtpConfigInputSchema.safeParse({ ...input, port }).success,
        false,
      );
    for (const port of [1, 25, 465, 587, 2525, 65535])
      assert.equal(
        testSmtpConfigInputSchema.safeParse({ ...input, port }).success,
        true,
      );
    console.log(
      "SMTP policy, DNS pinning, SMTP, TLS, STARTTLS and certificate checks passed; 4 messages captured locally",
    );
  } finally {
    for (const socket of sockets) socket.destroy();
    await Promise.all(
      servers.map((server) => new Promise((resolve) => server.close(resolve))),
    );
    mock.restoreAll();
  }
};
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
