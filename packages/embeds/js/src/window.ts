import type { BubbleProps } from "./features/bubble/components/Bubble";
import * as commands from "./features/commands";
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

export const parseTypebot = () => ({
  initStandard,
  initPopup,
  initBubble,
  ...commands,
});

type Typebot = ReturnType<typeof parseTypebot>;

declare const window:
  | {
      Typebot: Typebot;
    }
  | undefined;

export const injectTypebotInWindow = (typebot: Typebot) => {
  if (typeof window === "undefined") return;
  window.Typebot = { ...typebot };
};
