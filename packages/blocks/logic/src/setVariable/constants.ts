import type { SetVariableBlock } from "./schema";

export const valueTypes = [
  "Custom",
  "Empty",
  "Append value(s)",
  "Environment name",
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
] as const;

export const hiddenTypes = ["Today", "User ID"] as const;

export const sessionOnlySetVariableOptions = ["Transcript"] as const;

export const defaultSetVariableOptions = {
  type: "Custom",
  isExecutedOnClient: false,
  isCode: false,
} as const satisfies SetVariableBlock["options"];
