import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

await createJiti(import.meta.url, {
  jsx: { runtime: "automatic" },
  alias: {
    "next/server": fileURLToPath(new URL("./next-server.ts", import.meta.url)),
  },
}).import("./run.mts");
