import type { BotProps } from "./components/Bot";
import type { BubbleProps } from "./features/bubble/components/Bubble";
import type { PopupProps } from "./features/popup/components/Popup";

export const defaultBotProps: BotProps = {
  typebot: undefined,
  onNewInputBlock: undefined,
  onAnswer: undefined,
  onEnd: undefined,
  onInit: undefined,
  onNewLogs: undefined,
  isPreview: undefined,
  startFrom: undefined,
  prefilledVariables: undefined,
  apiHost: undefined,
  resultId: undefined,
  sessionId: undefined,
};

export const defaultPopupProps: PopupProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  autoShowDelay: undefined,
  isOpen: undefined,
  defaultOpen: undefined,
};

export const defaultBubbleProps: BubbleProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  previewMessage: undefined,
  onPreviewMessageClick: undefined,
  autoShowDelay: undefined,
};
