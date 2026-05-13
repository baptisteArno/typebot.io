export const ttsModels = ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"];
export const transcriptionModels = [
  "gpt-4o-transcribe",
  "gpt-4o-mini-transcribe",
  "gpt-4o-transcribe-diarize",
  "whisper-1",
];

export const openAIVoices = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;

export const models = [
  "gpt-5.4",
  "gpt-5.4-pro",
  "gpt-5.4-mini",
  "gpt-5.4-nano",
  "gpt-5.3-chat",
  "gpt-5.2-pro",
  "gpt-5.2",
  "gpt-5.1-chat",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4o",
  "gpt-4o-mini",
  "o3",
  "o4-mini",
  "o3-mini",
  "o1",
  "o1-mini",
];

export const modelsWithImageUrlSupport = [
  "gpt-5*",
  "gpt-4-turbo*",
  "gpt-4o*",
  "gpt-4*vision-preview",
];

export const excludedModelsFromImageUrlSupport = ["gpt-4-turbo-preview"];

export const defaultOpenAIOptions = {
  model: "gpt-4o-mini",
  voiceModel: "tts-1",
} as const;

export const maxToolCalls = 10;
