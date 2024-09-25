import { writeFileSync } from "fs";
import { generateOpenApiDocument } from "@typebot.io/trpc-openapi/generator";
import { publicRouter } from "./routers/publicRouter";

const openApiDocument = generateOpenApiDocument(publicRouter, {
  title: "Builder API",
  version: "1.0.0",
  baseUrl: "https://app.typebot.io/api",
  docsUrl: "https://docs.typebot.io/api-reference",
});

writeFileSync(
  "./openapi/builder.json",
  JSON.stringify(openApiDocument, null, 2),
);

process.exit();
