import { Schema } from "effect";

const CustomAttributeValue = Schema.Union(
  Schema.String,
  Schema.JsonNumber,
  Schema.Boolean,
);

const CustomAttributesSchema = Schema.Record({
  key: Schema.String,
  value: CustomAttributeValue,
});

export const ContactCreateInputSchema = Schema.Struct({
  firstName: Schema.optional(Schema.String),
  lastName: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  phone: Schema.optional(Schema.String),
  customAttributes: Schema.optional(CustomAttributesSchema),
});
export type ContactCreateInput = typeof ContactCreateInputSchema.Type;
