/* eslint-disable @typescript-eslint/no-empty-function */
import {
  type BubbleActions,
  type BubbleParams,
  type ProactiveMessageParams,
  localStorageKeys,
} from "../../types";
import { createButton } from "./button";
import { closeIframe, createIframeContainer, openIframe } from "./iframe";
import {
  createProactiveMessage,
  openProactiveMessage,
} from "./proactiveMessage";
import "./style.css";

export const initBubble = (params: BubbleParams): BubbleActions => {
  if (document.readyState !== "complete") {
    window.addEventListener("load", () => initBubble(params));
    return { close: () => {}, open: () => {} };
  }
  const existingBubble = document.getElementById("typebot-bubble") as
    | HTMLDivElement
    | undefined;
  if (existingBubble) existingBubble.remove();
  const { bubbleElement, proactiveMessageElement } = createBubble(params);
  if (
    (params.autoOpenDelay || params.autoOpenDelay === 0) &&
    !hasBeenClosed()
  ) {
    setRememberCloseInStorage();
    setTimeout(() => openIframe(bubbleElement), params.autoOpenDelay);
  }
  !document.body
    ? (window.onload = () => document.body.appendChild(bubbleElement))
    : document.body.appendChild(bubbleElement);
  return getBubbleActions(bubbleElement, proactiveMessageElement);
};

const createBubble = (
  params: BubbleParams,
): {
  bubbleElement: HTMLDivElement;
  iframeElement: HTMLIFrameElement;
  proactiveMessageElement?: HTMLDivElement;
} => {
  const bubbleElement = document.createElement("div");
  bubbleElement.id = "typebot-bubble";
  const buttonElement = createButton(params.button);
  bubbleElement.appendChild(buttonElement);
  const proactiveMessageElement =
    params.proactiveMessage && !hasBeenClosed()
      ? addProactiveMessage(params.proactiveMessage, bubbleElement)
      : undefined;
  const iframeElement = createIframeContainer(params);
  buttonElement.addEventListener("click", () => {
    iframeElement.style.display === "none"
      ? openIframe(bubbleElement)
      : closeIframe(bubbleElement);
  });
  if (proactiveMessageElement)
    proactiveMessageElement.addEventListener("click", () =>
      onProactiveMessageClick(bubbleElement, iframeElement),
    );
  bubbleElement.appendChild(iframeElement);
  return { bubbleElement, proactiveMessageElement, iframeElement };
};

const onProactiveMessageClick = (
  bubble: HTMLDivElement,
  iframe: HTMLIFrameElement,
): void => {
  iframe.style.display === "none" ? openIframe(bubble) : closeIframe(bubble);
  bubble.classList.remove("message-opened");
};

export const getBubbleActions = (
  bubbleElement?: HTMLDivElement,
  proactiveMessageElement?: HTMLDivElement,
): BubbleActions => {
  const existingBubbleElement =
    bubbleElement ??
    (document.querySelector("#typebot-bubble") as HTMLDivElement | undefined);
  if (!existingBubbleElement) return { close: () => {}, open: () => {} };
  const existingProactiveMessage =
    proactiveMessageElement ??
    document.querySelector("#typebot-bubble .proactive-message");
  return {
    openProactiveMessage: existingProactiveMessage
      ? () => {
          openProactiveMessage(existingBubbleElement);
        }
      : undefined,
    open: () => {
      openIframe(existingBubbleElement);
    },
    close: () => {
      closeIframe(existingBubbleElement);
    },
  };
};

const addProactiveMessage = (
  proactiveMessage: ProactiveMessageParams,
  bubbleElement: HTMLDivElement,
) => {
  const proactiveMessageElement = createProactiveMessage(
    proactiveMessage,
    bubbleElement,
  );
  bubbleElement.appendChild(proactiveMessageElement);
  return proactiveMessageElement;
};

const hasBeenClosed = () => {
  const closeDecisionFromStorage = localStorage.getItem(
    localStorageKeys.rememberClose,
  );
  return closeDecisionFromStorage ? true : false;
};

export const setRememberCloseInStorage = () =>
  localStorage.setItem(localStorageKeys.rememberClose, "true");
