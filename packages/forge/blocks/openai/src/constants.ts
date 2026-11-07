export const ttsModels = ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"];
export const transcriptionModels = [
  "gpt-transcribe",
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
  "gpt-6-astra",
  "gpt-6.1-sol",
  "gpt-6.1-terra",
  "gpt-6-luna",
  "gpt-6-sol",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "gpt-5.5",
  "gpt-5.5-pro",
  "gpt-5.4",
  "gpt-5.4-pro",
  "gpt-5.4-mini",
  "gpt-5.4-nano",
  "gpt-5.2",
  "gpt-5.2-pro",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4o",
  "gpt-4o-mini",
  "o3",
];

// Pro models only support the Responses API, and GPT-6 models need it for tool calling.
export const chatCompletionModels = models.filter(
  (model) => !model.startsWith("gpt-6") && !model.endsWith("-pro"),
);

export const modelsWithImageUrlSupport = [
  "gpt-6*",
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
