import type { BubbleProps } from "./features/bubble/components/Bubble";
import { hidePreviewMessage } from "./features/commands/utils/hidePreviewMessage";
import { setInputValue } from "./features/commands/utils/setInputValue";
import { setPrefilledVariables } from "./features/commands/utils/setPrefilledVariables";
import { showPreviewMessage } from "./features/commands/utils/showPreviewMessage";
import { toggle } from "./features/commands/utils/toggle";
import { unmount } from "./features/commands/utils/unmount";
import type { PopupProps } from "./features/popup/components/Popup";
import type { BotProps } from "./index";

export const initStandard = (props: BotProps & { id?: string }) => {
  const standardElement = props.id
    ? document.getElementById(props.id)
    : document.querySelector("typebot-standard");
  if (!standardElement)
    throw new Error("<typebot-standard> element not found.");
  Object.assign(standardElement, props);
};

export const initPopup = (props: PopupProps) => {
  const popupElement = document.createElement("typebot-popup");
  Object.assign(popupElement, props);
  document.body.prepend(popupElement);
};

export const initBubble = (props: BubbleProps) => {
  const bubbleElement = document.createElement("typebot-bubble");
  Object.assign(bubbleElement, props);
  document.body.prepend(bubbleElement);
};

type Typebot = {
  initStandard: typeof initStandard;
  initPopup: typeof initPopup;
  initBubble: typeof initBubble;
  close: typeof close;
  hidePreviewMessage: typeof hidePreviewMessage;
  open: typeof open;
  setPrefilledVariables: typeof setPrefilledVariables;
  showPreviewMessage: typeof showPreviewMessage;
  toggle: typeof toggle;
  setInputValue: typeof setInputValue;
  unmount: typeof unmount;
};

declare const window:
  | {
      Typebot: Typebot | undefined;
    }
  | undefined;

export const parseTypebot = () => ({
  initStandard,
  initPopup,
  initBubble,
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
  unmount,
});

export const injectTypebotInWindow = (typebot: Typebot) => {
  if (typeof window === "undefined") return;
  window.Typebot = { ...typebot };
};
