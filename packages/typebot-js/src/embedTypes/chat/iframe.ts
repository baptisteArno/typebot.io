import { createIframe } from "../../iframe";
import { IframeParams } from "../../types";

export const createIframeContainer = (
  params: IframeParams
): HTMLIFrameElement => {
  const iframe = createIframe({ ...params, loadWhenVisible: true });
  return iframe;
};

export const openIframe = (
  bubble: HTMLDivElement,
  iframe: HTMLIFrameElement
): void => {
  loadTypebotIfFirstOpen(iframe);
  bubble.classList.add("iframe-opened");
  bubble.classList.remove("message-opened");
};

export const closeIframe = (bubble: HTMLDivElement): void => {
  bubble.classList.remove("iframe-opened");
};

export const loadTypebotIfFirstOpen = (iframe: HTMLIFrameElement): void => {
  if (!iframe.dataset.src) return;
  iframe.src = iframe.dataset.src;
  iframe.removeAttribute("data-src");
};
