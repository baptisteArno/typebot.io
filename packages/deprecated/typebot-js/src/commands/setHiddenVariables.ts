import type { IframeParams } from "../types";

export const setHiddenVariables = (
  hiddenVariables: IframeParams["hiddenVariables"],
) => {
  const existingIframe = document.querySelector(".typebot-iframe") as
    | HTMLIFrameElement
    | undefined;
  if (!existingIframe) return;
  const existingUrl =
    existingIframe.getAttribute("data-src") || existingIframe.src;
  const existingHiddenVariables = new URLSearchParams(
    existingUrl.split("?")[1],
  );
  const existingQueryObj: { [key: string]: string } = {};
  existingHiddenVariables.forEach((value, key) => {
    existingQueryObj[key] = value;
  });
  const isLoadWhenVisible = existingIframe.hasAttribute("data-src");
  const iframeUrl = `${existingUrl.split("?")[0]}${parseQueryParams({
    ...existingQueryObj,
    ...hiddenVariables,
  })}`;
  existingIframe.setAttribute(
    isLoadWhenVisible ? "data-src" : "src",
    iframeUrl,
  );
};

export const parseQueryParams = (starterVariables?: {
  [key: string]: string | undefined;
}): string => {
  return parseStarterVariables(starterVariables);
};

const parseStarterVariables = (starterVariables?: {
  [key: string]: string | undefined;
}) =>
  starterVariables && Object.keys(starterVariables).length > 0
    ? `?${Object.keys(starterVariables)
        .filter((key) => starterVariables[key])
        .map(
          (key) =>
            `${key}=${encodeURIComponent(starterVariables[key] as string)}`,
        )
        .join("&")}`
    : "";
