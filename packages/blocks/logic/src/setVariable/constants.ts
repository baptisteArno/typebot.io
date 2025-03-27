import type { SetVariableBlock } from "./schema";

export const valueTypes = [
  "Custom",
  "Empty",
  "Append value(s)",
  "Environment name",
  "Device type",
  "Transcript",
  "User ID",
  "Result ID",
  "Now",
  "Today",
  "Yesterday",
  "Tomorrow",
  "Random ID",
  "Moment of the day",
  "Map item with same index",
  "Pop",
  "Shift",
  "Phone number",
  "Contact name",
  "Referral Click ID",
  "Referral Source ID",
] as const;

export const valueTypesWithNoOptions = [
  "Today",
  "Moment of the day",
  "Empty",
  "Environment name",
  "User ID",
  "Result ID",
  "Random ID",
  "Phone number",
  "Contact name",
  "Transcript",
  "Referral Click ID",
  "Referral Source ID",
  "Device type",
] as const satisfies (typeof valueTypes)[number][];

export const hiddenTypes = ["Today", "User ID"] as const;

export const sessionOnlySetVariableOptions = ["Transcript"] as const;

export const defaultSetVariableOptions = {
  type: "Custom",
  isExecutedOnClient: false,
  isCode: false,
} as const satisfies SetVariableBlock["options"];

export const whatsAppSetVariableTypes = [
  "Phone number",
  "Contact name",
  "Referral Click ID",
  "Referral Source ID",
] as const satisfies (typeof valueTypes)[number][];
