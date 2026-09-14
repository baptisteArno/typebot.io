import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

// Generated fixture only: no application .env, database or production identity.
const directory = resolve("test-results/auth-redirect-app");
await mkdir(`${directory}/app/api/auth/[...nextauth]`, { recursive: true });
await mkdir(`${directory}/app/[[...path]]`, { recursive: true });
const bundle = await Bun.build({
  entrypoints: ["apps/builder/src/features/auth/components/SignInForm.tsx"],
  target: "browser",
  external: [
    "react",
    "react/jsx-runtime",
    "next/navigation",
    "next-auth/react",
    "nuqs",
  ],
  plugins: [
    {
      name: "presentation-only-fixtures",
      setup(build) {
        build.onResolve(
          {
            filter:
              /^(@tolgee\/react|@typebot.io\/ui\/|@\/|\.\/(DividerWithText|SignInError|SocialLoginButtons))/,
          },
          ({ path }) => ({ path, namespace: "fixture" }),
        );
        build.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => {
          const name = path.split("/").at(-1);
          const contents =
            path === "@tolgee/react"
              ? "export const useTranslate = () => ({t: key => key});"
              : name === "toast"
                ? "export const toast = () => {};"
                : name === "cn"
                  ? 'export const cn = (...values) => values.filter(Boolean).join(" ");'
                  : `import {createElement} from "react"; const Part = ({children}) => createElement("div", null, children); export const ${name} = Object.assign(Part, {Root:Part, Group:Part, Slot:Part, Label:Part, Title:Part, Description:Part});`;
          return { contents, loader: "js", resolveDir: process.cwd() };
        });
      },
    },
  ],
});
if (!bundle.success) throw new AggregateError(bundle.logs);
await Bun.write(
  `${directory}/form.js`,
  `"use client";\n${await bundle.outputs[0].text()}`,
);
await Bun.write(`${directory}/package.json`, JSON.stringify({ private: true }));
await Bun.write(
  `${directory}/next.config.mjs`,
  `export default { devIndicators: false, experimental: { externalDir: true } };`,
);
await Bun.write(
  `${directory}/app/layout.jsx`,
  `export default function Layout({children}) { return <html><body>{children}</body></html>; }`,
);
await Bun.write(
  `${directory}/app/[[...path]]/page.jsx`,
  `
"use client";
import {SessionProvider, signIn, signOut, useSession} from "next-auth/react";
import {NuqsAdapter} from "nuqs/adapters/next/app";
import {usePathname} from "next/navigation";
import {SignInForm} from "../../form";
function Fixture() {
  const pathname = usePathname();
  const {status} = useSession();
  return <main><h1>Local auth redirect review</h1><p>Session: {status}</p>
    <button onClick={() => signIn("credentials", {redirect:false})}>Sign in synthetic user</button>
    <button onClick={() => signOut({redirect:false})}>Sign out</button>
    {pathname === "/signin" ? <SignInForm/> : <p>Internal destination: {pathname}</p>}
  </main>;
}
export default function Page() { return <SessionProvider><NuqsAdapter><Fixture/></NuqsAdapter></SessionProvider>; }
`,
);
await Bun.write(
  `${directory}/app/api/auth/[...nextauth]/route.js`,
  `
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
const {handlers} = NextAuth({
  secret: "disposable-local-redirect-fixture-secret", trustHost: true,
  providers: [Credentials({authorize: async () => ({id:"synthetic", name:"Synthetic", email:"synthetic@example.test"})})],
});
export const {GET, POST} = handlers;
`,
);
const proxyBundle = await Bun.build({
  entrypoints: ["apps/builder/src/proxy.ts"],
  target: "node",
  external: ["next/server"],
  plugins: [
    {
      name: "local-env",
      setup(build) {
        build.onResolve({ filter: /^@typebot.io\/env$/ }, () => ({
          path: "env",
          namespace: "fixture",
        }));
        build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents:
            'export const env = {NEXTAUTH_URL:"http://localhost:5298"};',
          loader: "js",
        }));
      },
    },
  ],
});
if (!proxyBundle.success) throw new AggregateError(proxyBundle.logs);
await Bun.write(
  `${directory}/builder-proxy.js`,
  await proxyBundle.outputs[0].text(),
);
await Bun.write(
  `${directory}/proxy.js`,
  'export { proxy } from "./builder-proxy"; export const config = { matcher: ["/typebots"] };',
);
const child = Bun.spawn(
  [
    "node",
    Bun.resolveSync("next/dist/bin/next", process.cwd()),
    "dev",
    directory,
    "--webpack",
    "--hostname",
    "127.0.0.1",
    "--port",
    "5298",
  ],
  {
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODE_ENV: "development",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdout: "inherit",
    stderr: "inherit",
  },
);
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
process.exit(await child.exited);
