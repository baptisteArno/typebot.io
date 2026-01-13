import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { convertSchemasListToCommonSchemas } from "./convertSchemasListToCommonSchemas";

describe("convertSchemasListToCommonSchemas", () => {
  describe("discriminated unions", () => {
    it("should extract schemas from a discriminated union on type field", () => {
      const textSchema = z.object({
        type: z.literal("text"),
        content: z.string(),
      });
      const imageSchema = z.object({
        type: z.literal("image"),
        url: z.string(),
      });
      const unionSchema = z.discriminatedUnion("type", [
        textSchema,
        imageSchema,
      ]);

      const result = convertSchemasListToCommonSchemas(unionSchema);

      expect(Object.keys(result)).toContain("Text");
      expect(Object.keys(result)).toContain("Image");
      expect(result["Text"]?.schema).toBe(textSchema);
      expect(result["Image"]?.schema).toBe(imageSchema);
    });

    it("should handle version-based discriminants", () => {
      const v5Schema = z.object({ version: z.literal("5"), data: z.string() });
      const v6Schema = z.object({ version: z.literal("6"), data: z.string() });
      const unionSchema = z.discriminatedUnion("version", [v5Schema, v6Schema]);

      const result = convertSchemasListToCommonSchemas(unionSchema);

      expect(Object.keys(result)).toContain("V5");
      expect(Object.keys(result)).toContain("V6");
    });

    it("should convert kebab-case type to PascalCase", () => {
      const schema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("my-block-type") }),
      ]);

      const result = convertSchemasListToCommonSchemas(schema);

      expect(Object.keys(result)).toContain("MyBlockType");
    });
  });

  describe("regular unions", () => {
    it("should extract schemas from a regular union with type literals", () => {
      const textSchema = z.object({ type: z.literal("text") });
      const imageSchema = z.object({ type: z.literal("image") });
      const unionSchema = z.union([textSchema, imageSchema]);

      const result = convertSchemasListToCommonSchemas(unionSchema);

      expect(Object.keys(result)).toContain("Text");
      expect(Object.keys(result)).toContain("Image");
    });

    it("should extract schemas from a union with id literals", () => {
      const blockA = z.object({ id: z.literal("block-a") });
      const blockB = z.object({ id: z.literal("block-b") });
      const unionSchema = z.union([blockA, blockB]);

      const result = convertSchemasListToCommonSchemas(unionSchema);

      expect(Object.keys(result)).toContain("BlockA");
      expect(Object.keys(result)).toContain("BlockB");
    });
  });

  describe("nested structures", () => {
    it("should recursively extract nested unions from object properties", () => {
      const blockSchema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("text") }),
        z.object({ type: z.literal("image") }),
      ]);
      const groupSchema = z.object({ blocks: z.array(blockSchema) });
      const typebotSchema = z.object({ groups: z.array(groupSchema) });

      const result = convertSchemasListToCommonSchemas(typebotSchema);

      expect(Object.keys(result)).toContain("Text");
      expect(Object.keys(result)).toContain("Image");
    });

    it("should handle deeply nested discriminated unions", () => {
      const itemSchema = z.discriminatedUnion("itemType", [
        z.object({ itemType: z.literal("button") }),
        z.object({ itemType: z.literal("link") }),
      ]);
      const blockSchema = z.object({
        type: z.literal("choice"),
        items: z.array(itemSchema),
      });

      const result = convertSchemasListToCommonSchemas(blockSchema);

      expect(Object.keys(result)).toContain("Button");
      expect(Object.keys(result)).toContain("Link");
    });

    it("should handle nested unions inside discriminated union options", () => {
      const innerUnion = z.discriminatedUnion("subType", [
        z.object({ subType: z.literal("a") }),
        z.object({ subType: z.literal("b") }),
      ]);
      const outerUnion = z.discriminatedUnion("type", [
        z.object({ type: z.literal("outer"), nested: innerUnion }),
      ]);

      const result = convertSchemasListToCommonSchemas(outerUnion);

      expect(Object.keys(result)).toContain("Outer");
      expect(Object.keys(result)).toContain("A");
      expect(Object.keys(result)).toContain("B");
    });
  });

  describe("wrapper types", () => {
    it("should unwrap optional schemas", () => {
      const innerUnion = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }),
        z.object({ type: z.literal("b") }),
      ]);
      const schema = z.object({ field: innerUnion.optional() });

      const result = convertSchemasListToCommonSchemas(schema);

      expect(Object.keys(result)).toContain("A");
      expect(Object.keys(result)).toContain("B");
    });

    it("should unwrap nullable schemas", () => {
      const innerUnion = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }),
      ]);
      const schema = z.object({ field: innerUnion.nullable() });

      const result = convertSchemasListToCommonSchemas(schema);

      expect(Object.keys(result)).toContain("A");
    });

    it("should unwrap preprocess/effects schemas", () => {
      const innerUnion = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }),
      ]);
      const schema = z.preprocess((val) => val, innerUnion);

      const result = convertSchemasListToCommonSchemas(schema);

      expect(Object.keys(result)).toContain("A");
    });

    it("should unwrap default schemas", () => {
      const innerUnion = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }),
      ]);
      const schema = z.object({
        field: innerUnion.default({ type: "a" as const }),
      });

      const result = convertSchemasListToCommonSchemas(schema);

      expect(Object.keys(result)).toContain("A");
    });
  });

  describe("edge cases", () => {
    it("should handle max depth to prevent infinite recursion", () => {
      const schema = z.object({ type: z.literal("node") });
      const result = convertSchemasListToCommonSchemas(schema, { maxDepth: 5 });
      expect(result).toBeDefined();
    });

    it("should return empty object for primitive schemas", () => {
      const result = convertSchemasListToCommonSchemas(z.string());
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("should not duplicate schemas with same key", () => {
      const textSchema = z.object({ type: z.literal("text") });
      const unionSchema = z.discriminatedUnion("type", [textSchema]);
      const schema = z.object({
        first: unionSchema,
        second: unionSchema,
      });

      const result = convertSchemasListToCommonSchemas(schema);

      expect(Object.keys(result).filter((k) => k === "Text")).toHaveLength(1);
    });

    it("should handle empty object schema", () => {
      const result = convertSchemasListToCommonSchemas(z.object({}));
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("should handle array of primitives", () => {
      const schema = z.object({ items: z.array(z.string()) });
      const result = convertSchemasListToCommonSchemas(schema);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });
});
