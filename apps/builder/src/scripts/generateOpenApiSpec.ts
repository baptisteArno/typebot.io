import { writeFileSync } from "node:fs";
import { OpenAPIGenerator } from "@orpc/openapi";
import {
  openApiSchemaConverters,
  openApiSpecGenerateOptions,
} from "@/app/api/openApiSpecGenerateOptions";
import { appRouter } from "@/app/api/router";

writeFileSync(
  new URL("../../../docs/openapi/builder.json", import.meta.url),
  JSON.stringify(
    await new OpenAPIGenerator({
      schemaConverters: openApiSchemaConverters,
    }).generate(appRouter, openApiSpecGenerateOptions),
    null,
    2,
  ),
);

process.exit(0);
