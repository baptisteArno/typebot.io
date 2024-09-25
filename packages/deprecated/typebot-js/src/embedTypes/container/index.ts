import { createIframe } from "../../iframe";
import type { IframeParams } from "../../types";

export const initContainer = (
  containerId: string,
  iframeParams: IframeParams,
): HTMLElement | undefined => {
  const { loadWhenVisible } = iframeParams;
  const containerElement = document.getElementById(containerId);
  if (!containerElement) return;
  if (containerElement.children[0])
    return containerElement.children[0] as HTMLIFrameElement;
  const lazy = loadWhenVisible ?? true;
  const iframeElement = createIframe({
    ...iframeParams,
    loadWhenVisible: lazy,
  });
  if (lazy) observeOnScroll(iframeElement);
  containerElement.appendChild(iframeElement);
  return iframeElement;
};

const observeOnScroll = (iframeElement: HTMLIFrameElement) => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.pop()?.isIntersecting === true) lazyLoadSrc(iframeElement);
    },
    { threshold: [0] },
  );
  observer.observe(iframeElement);
};

const lazyLoadSrc = (iframeElement: HTMLIFrameElement) => {
  if (!iframeElement.dataset.src) return;
  iframeElement.src = iframeElement.dataset.src;
  iframeElement.removeAttribute("data-src");
};
