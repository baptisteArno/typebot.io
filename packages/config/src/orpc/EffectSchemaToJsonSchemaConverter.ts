import type { AnySchema } from "@orpc/contract";
import type {
  ConditionalSchemaConverter,
  JSONSchema,
  SchemaConvertOptions,
} from "@orpc/openapi";
import { Schema } from "effect";

export class EffectSchemaToJsonSchemaConverter
  implements ConditionalSchemaConverter
{
  condition(schema: AnySchema | undefined): boolean {
    return schema !== undefined && schema["~standard"].vendor === "effect";
  }

  convert(
    schema: AnySchema | undefined,
    _options: SchemaConvertOptions,
  ): [required: boolean, jsonSchema: JSONSchema] {
    if (!Schema.isSchema(schema))
      throw new Error(
        "Schemas with the effect vendor are expected to be Effect schemas",
      );
    const document = Schema.toJsonSchemaDocument(schema);
    return [
      true,
      Object.keys(document.definitions).length > 0
        ? { ...document.schema, $defs: document.definitions }
        : document.schema,
    ];
  }
}
