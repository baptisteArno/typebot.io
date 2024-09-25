import { createIframe } from "../../iframe";
import type { IframeParams } from "../../types";

export const createIframeContainer = (
  params: IframeParams,
): HTMLIFrameElement => {
  const iframe = createIframe({ ...params, loadWhenVisible: true });
  iframe.style.display = "none";
  return iframe;
};

export const openIframe = (bubble: Element): void => {
  const iframe = bubble.querySelector(".typebot-iframe") as HTMLIFrameElement;
  loadTypebotIfFirstOpen(iframe);
  iframe.style.display = "flex";
  setTimeout(() => bubble.classList.add("iframe-opened"), 50);
  bubble.classList.remove("message-opened");
};

export const closeIframe = (bubble: Element): void => {
  const iframe = bubble.querySelector(".typebot-iframe") as HTMLIFrameElement;
  bubble.classList.remove("iframe-opened");
  setTimeout(() => (iframe.style.display = "none"), 550);
};

export const loadTypebotIfFirstOpen = (iframe: HTMLIFrameElement): void => {
  if (!iframe.dataset.src) return;
  iframe.src = iframe.dataset.src;
  iframe.removeAttribute("data-src");
};

export const isIframeOpened = (bubble: Element): boolean =>
  bubble.classList.contains("iframe-opened");
