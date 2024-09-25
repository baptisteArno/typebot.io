export type DialogueMessage = {
  role: "Dialogue";
  startsBy?: "user" | "assistant";
  dialogueVariableId?: string;
};

export type StandardMessage = {
  role: "user" | "assistant" | "system";
  content?: string;
};

export type Message = DialogueMessage | StandardMessage;
