import { expect, it } from "bun:test";

it("guards real Nodemailer connections under Node", async () => {
  const build = await Bun.build({
    entrypoints: [
      new URL(
        "../../../../../../../../tests/smtp/connectionProbe.cjs",
        import.meta.url,
      ).pathname,
    ],
    target: "node",
    format: "cjs",
    plugins: [
      {
        name: "isolated-smtp-env",
        setup(builder) {
          builder.onResolve({ filter: /^@typebot\.io\/env$/ }, () => ({
            path: "env",
            namespace: "smtp-fixture",
          }));
          builder.onLoad({ filter: /.*/, namespace: "smtp-fixture" }, () => ({
            contents:
              'export const env = { NODE_ENV: "development", SSRF_ALLOWED_HOSTS: [] };',
            loader: "js",
          }));
        },
      },
    ],
  });
  expect(build.success, build.logs.join("\n")).toBe(true);
  const subprocess = Bun.spawn(["node", "--input-type=commonjs"], {
    stdin: new Blob([await build.outputs[0].text()]),
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    subprocess.exited,
    new Response(subprocess.stdout).text(),
    new Response(subprocess.stderr).text(),
  ]);
  expect(exitCode, stderr).toBe(0);
  expect(stdout).toContain("4 messages captured locally");
}, 30_000);
