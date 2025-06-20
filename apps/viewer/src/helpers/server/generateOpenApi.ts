import { writeFileSync } from "fs";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "./appRouter";

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Chat API",
  version: "3.0.0",
  baseUrl: "https://typebot.io/api",
  docsUrl: "https://docs.typebot.io/api-reference",
});

writeFileSync(
  "./openapi/viewer.json",
  JSON.stringify(openApiDocument, null, 2),
);

process.exit();
