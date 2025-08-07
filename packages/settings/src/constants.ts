import type { Settings } from "./schemas";

export const defaultSettings = {
  general: {
    isInputPrefillEnabled: false,
    isHideQueryParamsEnabled: true,
    isNewResultOnRefreshEnabled: true,
    rememberUser: {
      isEnabled: false,
      storage: "session",
    },
    isBrandingEnabled: false,
    isTypingEmulationEnabled: true,
  },
  typingEmulation: {
    enabled: true,
    speed: 400,
    maxDelay: 3,
    delayBetweenBubbles: 0,
    isDisabledOnFirstMessage: true,
  },
  metadata: {
    description:
      "Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.",
    favIconUrl: (viewerBaseUrl: string) => viewerBaseUrl + "/favicon.svg",
    imageUrl: (viewerBaseUrl: string) => viewerBaseUrl + "/site-preview.png",
  },
} as const;

export const maxTypingEmulationMaxDelay = 5;

export const defaultSystemMessages = {
  invalidMessage: "Invalid message. Please, try again.",
  botClosed: "This bot is now closed",
  networkErrorTitle: "Network Error",
  networkErrorMessage: "Please check your internet connection and try again.",
  popupBlockedTitle: "Popup blocked",
  popupBlockedDescription:
    "The bot wants to open a new tab but it was blocked by your browser. It needs a manual approval.",
  popupBlockedButtonLabel: "Continue in new tab",
  fileUploadError: "An error occured while uploading the files",
  fileUploadSizeError: "[[file]] is larger than [[limit]]MB",
  whatsAppPictureChoiceSelectLabel: "Select",
} as const satisfies NonNullable<Settings["general"]>["systemMessages"];

export const defaultSessionExpiryTimeout = 4;

export const rememberUserStorages = ["session", "local"] as const;
