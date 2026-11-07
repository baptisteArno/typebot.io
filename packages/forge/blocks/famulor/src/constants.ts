export const defaultFamulorOrigin = "https://app.famulor.io";

export const famulorApiPath = "/api/v1";

export const famulorPageSize = 200;

export const famulorMaxPages = 5;

export const startCallResponseItems = ["Call ID", "Status"] as const;

export const getCallResponseItems = [
  "Status",
  "Transcript",
  "Summary",
  "Duration (seconds)",
  "Recording URL",
] as const;
