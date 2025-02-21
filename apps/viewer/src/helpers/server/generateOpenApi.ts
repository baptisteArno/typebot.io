import { writeFileSync } from "fs";
import { generateOpenApiDocument } from "@typebot.io/trpc-openapi/generator";
import { appRouter } from "./appRouter";

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Chat API",
  version: "3.0.0",
  baseUrl: "https://zazubot.com/api",
  docsUrl: "https://docs.zazubot.com/api-reference",
});

writeFileSync(
  "./openapi/viewer.json",
  JSON.stringify(openApiDocument, null, 2),
);

process.exit();
