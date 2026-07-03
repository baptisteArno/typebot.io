import { writeFileSync } from "node:fs";
import { OpenAPIGenerator } from "@orpc/openapi";
import { appRouter } from "@/app/api/[[...rest]]/router";
import {
  openApiSchemaConverters,
  openApiSpecGenerateOptions,
} from "@/app/api/openApiSpecGenerateOptions";

writeFileSync(
  new URL("../../../docs/openapi/viewer.json", import.meta.url),
  JSON.stringify(
    await new OpenAPIGenerator({
      schemaConverters: openApiSchemaConverters,
    }).generate(appRouter, openApiSpecGenerateOptions),
    null,
    2,
  ),
);

process.exit(0);
