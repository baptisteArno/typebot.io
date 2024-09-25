/* eslint-disable @typescript-eslint/no-empty-function */
import { createIframe } from "../../iframe";
import type { PopupActions, PopupParams } from "../../types";
import "./style.css";

export const initPopup = (params: PopupParams): PopupActions => {
  if (document.readyState !== "complete") {
    window.addEventListener("load", () => initPopup(params));
    return { close: () => {}, open: () => {} };
  }
  const existingPopup = document.getElementById("typebot-popup");
  if (existingPopup) existingPopup.remove();
  const popupElement = createPopup(params);
  !document.body
    ? (window.onload = () => document.body.append(popupElement))
    : document.body.append(popupElement);
  return {
    open: () => openPopup(popupElement),
    close: () => closePopup(popupElement),
  };
};

const createPopup = (params: PopupParams): HTMLElement => {
  const { delay } = params;
  const overlayElement = createOverlayElement(delay);
  listenForOutsideClicks(overlayElement);
  const iframeElement = createIframe({
    ...params,
    loadWhenVisible: true,
  });
  overlayElement.appendChild(iframeElement);
  return overlayElement;
};

const createOverlayElement = (delay: number | undefined) => {
  const overlayElement = document.createElement("div");
  overlayElement.id = "typebot-popup";
  if (delay !== undefined) setShowTimeout(overlayElement, delay);
  return overlayElement;
};

export const openPopup = (popupElement: Element): void => {
  const iframe = popupElement.children[0] as HTMLIFrameElement;
  if (iframe.dataset.src) lazyLoadSrc(iframe);
  document.body.style.overflowY = "hidden";
  popupElement.classList.add("opened");
};

export const closePopup = (popupElement: Element): void => {
  document.body.style.overflowY = "auto";
  popupElement.classList.remove("opened");
};

export const isPopupOpened = (popupElement: Element): boolean =>
  popupElement.classList.contains("opened");

const listenForOutsideClicks = (popupElement: HTMLDivElement) =>
  popupElement.addEventListener("click", (e) => onPopupClick(e, popupElement));

const onPopupClick = (e: Event, popupElement: HTMLDivElement) => {
  e.preventDefault();
  const clickedElement = e.target as HTMLElement;
  if (clickedElement.tagName !== "iframe") closePopup(popupElement);
};

const setShowTimeout = (overlayElement: HTMLDivElement, delay: number) => {
  setTimeout(() => {
    openPopup(overlayElement);
  }, delay);
};

const lazyLoadSrc = (iframe: HTMLIFrameElement) => {
  iframe.src = iframe.dataset.src as string;
  iframe.removeAttribute("data-src");
};

export const getPopupActions = (
  popupElement?: HTMLDivElement,
): PopupActions => {
  const existingPopupElement =
    popupElement ??
    (document.querySelector("#typebot-popup") as HTMLDivElement);
  return {
    open: () => {
      openPopup(existingPopupElement);
    },
    close: () => {
      closePopup(existingPopupElement);
    },
  };
};
