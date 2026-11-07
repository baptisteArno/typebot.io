export const formatTranscript = (call: {
  structured_transcript?: string | null;
  transcript?: unknown;
}) => {
  if (isNotBlank(call.structured_transcript)) return call.structured_transcript;

  const transcript = call.transcript;
  if (Array.isArray(transcript))
    return transcript.map(formatTranscriptTurn).filter(isNotBlank).join("\n");

  if (isRecord(transcript) && Array.isArray(transcript.items))
    return transcript.items
      .map(formatTranscriptTurn)
      .filter(isNotBlank)
      .join("\n");

  return "";
};

const speakerLabel = (role: unknown) => {
  if (role === "assistant") return "ai";
  if (role === "user") return "human";
  return "";
};

const formatTranscriptTurn = (turn: unknown) => {
  if (!isRecord(turn)) return "";
  if (turn.type && turn.type !== "message") return "";

  const role = speakerLabel(turn.role);
  const content = flattenTranscriptContent(turn.content);
  if (!role || !content) return "";
  return `${role}: ${content}`;
};

const flattenTranscriptContent = (content: unknown): string => {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content))
    return content.map(flattenTranscriptContent).filter(isNotBlank).join(" ");
  if (isRecord(content) && typeof content.text === "string")
    return content.text.trim();
  return "";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNotBlank = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
