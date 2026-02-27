import { Schema } from "effect";

export const Email = Schema.String.pipe(Schema.brand("Email"));
export type Email = typeof Email.Type;

export const Name = Schema.String.pipe(Schema.brand("Name"));
export type Name = typeof Name.Type;

export const PhoneNumber = Schema.String.pipe(Schema.brand("PhoneNumber"));
export type PhoneNumber = typeof PhoneNumber.Type;

export const Icon = Schema.String.pipe(Schema.brand("Icon"));
export type Icon = typeof Icon.Type;
